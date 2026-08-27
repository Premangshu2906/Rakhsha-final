import datetime
import uuid
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import User, Complaint, AIAssessment, AuditLog, FollowUpSchedule
from app.ai.pipeline import get_ai_analyzer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first() is not None:
        return

    print("Seeding database with realistic NHAA 14566 demo cases...")

    # 1. Create Sole Authorized Officer
    officer1 = User(
        username="pc@gmail.com",
        email="pc@gmail.com",
        password_hash=hash_password("1234"),
        role="OFFICER",
        full_name="Duty Officer PC",
        badge_number="NHAA-OFF-101"
    )
    db.add(officer1)
    db.commit()
    db.refresh(officer1)

    ai_engine = get_ai_analyzer()

    # 2. Seed Cases Dataset
    seed_complaints_data = [
        {
            "reference_id": "NHAA-2026-89101",
            "tracking_token": "TOK-89101-SEC",
            "complainant_type": "VICTIM",
            "complainant_name": "Anjali Verma",
            "complainant_phone": "+91 98765 43210",
            "complainant_email": "anjali.v@example.com",
            "state_region": "Delhi NCR",
            "category": "DOMESTIC_ABUSE",
            "input_mode": "VOICE",
            "raw_input_text": "Help me! My husband has locked me inside the kitchen and is beating me severely. He threatened to burn me with kerosene if I call anyone. My 4-year-old child is crying in fear. I am terrified for my life right now!",
            "voice_file_path": "/audio_samples/distress_call_01.wav",
            "voice_duration_seconds": 24,
            "status": "NEW",
            "assigned_officer_id": officer1.id,
            "submitted_time_delta_mins": 10
        },
        {
            "reference_id": "NHAA-2026-89102",
            "tracking_token": "TOK-89102-SEC",
            "complainant_type": "THIRD_PARTY",
            "complainant_name": "Rohan Gupta (Neighbor)",
            "complainant_phone": "+91 91234 56789",
            "complainant_email": "rohan.neighbor@example.com",
            "state_region": "Maharashtra",
            "category": "TRAFFICKING",
            "input_mode": "TEXT",
            "raw_input_text": "A young woman in my apartment complex has been locked inside for 3 days. I can hear her screaming and crying for help. She whispered through the balcony that her passport was seized, her phone was taken, and she is being forced into illegal labor. Please send police immediately.",
            "voice_file_path": None,
            "voice_duration_seconds": None,
            "status": "IN_REVIEW",
            "assigned_officer_id": officer1.id,
            "submitted_time_delta_mins": 45
        },
        {
            "reference_id": "NHAA-2026-89103",
            "tracking_token": "TOK-89103-SEC",
            "complainant_type": "VICTIM",
            "complainant_name": "Ritu Das",
            "complainant_phone": "+91 99887 76655",
            "complainant_email": "ritu.das@example.com",
            "state_region": "West Bengal",
            "category": "CYBER_CRIME",
            "input_mode": "TEXT",
            "raw_input_text": "An ex-colleague is blackmailing me with morphed private photos on social media. He is demanding extortion money and threatening to send them to my family. I am feeling extremely panicked, depressed, and unable to sleep.",
            "voice_file_path": None,
            "voice_duration_seconds": None,
            "status": "ACTION_REQUIRED",
            "assigned_officer_id": officer1.id,
            "submitted_time_delta_mins": 180
        },
        {
            "reference_id": "NHAA-2026-89104",
            "tracking_token": "TOK-89104-SEC",
            "complainant_type": "ANONYMOUS",
            "complainant_name": "Anonymous Complainant",
            "complainant_phone": None,
            "complainant_email": None,
            "state_region": "Karnataka",
            "category": "HARASSMENT",
            "input_mode": "HYBRID",
            "raw_input_text": "My landlord is continuously harassing me at night, knocking on my door repeatedly, and refusing to return my security deposit after I refused his inappropriate demands.",
            "voice_file_path": "/audio_samples/harassment_note.wav",
            "voice_duration_seconds": 15,
            "status": "IN_REVIEW",
            "assigned_officer_id": None,
            "submitted_time_delta_mins": 360
        },
        {
            "reference_id": "NHAA-2026-89105",
            "tracking_token": "TOK-89105-SEC",
            "complainant_type": "VICTIM",
            "complainant_name": "Kavita Nair",
            "complainant_phone": "+91 97766 55443",
            "complainant_email": "kavita.nair@example.com",
            "state_region": "Kerala",
            "category": "OTHER",
            "input_mode": "TEXT",
            "raw_input_text": "Requesting official guidance regarding delayed response from local women welfare office concerning maternity allowance processing.",
            "voice_file_path": None,
            "voice_duration_seconds": None,
            "status": "RESOLVED",
            "assigned_officer_id": officer1.id,
            "submitted_time_delta_mins": 1440
        }
    ]

    now = datetime.datetime.utcnow()

    for data in seed_complaints_data:
        submitted_at = now - datetime.timedelta(minutes=data["submitted_time_delta_mins"])
        
        # Run AI Pipeline
        ai_res = ai_engine.analyze_complaint(data["raw_input_text"], data["category"])

        complaint = Complaint(
            reference_id=data["reference_id"],
            tracking_token=data["tracking_token"],
            complainant_type=data["complainant_type"],
            complainant_name=data["complainant_name"],
            complainant_phone=data["complainant_phone"],
            complainant_email=data["complainant_email"],
            state_region=data["state_region"],
            category=data["category"],
            input_mode=data["input_mode"],
            raw_input_text=data["raw_input_text"],
            voice_file_path=data["voice_file_path"],
            voice_duration_seconds=data["voice_duration_seconds"],
            status=data["status"],
            priority=ai_res["priority_recommended"],
            risk_level=ai_res["risk_classification"],
            risk_score=ai_res["distress_score"],
            assigned_officer_id=data["assigned_officer_id"],
            submitted_at=submitted_at,
            updated_at=submitted_at
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        # Add AI Assessment
        ai_assessment = AIAssessment(
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
            disclaimer_notice=ai_res["disclaimer_notice"],
            assessed_at=submitted_at
        )
        db.add(ai_assessment)

        # Add Initial Audit Log
        audit = AuditLog(
            complaint_id=complaint.id,
            actor_user_id=None,
            actor_name="NHAA AI Triage Pipeline",
            action="AI_ASSESSED",
            details=f"Calculated Distress Score: {ai_res['distress_score']}/100. Assigned Risk: {ai_res['risk_classification']}, Priority: {ai_res['priority_recommended']}.",
            timestamp=submitted_at
        )
        db.add(audit)

        # Add Follow-up task for high risk cases
        if ai_res["risk_classification"] == "HIGH":
            follow_up = FollowUpSchedule(
                complaint_id=complaint.id,
                assigned_officer_id=officer1.id,
                scheduled_date=now + datetime.timedelta(hours=4),
                status="PENDING",
                notes="Urgent welfare check and dispatch confirmation required.",
                created_at=submitted_at
            )
            db.add(follow_up)

        db.commit()

    print("Successfully seeded DB with realism-enhanced NHAA complaints!")
