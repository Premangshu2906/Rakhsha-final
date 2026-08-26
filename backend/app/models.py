import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="OFFICER")  # OFFICER, ADMIN, SUPERVISOR
    full_name = Column(String, nullable=False)
    badge_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaints = relationship("Complaint", back_populates="assigned_officer")
    follow_ups = relationship("FollowUpSchedule", back_populates="assigned_officer")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String, unique=True, index=True, nullable=False) # e.g. NHAA-2026-89123
    tracking_token = Column(String, unique=True, index=True, nullable=False)
    
    complainant_type = Column(String, default="VICTIM") # VICTIM, THIRD_PARTY, ANONYMOUS
    complainant_name = Column(String, nullable=True)
    complainant_phone = Column(String, nullable=True)
    complainant_email = Column(String, nullable=True)
    state_region = Column(String, default="Delhi NCR")
    
    category = Column(String, default="DOMESTIC_ABUSE") # DOMESTIC_ABUSE, HARASSMENT, TRAFFICKING, CYBER_CRIME, PHYSICAL_ASSAULT, OTHER
    input_mode = Column(String, default="TEXT") # TEXT, VOICE, HYBRID
    raw_input_text = Column(Text, nullable=False)
    voice_file_path = Column(String, nullable=True)
    voice_duration_seconds = Column(Integer, nullable=True)
    
    status = Column(String, default="NEW") # NEW, IN_REVIEW, ACTION_REQUIRED, ESCALATED, RESOLVED, CLOSED
    priority = Column(String, default="NORMAL") # NORMAL, URGENT, CRITICAL
    risk_level = Column(String, default="LOW") # LOW, MODERATE, HIGH
    risk_score = Column(Float, default=0.0) # 0.0 - 100.0
    
    officer_notes = Column(Text, nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    assigned_officer = relationship("User", back_populates="complaints")
    ai_assessment = relationship("AIAssessment", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUpSchedule", back_populates="complaint", cascade="all, delete-orphan")


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, unique=True)
    
    distress_score = Column(Float, default=0.0) # 0.0 - 100.0
    urgency_score = Column(Float, default=0.0) # 0.0 - 100.0
    risk_classification = Column(String, default="LOW") # LOW, MODERATE, HIGH
    priority_recommended = Column(String, default="NORMAL") # NORMAL, URGENT, CRITICAL
    
    identified_indicators = Column(JSON, default=list) # List of strings e.g. ['Immediate Physical Threat', 'Severe Mental Distress']
    key_phrases = Column(JSON, default=list) # Extracted key trigger phrases
    sentiment_breakdown = Column(JSON, default=dict) # {"negative": 0.85, "distress_level": "High"}
    
    ai_case_summary = Column(Text, nullable=False)
    recommended_actions = Column(JSON, default=list) # List of advisory action points for human officer
    
    model_version = Column(String, default="NHAA-RuleEngine-v1.0")
    disclaimer_notice = Column(String, default="Advisory AI assessment only. Does not constitute medical/psychological diagnosis.")
    
    human_override = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    
    assessed_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="ai_assessment")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String, default="System / AI Module")
    
    action = Column(String, nullable=False) # CREATED, AI_ASSESSED, STATUS_CHANGED, RISK_OVERRIDDEN, NOTE_ADDED, FOLLOWUP_SCHEDULED
    details = Column(Text, nullable=False)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")


class FollowUpSchedule(Base):
    __tablename__ = "follow_up_schedules"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(String, default="PENDING") # PENDING, COMPLETED, OVERDUE, CANCELLED
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    complaint = relationship("Complaint", back_populates="follow_ups")
    assigned_officer = relationship("User", back_populates="follow_ups")
