import pytest
from app.ai.pipeline import DeterministicNLPAnalyzer, MANDATORY_DISCLAIMER

def test_high_distress_scoring():
    analyzer = DeterministicNLPAnalyzer()
    text = "Help me! My husband has locked me inside the room and is beating me with a belt. I am terrified for my life right now!"
    res = analyzer.analyze_complaint(text, "DOMESTIC_ABUSE")
    
    assert res["risk_classification"] == "HIGH"
    assert res["distress_score"] >= 70.0
    assert res["priority_recommended"] in ["URGENT", "CRITICAL"]
    assert len(res["identified_indicators"]) > 0
    assert "Immediate Physical Threat / Violence" in res["identified_indicators"][0]
    assert res["disclaimer_notice"] == MANDATORY_DISCLAIMER

def test_moderate_distress_scoring():
    analyzer = DeterministicNLPAnalyzer()
    text = "An ex-colleague is blackmailing me with morphed private photos. He is demanding money and threatening to send them to my family."
    res = analyzer.analyze_complaint(text, "CYBER_CRIME")
    
    assert res["risk_classification"] in ["MODERATE", "HIGH"]
    assert res["distress_score"] >= 40.0
    assert len(res["key_phrases"]) > 0

def test_low_distress_scoring():
    analyzer = DeterministicNLPAnalyzer()
    text = "Requesting assistance regarding delayed response from local municipal authority regarding street light maintenance."
    res = analyzer.analyze_complaint(text, "OTHER")
    
    assert res["risk_classification"] == "LOW"
    assert res["distress_score"] < 40.0
    assert res["priority_recommended"] == "NORMAL"

def test_suicide_ideation_override():
    analyzer = DeterministicNLPAnalyzer()
    text = "I cannot take this domestic abuse anymore. I am feeling hopeless and planning to suicide tonight."
    res = analyzer.analyze_complaint(text, "DOMESTIC_ABUSE")
    
    assert res["risk_classification"] == "HIGH"
    assert res["priority_recommended"] == "CRITICAL"
    assert res["distress_score"] >= 90.0
    assert any("Self-Harm" in ind for ind in res["identified_indicators"])
