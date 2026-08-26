-- ============================================================================
-- NHAA 14566 RAKSHA PORTAL - OFFICER PROVISIONING & DEMO DATA SEEDING
-- Migration: 20260826000001_officer_admin_setup.sql
-- ============================================================================

-- Procedure: assign_officer_role
-- Used by Supabase SQL Editor / Admin to promote an authorized user to officer role
CREATE OR REPLACE FUNCTION public.assign_officer_role(target_email TEXT, officer_badge TEXT DEFAULT 'NHAA-OFF-101')
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        role = 'officer',
        badge_number = officer_badge,
        updated_at = NOW()
    WHERE email = target_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile with email % not found. User must register first.', target_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for easy officer triage dashboard analytics (computes counts server-side)
CREATE OR REPLACE VIEW public.officer_dashboard_summary AS
SELECT
    COUNT(*) AS total_complaints,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH') AS high_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'MODERATE') AS moderate_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'LOW') AS low_risk_count,
    COUNT(*) FILTER (WHERE priority IN ('URGENT', 'CRITICAL')) AS urgent_priority_count,
    COUNT(*) FILTER (WHERE status IN ('NEW', 'ACTION_REQUIRED', 'ESCALATED')) AS action_required_count,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved_count
FROM public.grievances;

-- Grant select on view to authenticated users (RLS on underlying table still applies)
GRANT SELECT ON public.officer_dashboard_summary TO authenticated;
