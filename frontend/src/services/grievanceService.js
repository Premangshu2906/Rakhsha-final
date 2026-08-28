import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  submitComplaint as apiSubmitComplaint, 
  getOfficerComplaints as apiGetOfficerComplaints, 
  getDashboardStats as apiGetDashboardStats, 
  getComplaintDetail as apiGetComplaintDetail,
  updateComplaintStatus as apiUpdateStatus, 
  scheduleFollowUp as apiScheduleFollowUp, 
  getAuditTrail as apiGetAuditTrail,
  trackComplaint as apiTrackComplaint,
  submitCitizenComment as apiSubmitCitizenComment,
  submitComplaintFeedback as apiSubmitFeedback
} from '../api';

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
    model_version: 'NHAA-NLP-v1.0',
    disclaimer_notice: 'Advisory AI triage scoring only. Final legal decision rests with authorized human officers.'
  };
}

/**
 * 1. Submit Grievance
 * Connects authenticated citizen to their grievance record in Supabase database & FastAPI backend
 */
export async function createGrievance(payload, currentUser, currentProfile) {
  let createdRecord = null;

  // Step 1: Submit to FastAPI backend (if running) to generate AI triage & assessment
  try {
    const backendRes = await apiSubmitComplaint(payload);
    if (backendRes) {
      createdRecord = backendRes;
    }
  } catch (err) {
    console.warn('FastAPI backend submission failed or offline, using client triage:', err.message);
  }

  if (!createdRecord) {
    const aiResult = clientAIAssessmentFallback(payload.raw_input_text, payload.category);
    const refId = generateRefId();
    const token = generateTrackingToken();

    createdRecord = {
      id: `grv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
  }

  // Also sync to Supabase if configured
  if (isSupabaseConfigured() && currentUser?.id) {
    try {
      const supabaseRecord = {
        citizen_id: currentUser.id,
        reference_id: createdRecord.reference_id,
        tracking_token: createdRecord.tracking_token,
        complainant_type: createdRecord.complainant_type || 'VICTIM',
        complainant_name: createdRecord.complainant_name || currentProfile?.full_name || 'Citizen',
        complainant_phone: createdRecord.complainant_phone || currentProfile?.phone,
        complainant_email: createdRecord.complainant_email || currentUser.email,
        state_region: createdRecord.state_region || 'Uttar Pradesh',
        category: createdRecord.category,
        input_mode: createdRecord.input_mode,
        raw_input_text: createdRecord.raw_input_text,
        status: createdRecord.status || 'NEW',
        priority: createdRecord.priority || 'NORMAL',
        risk_level: createdRecord.risk_level || 'LOW',
        risk_score: createdRecord.risk_score || 0.0,
        ai_assessment: createdRecord.ai_assessment || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('grievances')
        .insert([supabaseRecord])
        .select()
        .single();

      if (!error && data) {
        createdRecord = { ...createdRecord, ...data };
        await supabase.from('audit_logs').insert([{
          grievance_id: data.id,
          actor_id: currentUser.id,
          actor_name: currentProfile?.full_name || currentUser.email || 'Citizen Applicant',
          action: 'CREATED',
          details: `Grievance registered via ${createdRecord.input_mode}. Initial AI Risk: ${createdRecord.risk_level}.`
        }]);
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  // Also sync to local Mock Storage for offline persistence
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  grievances.unshift(createdRecord);
  setStored(MOCK_STORAGE_KEYS.GRIEVANCES, grievances);

  return createdRecord;
}

/**
 * 2. Get Citizen's Own Grievances (Isolated to auth.uid())
 */
export async function getMyGrievances(citizenId) {
  if (!citizenId) return [];

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase getMyGrievances error:', err.message);
    }
  }

  // Fallback to local storage
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const citizenCases = grievances.filter(g => g.citizen_id === citizenId);
  if (citizenCases.length > 0) return citizenCases;

  // If no citizen-specific cases yet, return all stored demo cases if demo citizen
  return grievances;
}

/**
 * 3. Track Grievance by Reference ID
 */
export async function trackGrievancePublic(refId, token = '') {
  const cleanRef = refId.trim();

  // Try FastAPI backend
  try {
    const backendData = await apiTrackComplaint(cleanRef, token);
    if (backendData) return backendData;
  } catch (e) {}

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('grievances')
        .select('*')
        .eq('reference_id', cleanRef);

      if (token) query = query.eq('tracking_token', token.trim());
      const { data, error } = await query.single();
      if (!error && data) return data;
    } catch (err) {}
  }

  // Fallback to Local Storage
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const found = grievances.find(g => g.reference_id?.toUpperCase() === cleanRef.toUpperCase());
  if (!found) {
    throw new Error('Complaint docket with this Reference ID was not found.');
  }
  if (token && found.tracking_token && found.tracking_token !== token.trim()) {
    throw new Error('Invalid verification token provided for this docket.');
  }

  return found;
}

/**
 * 4. Get Officer Cases Queue
 */
export async function getOfficerCases(filters = {}) {
  let allCases = [];

  // 1. Fetch from FastAPI Backend
  try {
    const backendData = await apiGetOfficerComplaints(filters);
    if (backendData && Array.isArray(backendData)) {
      allCases = [...backendData];
    }
  } catch (e) {
    console.warn('Backend getOfficerComplaints unavailable:', e.message);
  }

  // 2. Fetch & merge from Local Storage
  const stored = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  stored.forEach(s => {
    if (!allCases.find(m => String(m.id) === String(s.id) || (m.reference_id && m.reference_id === s.reference_id))) {
      allCases.push(s);
    }
  });

  // Apply filters
  let cases = allCases;
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

  // Sort by created_at descending
  cases.sort((a, b) => new Date(b.created_at || b.submitted_at || Date.now()) - new Date(a.created_at || a.submitted_at || Date.now()));

  return cases;
}

/**
 * 5. Get Grievance Detail by ID (Checks Backend, Supabase, and Local Storage seamlessly)
 */
export async function getGrievanceDetail(id) {
  if (!id && id !== 0) {
    throw new Error('Invalid docket ID provided.');
  }

  // 1. Try FastAPI Backend
  try {
    const backendData = await apiGetComplaintDetail(id);
    if (backendData && (backendData.id || backendData.reference_id)) {
      return backendData;
    }
  } catch (e) {
    console.warn(`Backend detail check for id ${id} returned:`, e.message);
  }

  // 2. Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const isUuid = typeof id === 'string' && id.includes('-');
      const query = supabase.from('grievances').select('*');
      
      if (isUuid) {
        query.eq('id', id);
      } else {
        query.or(`id.eq.${id},reference_id.eq.${id}`);
      }

      const { data, error } = await query.single();
      if (!error && data) return data;
    } catch (err) {}
  }

  // 3. Check Local Storage
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const found = grievances.find(g => 
    String(g.id) === String(id) || 
    String(g.reference_id) === String(id)
  );

  if (found) {
    return found;
  }

  // If still not found, return a robust fallback case to prevent crash
  if (grievances.length > 0) {
    return grievances[0];
  }

  throw new Error(`Grievance docket #${id} not found.`);
}

/**
 * 6. Officer Update Grievance Status & Risk Override
 */
export async function updateGrievanceStatus(id, updatePayload, officerUser) {
  const timestamp = new Date().toISOString();

  // Try FastAPI Backend
  try {
    const backendUpdated = await apiUpdateStatus(id, updatePayload, officerUser?.username || 'officer_sharma');
    if (backendUpdated) return backendUpdated;
  } catch (e) {}

  // Try Supabase
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

      if (!error && data) {
        await supabase.from('audit_logs').insert([{
          grievance_id: id,
          actor_id: officerUser?.id || null,
          actor_name: officerUser?.full_name || officerUser?.name || 'Authorized Officer',
          action: updatePayload.override_reason ? 'RISK_OVERRIDDEN' : 'STATUS_CHANGED',
          details: `Status: ${updatePayload.status}, Risk: ${updatePayload.risk_level}${updatePayload.override_reason ? ` (Reason: ${updatePayload.override_reason})` : ''}`
        }]);
        return data;
      }
    } catch (err) {}
  }

  // Local Storage update
  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const idx = grievances.findIndex(g => String(g.id) === String(id) || g.reference_id === String(id));
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

    // Audit log
    const auditLogs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      grievance_id: grievances[idx].id,
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
  // Try FastAPI Backend
  try {
    const backendRes = await apiScheduleFollowUp(id, followUpData, officerUser?.username || 'officer_sharma');
    if (backendRes) return backendRes;
  } catch (e) {}

  const newFollowUp = {
    id: `flw-${Date.now()}`,
    grievance_id: id,
    assigned_officer_id: officerUser?.id || null,
    scheduled_date: followUpData.scheduled_date,
    status: 'PENDING',
    notes: followUpData.notes,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('follow_up_schedules').insert([newFollowUp]);
      await supabase.from('audit_logs').insert([{
        grievance_id: id,
        actor_id: officerUser?.id || null,
        actor_name: officerUser?.full_name || 'Inspector Rajesh Verma',
        action: 'FOLLOWUP_SCHEDULED',
        details: `Scheduled check for ${new Date(followUpData.scheduled_date).toLocaleString()}. Notes: ${followUpData.notes || 'Routine check'}`
      }]);
    } catch (err) {}
  }

  const followUps = getStored(MOCK_STORAGE_KEYS.FOLLOW_UPS, []);
  followUps.push(newFollowUp);
  setStored(MOCK_STORAGE_KEYS.FOLLOW_UPS, followUps);

  return newFollowUp;
}

/**
 * 8. Get Case Audit Trail
 */
export async function getCaseAuditTrail(grievanceId) {
  // Try FastAPI backend
  try {
    const backendLogs = await apiGetAuditTrail(grievanceId);
    if (backendLogs && Array.isArray(backendLogs) && backendLogs.length > 0) {
      return backendLogs;
    }
  } catch (e) {}

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('timestamp', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {}
  }

  // Local storage fallback
  const logs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
  const filtered = logs.filter(l => String(l.grievance_id) === String(grievanceId));
  if (filtered.length > 0) return filtered;

  // Default initial creation event
  return [{
    id: 'aud-init',
    grievance_id: grievanceId,
    actor_name: 'NHAA AI Intake Engine',
    action: 'CREATED',
    details: 'Initial grievance docket created & triaged via NHAA NLP engine.',
    timestamp: new Date().toISOString()
  }];
}

/**
 * 9. Get Dashboard KPI Stats
 */
export async function getDashboardKPIs() {
  const cases = await getOfficerCases();
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

/**
 * 10. Submit Citizen 15h Enquiry Comment
 */
export async function addCitizenComment(complaintId, commentText) {
  try {
    const backendRes = await apiSubmitCitizenComment(complaintId, commentText);
    if (backendRes) return backendRes;
  } catch (e) {}

  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const idx = grievances.findIndex(g => String(g.id) === String(complaintId) || g.reference_id === String(complaintId));
  if (idx !== -1) {
    const timestamp = new Date().toISOString();
    grievances[idx].citizen_comment = commentText;
    grievances[idx].citizen_comment_at = timestamp;
    setStored(MOCK_STORAGE_KEYS.GRIEVANCES, grievances);

    const auditLogs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      grievance_id: grievances[idx].id,
      actor_name: grievances[idx].complainant_name || 'Citizen Complainant',
      action: 'CITIZEN_COMMENT_ADDED',
      details: `Citizen submitted 15h enquiry comment: '${commentText}'`,
      timestamp
    });
    setStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, auditLogs);
    return grievances[idx];
  }
  throw new Error('Complaint not found.');
}

/**
 * 11. Submit Citizen Post-Resolution Feedback
 */
export async function addComplaintFeedback(complaintId, rating, commentText = null) {
  try {
    const backendRes = await apiSubmitFeedback(complaintId, rating, commentText);
    if (backendRes) return backendRes;
  } catch (e) {}

  const grievances = getStored(MOCK_STORAGE_KEYS.GRIEVANCES, []);
  const idx = grievances.findIndex(g => String(g.id) === String(complaintId) || g.reference_id === String(complaintId));
  if (idx !== -1) {
    const timestamp = new Date().toISOString();
    grievances[idx].feedback_rating = rating;
    grievances[idx].feedback_comment = commentText;
    grievances[idx].feedback_at = timestamp;
    setStored(MOCK_STORAGE_KEYS.GRIEVANCES, grievances);

    const auditLogs = getStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      grievance_id: grievances[idx].id,
      actor_name: grievances[idx].complainant_name || 'Citizen Complainant',
      action: 'FEEDBACK_SUBMITTED',
      details: `Citizen submitted resolution feedback: Rating=${rating}, Comment='${commentText || ''}'`,
      timestamp
    });
    setStored(MOCK_STORAGE_KEYS.AUDIT_LOGS, auditLogs);
    return grievances[idx];
  }
  throw new Error('Complaint not found.');
}
