-- ============================================================================
-- NHAA 14566 RAKSHA PORTAL - SUPABASE POSTGRESQL DATABASE INITIAL SCHEMA & RLS
-- Migration: 20260826000000_initial_schema.sql
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLE: profiles (Linked directly to Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer')),
    state_region TEXT DEFAULT 'Delhi NCR',
    category TEXT DEFAULT 'SC',
    badge_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup on role and email
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- 3. SECURITY DEFINER HELPER: is_officer()
-- Ensures role verification occurs server-side in PostgreSQL
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'officer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. TABLE: grievances (Core incident docket repository)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reference_id TEXT UNIQUE NOT NULL,
    tracking_token TEXT NOT NULL,
    
    complainant_type TEXT NOT NULL DEFAULT 'VICTIM' CHECK (complainant_type IN ('VICTIM', 'THIRD_PARTY', 'ANONYMOUS')),
    complainant_name TEXT,
    complainant_phone TEXT,
    complainant_email TEXT,
    state_region TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    
    category TEXT NOT NULL DEFAULT 'DOMESTIC_ABUSE',
    input_mode TEXT NOT NULL DEFAULT 'TEXT' CHECK (input_mode IN ('TEXT', 'VOICE', 'HYBRID')),
    raw_input_text TEXT NOT NULL,
    voice_file_path TEXT,
    voice_duration_seconds INT,
    
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'ACTION_REQUIRED', 'ESCALATED', 'RESOLVED', 'CLOSED')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'CRITICAL')),
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
    risk_score NUMERIC(5,2) DEFAULT 0.0,
    
    ai_assessment JSONB DEFAULT '{}'::jsonb,
    officer_notes TEXT,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance on critical query fields
CREATE INDEX IF NOT EXISTS idx_grievances_citizen_id ON public.grievances(citizen_id);
CREATE INDEX IF NOT EXISTS idx_grievances_reference_id ON public.grievances(reference_id);
CREATE INDEX IF NOT EXISTS idx_grievances_risk_level ON public.grievances(risk_level);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON public.grievances(created_at DESC);

-- ============================================================================
-- 5. TABLE: follow_up_schedules (Mandatory welfare monitoring checks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follow_up_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_grievance_id ON public.follow_up_schedules(grievance_id);

-- ============================================================================
-- 6. TABLE: audit_logs (Immutable chain of custody)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System / AI Module',
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_grievance_id ON public.audit_logs(grievance_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================================================
-- 7. DATABASE TRIGGERS: auto-update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_grievances_updated_at ON public.grievances;
CREATE TRIGGER trg_grievances_updated_at
    BEFORE UPDATE ON public.grievances
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 8. DATABASE TRIGGER: Automatic Profile Creation on auth.users Signup
-- Role is ALWAYS defaulted to 'citizen' to prevent privilege escalation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        phone, 
        role, 
        state_region, 
        category
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Citizen User'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        'citizen', -- Enforce citizen role strictly
        COALESCE(NEW.raw_user_meta_data->>'state_region', 'Delhi NCR'),
        COALESCE(NEW.raw_user_meta_data->>'category', 'SC')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_officer" ON public.profiles;
CREATE POLICY "profiles_select_own_or_officer" ON public.profiles
    FOR SELECT
    USING (
        id = auth.uid() OR public.is_officer()
    );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND 
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents changing own role
    );

-- ----------------------------------------------------------------------------
-- GRIEVANCES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "grievances_select_isolated" ON public.grievances;
CREATE POLICY "grievances_select_isolated" ON public.grievances
    FOR SELECT
    USING (
        citizen_id = auth.uid() OR public.is_officer()
    );

DROP POLICY IF EXISTS "grievances_insert_citizen_or_officer" ON public.grievances;
CREATE POLICY "grievances_insert_citizen_or_officer" ON public.grievances
    FOR INSERT
    WITH CHECK (
        citizen_id = auth.uid() OR public.is_officer() OR auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "grievances_update_officer_only" ON public.grievances;
CREATE POLICY "grievances_update_officer_only" ON public.grievances
    FOR UPDATE
    USING (
        public.is_officer() OR (citizen_id = auth.uid() AND status = 'NEW')
    );

-- ----------------------------------------------------------------------------
-- FOLLOW UP SCHEDULES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "followups_select_policy" ON public.follow_up_schedules;
CREATE POLICY "followups_select_policy" ON public.follow_up_schedules
    FOR SELECT
    USING (
        public.is_officer() OR 
        EXISTS (
            SELECT 1 FROM public.grievances g 
            WHERE g.id = grievance_id AND g.citizen_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "followups_modify_officer_only" ON public.follow_up_schedules;
CREATE POLICY "followups_modify_officer_only" ON public.follow_up_schedules
    FOR ALL
    USING (public.is_officer());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT
    USING (
        public.is_officer() OR 
        EXISTS (
            SELECT 1 FROM public.grievances g 
            WHERE g.id = grievance_id AND g.citizen_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT
    WITH CHECK (
        public.is_officer() OR auth.uid() IS NOT NULL
    );
