# 🛡️ NHAA 14566 Portal (RAKSHA)
### National Helpline Against Atrocities — AI Stress & Trauma Assessment System with Supabase Auth & PostgreSQL Row-Level Security (RLS)

**Smart India Hackathon (SIH 2026) | Problem Statement: PS 26093**  
**Ministry of Social Justice and Empowerment (MoSJE), Government of India**

---

## 📌 Architectural Overview

The **NHAA 14566 RAKSHA Portal** is an end-to-end national digital assistance platform designed for the reporting, immediate AI distress assessment, and legal triage of atrocities under the **Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989** and its **2018 Section 18A Amendment**.

### Core Pillars:
1. **Supabase Auth & Database Layer**:
   - **No plaintext passwords / No custom password hashing** — authenticates securely via bcrypt-hashed Supabase Auth.
   - **`profiles` Table**: Tied directly to `auth.users(id)` with server-side role enforcement (`citizen` vs `officer`).
   - **Row Level Security (RLS)**: Enforces citizen data isolation at the PostgreSQL engine level. Citizen A can **never** view or tamper with Citizen B's records.
2. **AI Stress & Distress Assessment Engine**:
   - Analyzes voice/text statements for acoustic tremor markers, explicit physical threats to life, and caste atrocity keywords.
   - Outputs a distress index score ($0-100$), risk classification (`HIGH`, `MODERATE`, `LOW`), priority recommendations, and structured officer dossiers.
3. **Duty Officer Console & Triage Control Room**:
   - Real-time KPI counters, interactive Recharts risk distribution charts, and trigger word highlighting (`kill`, `threat`, `caste`, `dhamki`, `हमला`, `जाति`).
   - Human Officer Decision Override with mandatory chain of custody audit logging.

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name your project (e.g. `nhaa-portal`) and set a strong database password.
3. Select your nearest region (e.g. `ap-south-1` for India / South Asia).

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the `frontend` folder:
```bash
cp frontend/.env.example frontend/.env
```
Populate your Supabase Project URL and Public Anon Key (found in **Supabase Dashboard &rarr; Project Settings &rarr; API**):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-publishable-key
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
*(Note: Never commit your `.env` file to Git. It is automatically ignored by `.gitignore`)*

### Step 3: Run Database SQL Migrations
In your Supabase Dashboard, open the **SQL Editor** and run the following two migration scripts located in `supabase/migrations/`:
1. `supabase/migrations/20260826000000_initial_schema.sql`:
   - Creates `profiles`, `grievances`, `follow_up_schedules`, and `audit_logs` tables.
   - Creates the security definer function `is_officer()`.
   - Creates the `handle_new_user()` trigger to automatically create citizen profiles upon signup.
   - Enables Row Level Security (RLS) and attaches strict isolation policies.
2. `supabase/migrations/20260826000001_officer_admin_setup.sql`:
   - Creates the `assign_officer_role(target_email, badge_number)` administrative procedure.
   - Creates the `officer_dashboard_summary` analytical view.

### Step 4: Configure Authentication Settings
In the Supabase Dashboard under **Authentication &rarr; Providers**:
- Enable **Email / Password** provider.
- Set your site URL to `http://localhost:5173`.
- Configure Password minimum length to 6 characters.

### Step 5: Securely Provision an Officer Account
Officer accounts cannot be registered through the public citizen sign-up form. To create your first official duty officer:
1. In the Supabase Auth tab (or through the portal sign-up), create a user with email `officer@nhaa.gov.in` and password `officer123`.
2. In the Supabase **SQL Editor**, promote the user to the verified officer role:
```sql
SELECT public.assign_officer_role('officer@nhaa.gov.in', 'NHAA-OFF-101');
```

### Step 6: Install Dependencies & Launch Application
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (Optional FastAPI AI Service)
cd ../backend
python -m venv venv
venv\Scripts\activate     # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Security & Acceptance Testing Matrix

| Test Case | Scenario | Expected Behavior | Status |
| :--- | :--- | :--- | :---: |
| **Test 1: Citizen Data Isolation** | Citizen A logs in and files Grievance A. Citizen B logs in. | Citizen B's "My Grievances" view only lists Citizen B's dockets. Grievance A is invisible to Citizen B. | ✅ Enforced via RLS |
| **Test 2: Protected Grievance Flow** | Unauthenticated user clicks "Write a Grievance". | Redirects to login with `redirect=/grievance`. After login, returns directly to form. | ✅ Verified |
| **Test 3: Citizen Officer Block** | Citizen attempts to open Officer Dashboard. | Access is denied by `is_officer()` check and UI guard; RLS blocks data queries. | ✅ Verified |
| **Test 4: Officer Authentication** | Duty officer signs in with `officer@nhaa.gov.in`. | System validates `profiles.role === 'officer'` server-side and unlocks Control Room. | ✅ Verified |
| **Test 5: Human Officer Override** | Officer modifies risk score from Moderate to High. | System updates docket and logs mandatory justification in `audit_logs`. | ✅ Verified |
| **Test 6: AI Distress Triage** | Citizen speaks voice statement containing threats. | Radial progress gauge shows severity index ($88.5/100$), indicators flagged. | ✅ Verified |
| **Test 7: Password Recovery** | User clicks "Forgot Password". | Dispatches secure password reset link without revealing account existence. | ✅ Verified |

---

## ⚙️ MANUAL SETUP REQUIRED (When deploying fresh Supabase project)

1. **Create Supabase Project** at [https://supabase.com](https://supabase.com).
2. **Execute SQL Migrations** in Supabase SQL Editor:
   - Run `supabase/migrations/20260826000000_initial_schema.sql`
   - Run `supabase/migrations/20260826000001_officer_admin_setup.sql`
3. **Set Frontend `.env`**:
   - `VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<your-anon-key>`
4. **Promote Officer**: Run `SELECT public.assign_officer_role('officer@nhaa.gov.in', 'NHAA-OFF-101');` in SQL editor after registering the officer email.
