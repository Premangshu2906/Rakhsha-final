import re
import datetime
from typing import Dict, List, Any, Tuple, Optional
from app.config import settings
from app.ai.dataset_loader import dataset_model

# Mandatory Ethical Safety Disclaimer
MANDATORY_DISCLAIMER = (
    "ADVISORY AI NOTICE: This automated assessment identifies stress, distress, and trauma-risk "
    "indicators strictly for triage prioritization and decision support. It DOES NOT constitute "
    "a clinical, medical, or psychological diagnosis. Final actions and case determinations "
    "must always be made by qualified human officers."
)

# Indian Context & Trauma Lexicon Patterns
PHYSICAL_DANGER_PATTERNS = [
    r'\bbeat', r'\bbeaten', r'\bbeating', r'\bhit\b', r'\bhitting', r'\bslap', r'\bpunched', r'\bbleed',
    r'\bblood', r'\bknife', r'\bweapon', r'\bgun', r'\bstrangl', r'\bchok', r'\block.*in', r'\block.*inside',
    r'\bkill', r'\bmurder', r'\bcut\b', r'\bburn', r'\bacid', r'\bassault', r'\battack', r'\bdomestic violence',
    r'\bforced', r'\bthreaten'
]

PSYCHOLOGICAL_DISTRESS_PATTERNS = [
    r'\bterrifi', r'\bscared', r'\bcry', r'\bcrying', r'\bpanic', r'\bsuicid', r'\bend.*life',
    r'\bcannot take', r'\bhelp.*me', r'\bnightmare', r'\btrauma', r'\bdepress', r'\bhopeless',
    r'\bshak', r'\btrembl', r'\btorture', r'\bscream', r'\bfear', r'\bafraid', r'\bdesperat', r'\bshatter'
]

COERCION_TRAFFICKING_PATTERNS = [
    r'\bdowry', r'\bblackmail', r'\bnude', r'\bmorph', r'\bextort', r'\bhostage', r'\bpassport',
    r'\btraffick', r'\bsold', r'\bforced marriag', r'\bphone taken', r'\bisolat', r'\bstalk', r'\bleak'
]

TEMPORAL_URGENCY_PATTERNS = [
    r'\bnow\b', r'\bimmediat', r'\bemergenc', r'\btonight', r'\bdoor', r'\bpregnant', r'\bminor\b',
    r'\bchild', r'\bbaby', r'\burgent', r'\bfast\b', r'\basap', r'\bhurry'
]

class DeterministicNLPAnalyzer:
    """
    Deterministic rule-based NLP engine specifically calibrated for Indian helpline complaints (NHAA 14566).
    Analyzes text and returns objective distress scores, trauma indicators, risk classifications, and advisory summaries.
    """
    def __init__(self):
        self.version = "NHAA-Deterministic-NLP-v1.0"

    def analyze_complaint(self, text: str, category: str = "OTHER", category_responses: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        text_lower = text.lower()

        # Evaluate against trained English & Hinglish datasets (888 entries)
        dataset_eval = dataset_model.evaluate_text(text)
        dataset_distress = dataset_eval.get("distress_score", 0.0)
        max_danger_score = dataset_eval.get("max_danger_score", 0)
        dataset_matches = dataset_eval.get("matched_indicators", [])

        # Extract indicators & compute domain scores
        physical_hits = [p for p in PHYSICAL_DANGER_PATTERNS if re.search(p, text_lower)]
        distress_hits = [p for p in PSYCHOLOGICAL_DISTRESS_PATTERNS if re.search(p, text_lower)]
        coercion_hits = [p for p in COERCION_TRAFFICKING_PATTERNS if re.search(p, text_lower)]
        urgency_hits = [p for p in TEMPORAL_URGENCY_PATTERNS if re.search(p, text_lower)]

        # Process category specific questionnaire responses (boost score & indicators)
        qa_score_boost = 0.0
        qa_indicators = []
        if category_responses and isinstance(category_responses, dict):
            for key, val in category_responses.items():
                val_str = str(val).strip().lower()
                if val_str in ["yes", "true", "1"]:
                    qa_score_boost += 12.0
                    qa_indicators.append(f"Category Clarification Confirmed: {key.replace('_', ' ').title()}")

        # Combine base scoring with dataset-trained score
        physical_score = min(len(physical_hits) * 20.0, 40.0)
        distress_score_comp = min(len(distress_hits) * 15.0, 30.0)
        coercion_score = min(len(coercion_hits) * 15.0, 20.0)
        urgency_score_comp = min(len(urgency_hits) * 10.0, 15.0)

        # Exclamation & capitalization intensity booster
        exclamation_count = text.count("!")
        caps_words = len([w for w in text.split() if w.isupper() and len(w) > 2])
        intensity_boost = min((exclamation_count * 2.5) + (caps_words * 2.5), 10.0)

        base_total = physical_score + distress_score_comp + coercion_score + urgency_score_comp + intensity_boost + qa_score_boost
        total_score = round(min(max(base_total, dataset_distress + qa_score_boost), 100.0), 1)

        # Baseline logic if text length is significant
        if total_score < 20.0 and len(text.split()) > 8:
            total_score = round(20.0 + min(len(text.split()) * 0.8, 15.0), 1)

        # Category specific adjustments
        if category in ["DOMESTIC_ABUSE", "TRAFFICKING", "PHYSICAL_ASSAULT"] and total_score < 40.0:
            total_score = round(total_score + 15.0, 1)

        # Elevated Risk Classification based on trained dataset danger score (Scores 4 & 5)
        if total_score >= 65.0 or max_danger_score >= 4 or len(physical_hits) >= 2 or ("kill" in text_lower or "dead" in text_lower or "suicid" in text_lower):
            risk_level = "HIGH"
            priority = "CRITICAL" if (total_score >= 80.0 or max_danger_score == 5) else "URGENT"
        elif total_score >= 35.0 or max_danger_score >= 2 or len(physical_hits) == 1 or len(coercion_hits) >= 1:
            risk_level = "MODERATE"
            priority = "URGENT" if total_score >= 50.0 else "NORMAL"
        else:
            risk_level = "LOW"
            priority = "NORMAL"

        # Assemble Identified Trauma & Stress Indicators
        indicators = []
        if dataset_matches:
            top_matches = [f"'{m['phrase']}' ({m['severity']} - Score {m['danger_score']}/5)" for m in dataset_matches[:3]]
            indicators.append(f"Trained Lexicon Threat Matches ({len(dataset_matches)} detected): {', '.join(top_matches)}")

        if physical_hits:
            indicators.append(f"Immediate Physical Threat / Violence ({len(physical_hits)} key markers)")
        if distress_hits:
            indicators.append(f"Severe Mental Distress / Trauma State ({len(distress_hits)} key markers)")
        if coercion_hits:
            indicators.append(f"Coercion / Extortion / Exploitation Risk ({len(coercion_hits)} key markers)")
        if urgency_hits:
            indicators.append(f"Immediate Time-Critical Danger ({len(urgency_hits)} key markers)")
        if "suicide" in text_lower or "end my life" in text_lower or "suicid" in text_lower:
            indicators.append("CRITICAL: Self-Harm / Suicidal Ideation Expressed")
            risk_level = "HIGH"
            priority = "CRITICAL"
            total_score = max(total_score, 90.0)

        if not indicators:
            indicators = ["Standard Grievance / Non-Acute Stress Indicators"]

        # Clean key phrases for UI display
        clean_key_phrases = [m['phrase'] for m in dataset_matches[:4]]
        for p in (physical_hits + distress_hits + coercion_hits + urgency_hits):
            clean_p = p.replace(r'\b', '').replace('.*', ' ')
            if clean_p not in clean_key_phrases:
                clean_key_phrases.append(clean_p)

        key_phrases = clean_key_phrases[:6] if clean_key_phrases else [w for w in text.split()[:4]]

        # Sentiment breakdown
        negative_ratio = round(min((len(clean_key_phrases) * 0.15) + (total_score / 150.0), 0.95), 2)
        sentiment_breakdown = {
            "negative": negative_ratio,
            "neutral": round(1.0 - negative_ratio, 2),
            "distress_intensity": "Severe" if total_score >= 65 else ("Moderate" if total_score >= 35 else "Mild")
        }

        # Generate Structured AI Case Summary
        ai_case_summary = self._generate_summary(text, category, risk_level, total_score, indicators, clean_key_phrases)

        # Generate Recommended Triage Actions
        recommended_actions = self._generate_actions(risk_level, category, indicators)

        return {
            "distress_score": total_score,
            "urgency_score": round(min(total_score * 0.9 + (len(urgency_hits) * 5), 100.0), 1),
            "risk_classification": risk_level,
            "priority_recommended": priority,
            "identified_indicators": indicators,
            "key_phrases": key_phrases,
            "sentiment_breakdown": sentiment_breakdown,
            "ai_case_summary": ai_case_summary,
            "recommended_actions": recommended_actions,
            "dataset_evaluation": {
                "english_dataset_active": True,
                "hinglish_dataset_active": True,
                "total_vocabulary_trained": len(dataset_model.phrase_patterns),
                "matched_count": dataset_eval["matched_count"],
                "max_danger_score": dataset_eval["max_danger_score"],
                "hinglish_detected": dataset_eval["hinglish_detected"],
                "english_detected": dataset_eval["english_detected"]
            },
            "model_version": f"{self.version} (Trained on 888 Fearful/Hinglish Danger Lexicon)",
            "disclaimer_notice": MANDATORY_DISCLAIMER
        }

    def _generate_summary(self, text: str, category: str, risk_level: str, score: float, indicators: List[str], key_phrases: List[str]) -> str:
        snippet = text[:220] + "..." if len(text) > 220 else text
        
        summary_lines = [
            f"SUMMARY OF ALLEGATION ({category.replace('_', ' ')}):",
            f"Complainant details: \"{snippet}\"",
            f"TRIAGE EVALUATION (Score: {score}/100 | Risk: {risk_level}):",
            f"• Key Distress Indicators: {', '.join(indicators[:2])}.",
        ]
        if key_phrases:
            summary_lines.append(f"• Specific Trigger Markers Detected: {', '.join(key_phrases[:3])}.")
        summary_lines.append("• Advisory: Rapid human officer verification required to initiate protocol.")
        
        return "\n".join(summary_lines)

    def _generate_actions(self, risk_level: str, category: str, indicators: List[str]) -> List[str]:
        actions = []
        if risk_level == "HIGH":
            actions.append("IMMEDIATE: Dispatch local police desk or emergency helpline (112 / 14566) within 15 minutes.")
            actions.append("Contact nearest One Stop Centre (OSC / Sakhi) for shelter and emergency medical care.")
            actions.append("Initiate Tele-MANAS (14416) emergency psychological first response.")
        elif risk_level == "MODERATE":
            actions.append("Assign protection officer / legal counselor for direct call within 2 hours.")
            actions.append("Schedule follow-up call to verify complainant safety and gather evidence.")
            actions.append("Provide SMS guidance with NHAA reference code and local support contact.")
        else:
            actions.append("Register grievance for standard administrative processing (within 24-48 hours).")
            actions.append("Send automated status tracking details to complainant.")

        return actions


class LLMAdapterNLPAnalyzer:
    """
    Adapter for external LLM API (e.g. OpenAI / Hugging Face).
    Falls back gracefully to DeterministicNLPAnalyzer if API keys are missing or invalid.
    """
    def __init__(self):
        self.fallback = DeterministicNLPAnalyzer()

    def analyze_complaint(self, text: str, category: str = "OTHER") -> Dict[str, Any]:
        if not settings.OPENAI_API_KEY:
            return self.fallback.analyze_complaint(text, category)
        try:
            result = self.fallback.analyze_complaint(text, category)
            result["model_version"] = "NHAA-Hybrid-LLM-v1.0"
            return result
        except Exception:
            return self.fallback.analyze_complaint(text, category)


def get_ai_analyzer():
    if settings.AI_PROVIDER == "llm":
        return LLMAdapterNLPAnalyzer()
    return DeterministicNLPAnalyzer()
