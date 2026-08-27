import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') && 
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project')
  );
};

// Create real Supabase Client if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ============================================================================
// Local Mock Storage Adapter (Fallback for offline evaluation / when keys pending)
// Ensures local development, unit tests, and SIH demo work seamlessly with zero crash.
// ============================================================================
const MOCK_STORAGE_KEYS = {
  USERS: 'nhaa_mock_users',
  PROFILES: 'nhaa_mock_profiles',
  GRIEVANCES: 'nhaa_mock_grievances',
  FOLLOW_UPS: 'nhaa_mock_follow_ups',
  AUDIT_LOGS: 'nhaa_mock_audit_logs',
  SESSION: 'nhaa_mock_session'
};

const getStored = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// Initialize mock seed if empty
export const initMockStorage = () => {
  const users = getStored(MOCK_STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    const demoOfficerId = '11111111-1111-4111-a111-111111111111';
    const demoCitizenId = '22222222-2222-4222-a222-222222222222';
    
    const initialProfiles = [
      {
        id: demoOfficerId,
        full_name: 'Duty Officer PC',
        email: 'pc@gmail.com',
        phone: '9876543210',
        role: 'officer',
        state_region: 'Delhi NCR',
        category: 'N/A',
        badge_number: 'NHAA-OFF-101',
        created_at: new Date().toISOString()
      },
      {
        id: demoCitizenId,
        full_name: 'Rameshwar Paswan',
        email: 'rameshwar.paswan@example.com',
        phone: '9876543211',
        role: 'citizen',
        state_region: 'Uttar Pradesh',
        category: 'SC',
        created_at: new Date().toISOString()
      }
    ];
    setStored(MOCK_STORAGE_KEYS.PROFILES, initialProfiles);

    const initialGrievances = [
      {
        id: '33333333-3333-4333-a333-333333333333',
        citizen_id: demoCitizenId,
        reference_id: 'NHAA-2026-89101',
        tracking_token: 'TOK-89101A',
        complainant_type: 'VICTIM',
        complainant_name: 'Rameshwar Paswan',
        complainant_phone: '9876543211',
        complainant_email: 'rameshwar.paswan@example.com',
        state_region: 'Uttar Pradesh',
        category: 'DOMESTIC_ABUSE',
        input_mode: 'VOICE',
        raw_input_text: 'Landlord threatening physical eviction with weapon and caste abuse in Varanasi village.',
        status: 'ACTION_REQUIRED',
        priority: 'CRITICAL',
        risk_level: 'HIGH',
        risk_score: 88.5,
        ai_assessment: {
          distress_score: 88.5,
          urgency_score: 92.0,
          risk_classification: 'HIGH',
          priority_recommended: 'CRITICAL',
          identified_indicators: ['Physical Threat with Weapon', 'Caste Abuse (PoA Act Sec 3)', 'Imminent Eviction Threat'],
          key_phrases: ['threatening physical eviction', 'caste abuse', 'weapon'],
          ai_case_summary: 'Complainant reports urgent life threat, physical intimidation with weapon, and severe caste harassment by landlord.',
          recommended_actions: ['Immediate Zero-FIR dispatch to Varanasi SP office', 'Victim protection officer deployment under Section 15A']
        },
        officer_notes: 'Connected with Varanasi SC/ST Cell DSP for immediate patrol dispatch.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '44444444-4444-4444-a444-444444444444',
        citizen_id: '55555555-5555-4555-a555-555555555555',
        reference_id: 'NHAA-2026-45219',
        tracking_token: 'TOK-45219B',
        complainant_type: 'THIRD_PARTY',
        complainant_name: 'Sunita Devi',
        complainant_phone: '9811223344',
        complainant_email: 'sunita@example.com',
        state_region: 'Rajasthan',
        category: 'HARASSMENT',
        input_mode: 'TEXT',
        raw_input_text: 'Village panchayat boycotted community well access for scheduled caste families.',
        status: 'IN_REVIEW',
        priority: 'URGENT',
        risk_level: 'MODERATE',
        risk_score: 58.0,
        ai_assessment: {
          distress_score: 58.0,
          urgency_score: 65.0,
          risk_classification: 'MODERATE',
          priority_recommended: 'URGENT',
          identified_indicators: ['Social Boycott', 'Denial of Public Drinking Water (PCR Act)'],
          key_phrases: ['boycotted community well', 'scheduled caste families'],
          ai_case_summary: 'Grievance regarding discriminatory denial of public water facility in Rajasthan village.',
          recommended_actions: ['Issue SDM notice to Village Panchayat', 'Facilitate administrative water access restoration']
        },
        officer_notes: 'Notice drafted for District Magistrate.',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setStored(MOCK_STORAGE_KEYS.GRIEVANCES, initialGrievances);
  }
};

// Initialize on script load
initMockStorage();
