import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_nhaa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_submit_complaint():
    payload = {
        "complainant_type": "VICTIM",
        "complainant_name": "Test User",
        "complainant_phone": "+91 99999 88888",
        "complainant_email": "test@example.com",
        "state_region": "Delhi NCR",
        "category": "DOMESTIC_ABUSE",
        "input_mode": "TEXT",
        "raw_input_text": "Help me! My husband locked me in the room and is threatening to kill me right now."
    }
    response = client.post("/api/v1/complaints/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "reference_id" in data
    assert data["risk_level"] == "HIGH"
    assert data["ai_assessment"]["distress_score"] >= 60.0

def test_officer_dashboard_stats():
    # First submit a complaint
    client.post("/api/v1/complaints/submit", json={
        "complainant_type": "ANONYMOUS",
        "raw_input_text": "Severe domestic abuse incident in progress."
    })
    response = client.get("/api/v1/officer/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_complaints"] >= 1

def test_helplines_endpoint():
    response = client.get("/api/v1/complaints/helplines")
    assert response.status_code == 200
    data = response.json()
    assert len(data["helplines"]) >= 4
