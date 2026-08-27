import os
import pytest
from app.ai.dataset_loader import dataset_model, DatasetTrainedModel
from app.ai.pipeline import DeterministicNLPAnalyzer
from app.ai.stt_service import stt_service

def test_dataset_loading_counts():
    """Verify both Excel datasets are read and indexed completely."""
    assert dataset_model.is_loaded is True
    assert len(dataset_model.english_lexicon) == 578
    assert len(dataset_model.hinglish_lexicon) >= 310
    assert len(dataset_model.phrase_patterns) >= 888

def test_english_fearful_words_accuracy():
    """Test evaluation accuracy on English fearful words dataset inputs."""
    analyzer = DeterministicNLPAnalyzer()
    
    # Test case: Severe English physical threat
    text = "The perpetrator is beating me with a knife and threatening to murder me. I am terrified and desperate."
    result = analyzer.analyze_complaint(text, category="PHYSICAL_ASSAULT")
    
    assert result["risk_classification"] == "HIGH"
    assert result["priority_recommended"] in ["CRITICAL", "URGENT"]
    assert result["distress_score"] >= 75.0
    assert result["dataset_evaluation"]["english_detected"] is True
    assert result["dataset_evaluation"]["matched_count"] > 0
    assert result["dataset_evaluation"]["max_danger_score"] in [4, 5]

def test_hinglish_danger_signals_accuracy():
    """Test evaluation accuracy on Hinglish danger signals dataset inputs."""
    analyzer = DeterministicNLPAnalyzer()
    
    # Test case: Hinglish severe physical threat sentence
    text = "Usne mujhe jaan se maar dunga bola hai aur maar peet ki hai, dhar-pakad karke dhamki di."
    result = analyzer.analyze_complaint(text, category="DOMESTIC_ABUSE")
    
    assert result["risk_classification"] == "HIGH"
    assert result["priority_recommended"] in ["CRITICAL", "URGENT"]
    assert result["distress_score"] >= 80.0
    assert result["dataset_evaluation"]["hinglish_detected"] is True
    assert result["dataset_evaluation"]["matched_count"] > 0
    assert result["dataset_evaluation"]["max_danger_score"] == 5

def test_speech_to_text_hinglish_enrichment():
    """Test Speech-to-Text payload enrichment with Hinglish transcript."""
    hinglish_speech = "Mujhe bacha lo, wo mujhe jaan se maar rha hai aur ghar se nikal diya."
    stt_result = stt_service.transcribe_audio_payload(raw_text_transcript=hinglish_speech)
    
    assert stt_result["confidence_score"] >= 0.98
    assert stt_result["dataset_analysis"]["hinglish_speech_detected"] is True
    assert stt_result["dataset_analysis"]["max_danger_score"] == 5
    assert len(stt_result["dataset_analysis"]["matched_danger_words"]) > 0

def test_mild_case_scoring():
    """Test mild grievance cases receive appropriate low/moderate scores."""
    analyzer = DeterministicNLPAnalyzer()
    text = "I want to inquire about my complaint status and case application details."
    result = analyzer.analyze_complaint(text, category="OTHER")
    
    assert result["risk_classification"] == "LOW"
    assert result["distress_score"] <= 35.0
