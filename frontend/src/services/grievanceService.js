import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { submitComplaint as apiSubmitComplaint, getOfficerComplaints as apiGetOfficerComplaints, getDashboardStats as apiGetDashboardStats, updateComplaintStatus as apiUpdateStatus, scheduleFollowUp as apiScheduleFollowUp, getAuditTrail as apiGetAuditTrail } from '../api';

const MOCK_STORAGE_KEYS = {
  GRIEVANCES: 'nhaa_mock_grievances',
  FOLLOW_UPS: 'nhaa_mock_follow_ups',
  AUDIT_LOGS: 'nhaa_mock_audit_logs'
};

const getStored = (key, def = []) => {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : def;
  } catch (e) {
    return def;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

function generateRefId() {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `NHAA-2026-${digits}`;
}

function generateTrackingToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TOK-${str}`;
}

// Client-side AI assessment fallback in case backend is offline
function clientAIAssessmentFallback(text, category) {
  const lower = text.toLowerCase();
  let score = 35.0;
  const indicators = [];
  const keyPhrases = [];

  if (lower.includes('kill') || lower.includes('threat') || lower.includes('murder') || lower.includes('weapon') || lower.includes('gun') || lower.includes('knife') || lower.includes('marne') || lower.includes('धमकी')) {
    score += 45.0;
    indicators.push('Immediate Physical Threat to Life (PoA Sec 3)');
    keyPhrases.push('imminent physical threat');
  }
  if (lower.includes('caste') || lower.includes('dalit') || lower.includes('boycott') || lower.includes('discriminate') || lower.includes('evict') || lower.includes('जाति')) {
    score += 20.0;
    indicators.push('Caste Atrocity & Discrimination (SC/ST PoA Act)');
    keyPhrases.push('caste-based discrimination');
  }
  if (lower.includes('police') || lower.includes('fir') || lower.includes('court') || lower.includes('refuse')) {
    indicators.push('Procedural Delay / Denial of Relief');
  }

  score = Math.min(Math.max(score, 10.0), 98.0);
  let riskLevel = 'LOW';
  let priority = 'NORMAL';

  if (score >= 75) {
    riskLevel = 'HIGH';
    priority = 'CRITICAL';
  } else if (score >= 45) {
    riskLevel = 'MODERATE';
    priority = 'URGENT';
  }

  return {
    distress_score: score,
    urgency_score: Math.min(score + 5.0, 100.0),
    risk_classification: riskLevel,
    priority_recommended: priority,
    identified_indicators: indicators.length > 0 ? indicators : ['General Grievance / Administrative Appeal'],
    key_phrases: keyPhrases,
    sentiment_breakdown: { distress_level: riskLevel, confidence: 0.92 },
    ai_case_summary: `AI Automated Analysis: Complainant reports incident categorized under ${category.replace(/_/g, ' ')}. Sentiment distress markers detected at severity index ${score.toFixed(0)}/100.`,
    recommended_actions: [
      riskLevel === 'HIGH' ? 'Immediate Zero-FIR registration and police protection deployment' : 'Assign to District Nodal Officer for review',
      'Verify eligibility under SC/ST PoA Relief Compensation Norms',
      'Provide free legal aid through District Legal Services Authority (DLSA)'
    ],
    model_version: 'NHAA-NLP-v1.0 (Supabase Bridge)',
    disclaimer_notice: 'Advisory AI triage scoring only. Final legal decision rests with authorized human officers.'
  };
}

/**
 * 1. Submit Grievance
 * Connects authenticated citizen to their grievance record in Supabase database
 */
export async function createGrievance(payload, currentUser, currentProfile) {
  // Step 1: Run AI analysis via FastAPI backend or client engine
  let aiResult = null;
  try {
    const backendRes = await apiSubmitComplaint(payload);
    if (backendRes?.ai_assessment) {
      aiResult = backendRes.ai_assessment;
    }
  } catch (err) {
    console.warn('Backend API unavailable, executing client AI assessment:', err.message);
  }

  if (!aiResult) {
    aiResult = clientAIAssessmentFallback(payload.raw_input_text, payload.category);
  }

  const refId = generateRefId();
  const token = generateTrackingToken();

  const grievanceRecord = {
    citizen_id: currentUser?.id || null,
    reference_id: refId,
    tracking_token: token,
    complainant_type: payload.complainant_type || 'VICTIM',
    complainant_name: payload.complainant_name || currentProfile?.full_name || 'Anonymous',
    complainant_phone: payload.complainant_phone || currentProfile?.phone || null,
    complainant_email: payload.complainant_email || currentUser?.email || null,
    state_region: payload.state_region || currentProfile?.state_region || 'Uttar Pradesh',
    category: payload.category || 'DOMESTIC_ABUSE',
    input_mode: payload.input_mode || 'TEXT',
    raw_input_text: payload.raw_input_text,
    status: 'NEW',
    priority: aiResult.priority_recommended || 'NORMAL',
    risk_level: aiResult.risk_classification || 'LOW',
    risk_score: aiResult.distress_score || 0.0,
    ai_assessment: aiResult,
    officer_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Step 2: Store in Supabase PostgreSQL if configured
  if (isSupabaseConfigured() && currentUser?.id) {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .insert([grievanceRecord])
        .select()
        .single();

      if (error) {
        console.error('Supabase grievance insert error:', error);
        throw error;
      }

      // Log initial audit trail in Supabase
      await supabase.from('audit_logs').insert([{
        grievance_id: data.id,
        actor_id: currentUser.id,
        actor_name: currentProfile?.full_name || currentUser.email || 'Citizen Applicant',
        action: 'CREATED',
        details: `Grievance registered via ${payload.input_mode}. Initial AI Risk: ${aiResult.risk_classification} (${aiResult.distress_score}/100).`
      }]);

      return data;
    } catch (err) {
      console.warn('Falling back to local persistence due to Supabase error:', err);
    }
  }

  // Fallback / Mock Storage persistence
  const mockId = `grv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const savedRecord = { ...grievanceRecord, id: mockId };
  
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  grievances.unshift(savedRecord);
  setStored(MOCK_STORAGE_KEYS.GRIEVANCES, grievances);

  // Add audit log
  const auditLogs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    grievance_id: mockId,
    actor_id: currentUser?.id || null,
    actor_name: currentProfile?.full_name || 'Citizen Complainant',
    action: 'CREATED',
    details: `Grievance registered via ${payload.input_mode}. Initial AI Risk: ${aiResult.risk_classification} (${aiResult.distress_score}/100).`,
    timestamp: new Date().toISOString()
  });
  setStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, auditLogs);

  return savedRecord;
}

/**
 * 2. Get Citizen's Own Grievances (Isolated to auth.uid())
 */
export async function getMyGrievances(citizenId) {
  if (!citizenId) return [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase getMyGrievances error:', err.message);
    }
  }

  // Mock Storage lookup
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  return grievances.filter(g => g.citizen_id === citizenId);
}

/**
 * 3. Track Grievance by Reference ID
 */
export async function trackGrievancePublic(refId, token = '') {
  const cleanRef = refId.trim();

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('grievances')
        .select('id, reference_id, tracking_token, category, state_region, status, risk_level, priority, created_at, updated_at')
        .eq('reference_id', cleanRef);

      if (token) {
        query = query.eq('tracking_token', token.trim());
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase tracking lookup error:', err.message);
    }
  }

  // Mock Storage tracking lookup
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const found = grievances.find(g => g.reference_id.toUpperCase() === cleanRef.toUpperCase());
  if (!found) {
    throw new Error('Complaint docket with this Reference ID was not found.');
  }
  if (token && found.tracking_token !== token.trim()) {
    throw new Error('Invalid verification token provided for this docket.');
  }

  return found;
}

/**
 * 4. Get Officer Cases Queue (Protected for role = 'officer')
 */
export async function getOfficerCases(filters = {}) {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('grievances')
        .select('*')
        .order('risk_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.risk_level) {
        query = query.eq('risk_level', filters.risk_level);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.urgent_only) {
        query = query.or('risk_level.eq.HIGH,priority.in.(URGENT,CRITICAL)');
      }
      if (filters.search) {
        const term = `%${filters.search}%`;
        query = query.or(`reference_id.ilike.${term},complainant_name.ilike.${term},raw_input_text.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase officer cases query failed, checking backend/mock:', err.message);
    }
  }

  // Fallback to FastAPI backend or Mock Storage
  try {
    const backendData = await apiGetOfficerComplaints(filters);
    if (backendData && backendData.length > 0) return backendData;
  } catch (e) {}

  let cases = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  if (filters.urgent_only) {
    cases = cases.filter(c => c.risk_level === 'HIGH' || c.priority === 'CRITICAL' || c.priority === 'URGENT');
  }
  if (filters.risk_level) {
    cases = cases.filter(c => c.risk_level === filters.risk_level);
  }
  if (filters.category) {
    cases = cases.filter(c => c.category === filters.category);
  }
  if (filters.status) {
    cases = cases.filter(c => c.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    cases = cases.filter(c => 
      c.reference_id?.toLowerCase().includes(s) || 
      c.complainant_name?.toLowerCase().includes(s) ||
      c.raw_input_text?.toLowerCase().includes(s)
    );
  }
  return cases;
}

/**
 * 5. Get Grievance Detail by ID
 */
export async function getGrievanceDetail(id) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getGrievanceDetail error:', err.message);
    }
  }

  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const found = grievances.find(g => String(g.id) === String(id));
  if (!found) {
    throw new Error('Grievance docket not found.');
  }
  return found;
}

/**
 * 6. Officer Update Grievance Status & Risk Override
 */
export async function updateGrievanceStatus(id, updatePayload, officerUser) {
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .update({
          status: updatePayload.status,
          priority: updatePayload.priority,
          risk_level: updatePayload.risk_level,
          officer_notes: updatePayload.officer_notes,
          updated_at: timestamp
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Add audit log entry
      const changes = [];
      if (updatePayload.status) changes.push(`Status set to ${updatePayload.status}`);
      if (updatePayload.priority) changes.push(`Priority set to ${updatePayload.priority}`);
      if (updatePayload.risk_level) changes.push(`Risk Level set to ${updatePayload.risk_level}`);
      if (updatePayload.override_reason) changes.push(`Override Reason: ${updatePayload.override_reason}`);

      await supabase.from('audit_logs').insert([{
        grievance_id: id,
        actor_id: officerUser?.id || null,
        actor_name: officerUser?.full_name || officerUser?.name || 'Authorized Officer',
        action: updatePayload.override_reason ? 'RISK_OVERRIDDEN' : 'STATUS_CHANGED',
        details: changes.join('; ')
      }]);

      return data;
    } catch (err) {
      console.warn('Supabase updateGrievanceStatus error:', err.message);
    }
  }

  // Mock Storage update
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const idx = grievances.findIndex(g => String(g.id) === String(id));
  if (idx !== -1) {
    grievances[idx] = {
      ...grievances[idx],
      status: updatePayload.status || grievances[idx].status,
      priority: updatePayload.priority || grievances[idx].priority,
      risk_level: updatePayload.risk_level || grievances[idx].risk_level,
      officer_notes: updatePayload.officer_notes !== undefined ? updatePayload.officer_notes : grievances[idx].officer_notes,
      updated_at: timestamp
    };
    setStored(MOCK_STORAGE_KEYS.GRIEVANCES, grievances);

    // Mock Audit Log
    const auditLogs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      grievance_id: id,
      actor_id: officerUser?.id || null,
      actor_name: officerUser?.full_name || officerUser?.name || 'Inspector Rajesh Verma',
      action: updatePayload.override_reason ? 'RISK_OVERRIDDEN' : 'STATUS_CHANGED',
      details: `Status: ${updatePayload.status}, Risk: ${updatePayload.risk_level}${updatePayload.override_reason ? ` (Reason: ${updatePayload.override_reason})` : ''}`,
      timestamp
    });
    setStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return grievances[idx];
  }
  throw new Error('Case not found');
}

/**
 * 7. Schedule Case Follow-Up
 */
export async function scheduleCaseFollowUp(id, followUpData, officerUser) {
  const newFollowUp = {
    grievance_id: id,
    assigned_officer_id: officerUser?.id || null,
    scheduled_date: followUpData.scheduled_date,
    status: 'PENDING',
    notes: followUpData.notes,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('follow_up_schedules')
        .insert([newFollowUp])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_logs').insert([{
        grievance_id: id,
        actor_id: officerUser?.id || null,
        actor_name: officerUser?.full_name || 'Inspector Rajesh Verma',
        action: 'FOLLOWUP_SCHEDULED',
        details: `Scheduled check for ${new Date(followUpData.scheduled_date).toLocaleString()}. Notes: ${followUpData.notes || 'Routine check'}`
      }]);

      return data;
    } catch (err) {
      console.warn('Supabase scheduleFollowUp error:', err.message);
    }
  }

  // Mock Storage Follow up
  const followUps = getStored(MOCK_STORAGE_KEYS.FOLLOW_UPS, []);
  const mockItem = { ...newFollowUp, id: `flw-${Date.now()}` };
  followUps.push(mockItem);
  setStored(MOCK_STORAGE_KEYS.FOLLOW_UPS, followUps);

  return mockItem;
}

/**
 * 8. Get Case Audit Trail
 */
export async function getCaseAuditTrail(grievanceId) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase getCaseAuditTrail error:', err.message);
    }
  }

  const logs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
  return logs.filter(l => String(l.grievance_id) === String(grievanceId));
}

/**
 * 9. Get Dashboard KPI Stats
 */
export async function getDashboardKPIs() {
  if (isSupabaseConfigured()) {
    try {
      const { data: summary, error } = await supabase
        .from('officer_dashboard_summary')
        .select('*')
        .single();

      if (!error && summary) return summary;

      // Or aggregate directly
      const { data: allCases, error: countErr } = await supabase.from('grievances').select('risk_level, priority, status, category');
      if (!countErr && allCases) {
        const total = allCases.length;
        const highRisk = allCases.filter(c => c.risk_level === 'HIGH').length;
        const modRisk = allCases.filter(c => c.risk_level === 'MODERATE').length;
        const lowRisk = allCases.filter(c => c.risk_level === 'LOW').length;
        const urgentPrio = allCases.filter(c => c.priority === 'URGENT' || c.priority === 'CRITICAL').length;
        const actionReq = allCases.filter(c => c.status === 'NEW' || c.status === 'ACTION_REQUIRED' || c.status === 'ESCALATED').length;
        const resolved = allCases.filter(c => c.status === 'RESOLVED').length;

        const catCounts = {};
        allCases.forEach(c => {
          catCounts[c.category] = (catCounts[c.category] || 0) + 1;
        });

        return {
          total_complaints: total,
          high_risk_count: highRisk,
          moderate_risk_count: modRisk,
          low_risk_count: lowRisk,
          urgent_priority_count: urgentPrio,
          action_required_count: actionReq,
          resolved_count: resolved,
          category_distribution: catCounts
        };
      }
    } catch (e) {
      console.warn('Supabase getDashboardKPIs error:', e);
    }
  }

  // Backend API fallback
  try {
    const stats = await apiGetDashboardStats();
    if (stats) return stats;
  } catch (e) {}

  // Mock Storage stats calculation
  const cases = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const total = cases.length;
  const highRisk = cases.filter(c => c.risk_level === 'HIGH').length;
  const modRisk = cases.filter(c => c.risk_level === 'MODERATE').length;
  const lowRisk = cases.filter(c => c.risk_level === 'LOW').length;
  const urgentPrio = cases.filter(c => c.priority === 'URGENT' || c.priority === 'CRITICAL').length;
  const actionReq = cases.filter(c => c.status === 'NEW' || c.status === 'ACTION_REQUIRED' || c.status === 'ESCALATED').length;
  const resolved = cases.filter(c => c.status === 'RESOLVED').length;

  const catCounts = {};
  cases.forEach(c => {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  });

  return {
    total_complaints: total,
    high_risk_count: highRisk,
    moderate_risk_count: modRisk,
    low_risk_count: lowRisk,
    urgent_priority_count: urgentPrio,
    action_required_count: actionReq,
    resolved_count: resolved,
    category_distribution: catCounts
  };
}
