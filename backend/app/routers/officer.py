import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models import Complaint, AIAssessment, AuditLog, FollowUpSchedule, User
from app.schemas import (
    ComplaintResponse, ComplaintUpdate, DashboardStats, 
    AuditLogResponse, FollowUpCreate, FollowUpResponse
)
from app.utils.seed_data import seed_database

router = APIRouter(prefix="/officer", tags=["Officer Triage & Case Management"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Officer Dashboard Overview KPI Counters and Category Metrics.
    """
    total = db.query(Complaint).count()
    high_risk = db.query(Complaint).filter(Complaint.risk_level == "HIGH").count()
    mod_risk = db.query(Complaint).filter(Complaint.risk_level == "MODERATE").count()
    low_risk = db.query(Complaint).filter(Complaint.risk_level == "LOW").count()
    urgent_prio = db.query(Complaint).filter(Complaint.priority.in_(["URGENT", "CRITICAL"])).count()
    action_req = db.query(Complaint).filter(Complaint.status.in_(["NEW", "ACTION_REQUIRED", "ESCALATED"])).count()
    resolved = db.query(Complaint).filter(Complaint.status == "RESOLVED").count()

    # Category Breakdown
    cat_counts = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
    category_breakdown = {cat: count for cat, count in cat_counts}

    return DashboardStats(
        total_complaints=total,
        high_risk_count=high_risk,
        moderate_risk_count=mod_risk,
        low_risk_count=low_risk,
        urgent_priority_count=urgent_prio,
        action_required_count=action_req,
        resolved_count=resolved,
        category_breakdown=category_breakdown
    )


@router.get("/complaints", response_model=List[ComplaintResponse])
def get_complaints(
    risk_level: Optional[str] = Query(None, description="Filter by LOW, MODERATE, HIGH"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by NEW, IN_REVIEW, ACTION_REQUIRED, ESCALATED, RESOLVED, CLOSED"),
    priority: Optional[str] = Query(None, description="Filter by NORMAL, URGENT, CRITICAL"),
    search: Optional[str] = Query(None, description="Search by ref ID, complainant name, or text snippet"),
    urgent_only: bool = Query(False, description="If true, returns only high-risk / urgent queue cases"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Paginated officer complaint list with search and multi-dimensional filtering.
    """
    query = db.query(Complaint)

    if urgent_only:
        query = query.filter(or_(Complaint.risk_level == "HIGH", Complaint.priority.in_(["URGENT", "CRITICAL"])))
    if risk_level:
        query = query.filter(Complaint.risk_level == risk_level)
    if category:
        query = query.filter(Complaint.category == category)
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Complaint.reference_id.ilike(search_term),
                Complaint.complainant_name.ilike(search_term),
                Complaint.raw_input_text.ilike(search_term),
                Complaint.state_region.ilike(search_term)
            )
        )

    # Order by risk score descending (highest risk first) and submitted date
    complaints = query.order_by(Complaint.risk_score.desc(), Complaint.submitted_at.desc()).offset(offset).limit(limit).all()
    return complaints


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_detail(complaint_id: int, db: Session = Depends(get_db)):
    """
    Fetch comprehensive complaint details including full AI assessment, key indicators, audit logs, and follow-ups.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/complaints/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdate,
    officer_username: str = Query("officer_sharma"),
    db: Session = Depends(get_db)
):
    """
    Officer Action: Update complaint status, priority, notes, or override AI risk level.
    Immutably records every change in the Audit Log table.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer = db.query(User).filter(User.username == officer_username).first()

    changes = []
    if payload.status and payload.status != complaint.status:
        changes.append(f"Status changed from '{complaint.status}' to '{payload.status}'")
        complaint.status = payload.status

    if payload.priority and payload.priority != complaint.priority:
        changes.append(f"Priority changed from '{complaint.priority}' to '{payload.priority}'")
        complaint.priority = payload.priority

    if payload.risk_level and payload.risk_level != complaint.risk_level:
        old_risk = complaint.risk_level
        complaint.risk_level = payload.risk_level
        changes.append(f"HUMAN OVERRIDE: Risk level changed from '{old_risk}' to '{payload.risk_level}'")
        
        # Mark AI Assessment as overridden
        if complaint.ai_assessment:
            complaint.ai_assessment.human_override = True
            complaint.ai_assessment.override_reason = payload.override_reason or "Human officer manual triage override."

    if payload.officer_notes:
        complaint.officer_notes = payload.officer_notes
        changes.append("Officer review notes updated")

    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Record Audit Log
    if changes:
        audit_details = "; ".join(changes)
        if payload.override_reason:
            audit_details += f" (Reason: {payload.override_reason})"

        audit = AuditLog(
            complaint_id=complaint.id,
            actor_user_id=officer.id if officer else None,
            actor_name=officer.full_name if officer else "Inspector Priya Sharma",
            action="STATUS_CHANGED" if not payload.risk_level else "RISK_OVERRIDDEN",
            details=audit_details
        )
        db.add(audit)
        db.commit()

    db.refresh(complaint)
    return complaint


@router.post("/complaints/{complaint_id}/follow-up", response_model=FollowUpResponse)
def schedule_follow_up(
    complaint_id: int,
    payload: FollowUpCreate,
    officer_username: str = Query("officer_sharma"),
    db: Session = Depends(get_db)
):
    """
    Officer Action: Schedule follow-up monitoring for ongoing cases.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer = db.query(User).filter(User.username == officer_username).first()

    follow_up = FollowUpSchedule(
        complaint_id=complaint.id,
        assigned_officer_id=officer.id if officer else None,
        scheduled_date=payload.scheduled_date,
        status="PENDING",
        notes=payload.notes
    )
    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)

    # Audit Trail
    audit = AuditLog(
        complaint_id=complaint.id,
        actor_user_id=officer.id if officer else None,
        actor_name=officer.full_name if officer else "Inspector Priya Sharma",
        action="FOLLOWUP_SCHEDULED",
        details=f"Follow-up scheduled for {payload.scheduled_date.strftime('%Y-%m-%d %H:%M UTC')}. Notes: {payload.notes or 'None'}"
    )
    db.add(audit)
    db.commit()

    return follow_up


@router.get("/complaints/{complaint_id}/audit-trail", response_model=List[AuditLogResponse])
def get_audit_trail(complaint_id: int, db: Session = Depends(get_db)):
    """
    Fetch full immutable audit trail for legal compliance and accountability.
    """
    logs = db.query(AuditLog).filter(AuditLog.complaint_id == complaint_id).order_by(AuditLog.timestamp.desc()).all()
    return logs


@router.post("/seed-demo")
def reseed_demo_data(db: Session = Depends(get_db)):
    """
    Utility Endpoint for SIH Judges: Re-seeds the database with fresh evaluation cases.
    """
    # Delete existing records in reverse FK order
    db.query(FollowUpSchedule).delete()
    db.query(AuditLog).delete()
    db.query(AIAssessment).delete()
    db.query(Complaint).delete()
    db.query(User).delete()
    db.commit()

    seed_database(db)
    return {"message": "Database re-seeded successfully with realistic NHAA demo cases!"}
