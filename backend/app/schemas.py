import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_info: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str = "OFFICER"
    badge_number: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Complaint Input Schema
class ComplaintCreate(BaseModel):
    complainant_type: str = Field("VICTIM", description="VICTIM, THIRD_PARTY, ANONYMOUS")
    complainant_name: Optional[str] = None
    complainant_phone: Optional[str] = None
    complainant_email: Optional[str] = None
    state_region: str = Field("Delhi NCR", description="State or Region in India")
    category: str = Field("DOMESTIC_ABUSE", description="DOMESTIC_ABUSE, HARASSMENT, TRAFFICKING, CYBER_CRIME, PHYSICAL_ASSAULT, OTHER")
    input_mode: str = Field("TEXT", description="TEXT, VOICE, HYBRID")
    raw_input_text: str = Field(..., min_length=5, description="Full text description of complaint/distress")
    voice_file_path: Optional[str] = None
    voice_duration_seconds: Optional[int] = None

# AI Assessment Schema
class AIAssessmentResponse(BaseModel):
    id: int
    complaint_id: int
    distress_score: float
    urgency_score: float
    risk_classification: str # LOW, MODERATE, HIGH
    priority_recommended: str # NORMAL, URGENT, CRITICAL
    identified_indicators: List[str]
    key_phrases: List[str]
    sentiment_breakdown: Dict[str, Any]
    ai_case_summary: str
    recommended_actions: List[str]
    model_version: str
    disclaimer_notice: str
    human_override: bool
    override_reason: Optional[str] = None
    assessed_at: datetime.datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    complaint_id: int
    actor_user_id: Optional[int]
    actor_name: str
    action: str
    details: str
    ip_address: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Follow Up Schema
class FollowUpCreate(BaseModel):
    scheduled_date: datetime.datetime
    notes: Optional[str] = None

class FollowUpResponse(BaseModel):
    id: int
    complaint_id: int
    assigned_officer_id: Optional[int]
    scheduled_date: datetime.datetime
    status: str
    notes: Optional[str]
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True

# Full Complaint Response Schema
class ComplaintResponse(BaseModel):
    id: int
    reference_id: str
    tracking_token: str
    complainant_type: str
    complainant_name: Optional[str]
    complainant_phone: Optional[str]
    complainant_email: Optional[str]
    state_region: str
    category: str
    input_mode: str
    raw_input_text: str
    voice_file_path: Optional[str]
    voice_duration_seconds: Optional[int]
    status: str
    priority: str
    risk_level: str
    risk_score: float
    officer_notes: Optional[str]
    assigned_officer_id: Optional[int]
    citizen_comment: Optional[str] = None
    citizen_comment_at: Optional[datetime.datetime] = None
    feedback_rating: Optional[str] = None
    feedback_comment: Optional[str] = None
    feedback_at: Optional[datetime.datetime] = None
    submitted_at: datetime.datetime
    updated_at: datetime.datetime
    ai_assessment: Optional[AIAssessmentResponse] = None
    follow_ups: List[FollowUpResponse] = []

    class Config:
        from_attributes = True

# Citizen 15h Enquiry Comment Input
class CitizenCommentSubmit(BaseModel):
    comment: str = Field(..., min_length=2, description="Enquiry comment regarding delayed resolution")

# Citizen Post-Resolution Feedback Input
class FeedbackSubmit(BaseModel):
    rating: str = Field(..., description="SATISFIED or NOT_SATISFIED")
    comment: Optional[str] = None

# Complaint Update / Override Schema
class ComplaintUpdate(BaseModel):
    status: Optional[str] = None # NEW, IN_REVIEW, ACTION_REQUIRED, ESCALATED, RESOLVED, CLOSED
    priority: Optional[str] = None # NORMAL, URGENT, CRITICAL
    risk_level: Optional[str] = None # LOW, MODERATE, HIGH
    officer_notes: Optional[str] = None
    override_reason: Optional[str] = None

# Stats Response
class DashboardStats(BaseModel):
    total_complaints: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    urgent_priority_count: int
    action_required_count: int
    resolved_count: int
    category_breakdown: Dict[str, int]
