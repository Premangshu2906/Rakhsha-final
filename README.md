# PS 26093: AI-Based Real-Time Stress & Trauma Assessment Module
### National Helpline for Action Against Abuse (NHAA 14566) & Integrated Portal

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📌 Problem Overview
The **National Human Rights Commission (NHRC) / National Helpline for Action Against Abuse (NHAA 14566)** receives high volumes of grievance calls and text submissions involving domestic violence, human trafficking, physical abuse, cyber crime, and severe psychological distress.

This project delivers a **real-time AI-based stress, distress, and trauma-risk assessment module** designed as an automated triage layer for the NHAA portal workflow.

### Core Workflow:
```
Victim / Complainant
   │
   ├── Text Input OR Voice Recording
   │
   ▼
Speech-to-Text (STT Abstraction)
   │
   ▼
FastAPI AI Triage & NLP Assessment Engine
   │
   ├── Multi-Dimensional Trauma Lexicon Scan (Physical Danger, Panic, Coercion)
   ├── 0 - 100 Objective Distress Scoring
   ├── Risk Classification: LOW / MODERATE / HIGH
   ├── Priority Flag: NORMAL / URGENT / CRITICAL
   └── Structured Case Summary Generation
   │
   ▼
Officer Control Room Dashboard
   │
   ├── 🚨 Urgent Case Queue Prioritization
   ├── Human Officer Review & Risk Override (with Audit Reason)
   ├── Follow-Up Monitoring Scheduler
   └── Immutable Audit Trail Logging
```

---

## ⚠️ Mandatory Safety & Ethical Guardrail
> **IMPORTANT MEDICAL & CLINICAL DISCLAIMER:**
> This system operates strictly as an **advisory decision-support and triage prioritization tool**. It **DOES NOT** provide medical, clinical, or psychiatric diagnoses. All final investigation, case determination, and priority override decisions remain exclusively with human officers.

---

## 🛠️ Technology Stack

| Layer | Technology Choice |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite with SQLAlchemy 2.0 ORM |
| **AI Engine** | Deterministic Offline NLP Rules Engine + Pluggable LLM Adapter Interface |
| **Voice Processing** | Browser Web Speech API + Backend Audio Parsing Abstraction |
| **Testing** | Pytest, TestClient |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Quick Start Guide

### Option A: Using Docker (Recommended for Zero-Config)

```bash
# Clone the repository and navigate into directory
cd SIH2026

# Build and start services
docker-compose up --build
```
- **Complainant Portal & Dashboard**: `http://localhost:5173`
- **FastAPI Backend & Interactive API Docs**: `http://localhost:8000/docs`

---

### Option B: Local Setup Without Docker

#### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start backend server (DB auto-seeds on startup)
python -m app.main
```
The FastAPI backend will start at `http://localhost:8000`.

#### 2. Frontend Setup (React + Vite)
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The application will open at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

```bash
cd backend

# Run pytest suite for AI pipeline and REST endpoints
pytest
```

---

## 🎯 Demo Guide for SIH Judges

Follow these steps to demonstrate the prototype to an SIH judge:

### 1. Reset Demo Dataset
Click the **"Reset Demo Data"** button in the header bar or call `POST /api/v1/officer/seed-demo`. This populates realistic pre-configured complaints across all risk tiers.

### 2. Test Public Voice & Text Intake
1. Navigate to the **Complainant Portal** (`http://localhost:5173`).
2. Test **Voice Input**: Click the microphone icon, speak a statement, and watch the real-time speech-to-text transcript.
3. Test **High Distress Case**: Type:
   > *"Help me! My husband locked me in the kitchen and is beating me. He threatened to burn me if I call anyone. I am terrified for my life right now!"*
4. Click **Submit Complaint**. Observe immediate issuance of:
   - Reference ID (e.g., `NHAA-2026-XXXXX`)
   - Private Tracking Token
   - Real-time AI Risk Badge: **HIGH RISK (Score: 94/100)**
   - Priority: **CRITICAL**
   - National Emergency Helpline banner (`14566`, `112`, `14416`).

### 3. Officer Control Room & Triage Dashboard
1. Click **Officer Dashboard** in the top navigation bar.
2. Observe the **Urgent High-Risk Queue** alert badge.
3. Filter cases by **HIGH RISK**, **DOMESTIC ABUSE**, or **TRAFFICKING**.
4. Click **Inspect** on any case to open the full evaluation detail page.

### 4. Human Officer Override & Audit Trail Verification
1. Inspect the **Structured AI Case Summary** and **Advisory Action Points**.
2. Change the **Risk Level** or **Status** in the Human Officer Control Box.
3. Provide an **Override Reason** (e.g., *"Officer verified physical safety over phone call; lowered risk to Moderate"*).
4. Save updates and scroll down to inspect the **Immutable Audit Trail**, confirming timestamped logging of officer actions.

---

## 📚 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/complaints/submit` | Public submission & real-time AI triage |
| `POST` | `/api/v1/complaints/transcribe` | Speech-to-text voice processor |
| `GET` | `/api/v1/complaints/track/{ref_id}` | Complaint status tracking |
| `GET` | `/api/v1/complaints/helplines` | Verified emergency distress numbers |
| `GET` | `/api/v1/officer/dashboard/stats` | Officer KPI counters & analytics |
| `GET` | `/api/v1/officer/complaints` | Paginated complaint queue with multi-filters |
| `PATCH`| `/api/v1/officer/complaints/{id}` | Update status, priority, or human risk override |
| `POST` | `/api/v1/officer/complaints/{id}/follow-up` | Schedule follow-up welfare check |
| `GET` | `/api/v1/officer/complaints/{id}/audit-trail` | Immutable audit trail viewer |
| `POST` | `/api/v1/officer/seed-demo` | SIH Judge demo database reset |

---

## 📜 License
Developed for Smart India Hackathon (SIH 2026) under Problem Statement 26093.
