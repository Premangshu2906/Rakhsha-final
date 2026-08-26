import random
import string
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Complaint, AIAssessment, AuditLog
from app.schemas import ComplaintCreate, ComplaintResponse
from app.ai.pipeline import get_ai_analyzer
from app.ai.stt_service import stt_service

router = APIRouter(prefix="/complaints", tags=["Public Complaints Intake"])

def generate_ref_id() -> str:
    random_digits = "".join(random.choices(string.digits, k=5))
    return f"NHAA-2026-{random_digits}"

def generate_tracking_token() -> str:
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TOK-{random_str}"

@router.post("/submit", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Public Endpoint: Submit a new text or voice complaint to NHAA 14566.
    Triggers immediate AI Stress & Trauma Assessment, assigns initial risk score & level,
    generates structured summary, logs initial audit trail, and issues tracking reference.
    """
    ref_id = generate_ref_id()
    token = generate_tracking_token()

    # 1. Run AI Assessment Engine
    ai_engine = get_ai_analyzer()
    ai_res = ai_engine.analyze_complaint(payload.raw_input_text, payload.category)

    # 2. Persist Complaint
    complaint = Complaint(
        reference_id=ref_id,
        tracking_token=token,
        complainant_type=payload.complainant_type,
        complainant_name=payload.complainant_name if payload.complainant_type != "ANONYMOUS" else "Anonymous",
        complainant_phone=payload.complainant_phone if payload.complainant_type != "ANONYMOUS" else None,
        complainant_email=payload.complainant_email if payload.complainant_type != "ANONYMOUS" else None,
        state_region=payload.state_region,
        category=payload.category,
        input_mode=payload.input_mode,
        raw_input_text=payload.raw_input_text,
        voice_file_path=payload.voice_file_path,
        voice_duration_seconds=payload.voice_duration_seconds,
        status="NEW",
        priority=ai_res["priority_recommended"],
        risk_level=ai_res["risk_classification"],
        risk_score=ai_res["distress_score"]
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # 3. Persist AI Assessment
    assessment = AIAssessment(
        complaint_id=complaint.id,
        distress_score=ai_res["distress_score"],
        urgency_score=ai_res["urgency_score"],
        risk_classification=ai_res["risk_classification"],
        priority_recommended=ai_res["priority_recommended"],
        identified_indicators=ai_res["identified_indicators"],
        key_phrases=ai_res["key_phrases"],
        sentiment_breakdown=ai_res["sentiment_breakdown"],
        ai_case_summary=ai_res["ai_case_summary"],
        recommended_actions=ai_res["recommended_actions"],
        model_version=ai_res["model_version"],
        disclaimer_notice=ai_res["disclaimer_notice"]
    )
    db.add(assessment)

    # 4. Audit Log Entry
    audit = AuditLog(
        complaint_id=complaint.id,
        actor_name="NHAA AI Intake Engine",
        action="CREATED",
        details=f"Complaint created via {payload.input_mode}. Initial AI Risk: {ai_res['risk_classification']} (Score: {ai_res['distress_score']}/100)."
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)

    return complaint


@router.post("/transcribe")
async def transcribe_voice(
    voice_transcript: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Public Endpoint: Speech-to-text service provider abstraction.
    Accepts live browser Web Speech API text or uploaded audio blob and converts to clean transcript.
    """
    file_bytes = None
    file_name = None
    if file:
        file_bytes = await file.read()
        file_name = file.filename

    try:
        result = stt_service.transcribe_audio_payload(
            raw_text_transcript=voice_transcript,
            audio_file_name=file_name,
            audio_bytes=file_bytes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/track/{reference_id}", response_model=ComplaintResponse)
def track_complaint(reference_id: str, token: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Public Endpoint: Track complaint progress using Reference ID and optional security token.
    Anonymizes internal officer notes while returning general status and safety advisory.
    """
    complaint = db.query(Complaint).filter(Complaint.reference_id == reference_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint reference ID not found.")
    
    if token and complaint.tracking_token != token:
        raise HTTPException(status_code=403, detail="Invalid tracking token provided for this complaint.")

    return complaint


@router.get("/helplines")
def get_emergency_helplines():
    """
    Returns verified Indian national emergency and distress helpline resources.
    """
    return {
        "helplines": [
            {"name": "NHAA Helpline", "number": "14566", "description": "National Helpline for Action Against Abuse"},
            {"name": "National Emergency Number", "number": "112", "description": "All-in-one Police, Fire & Ambulance response"},
            {"name": "Tele-MANAS Mental Health", "number": "14416", "description": "24/7 Government Tele-Mental Health Assistance"},
            {"name": "Women Helpline (NCW)", "number": "1091", "description": "National Commission for Women Emergency Line"},
            {"name": "Childline India", "number": "1098", "description": "24/7 Helpline for Children in Distress"}
        ],
        "disclaimer": "If you are in immediate life-threatening physical danger, please call 112 or 14566 immediately."
    }
