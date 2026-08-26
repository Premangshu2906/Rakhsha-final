import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected server error occurred';
    return Promise.reject(new Error(message));
  }
);

export const submitComplaint = async (data) => {
  return await api.post('/complaints/submit', data);
};

export const transcribeVoice = async (formData) => {
  return await axios.post(`${API_BASE_URL}/complaints/transcribe`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const trackComplaint = async (refId, token = '') => {
  return await api.get(`/complaints/track/${refId}`, { params: { token } });
};

export const getHelplines = async () => {
  return await api.get('/complaints/helplines');
};

export const getDashboardStats = async () => {
  return await api.get('/officer/dashboard/stats');
};

export const getOfficerComplaints = async (filters = {}) => {
  return await api.get('/officer/complaints', { params: filters });
};

export const getComplaintDetail = async (id) => {
  return await api.get(`/officer/complaints/${id}`);
};

export const updateComplaintStatus = async (id, updateData, officerUsername = 'officer_sharma') => {
  return await api.patch(`/officer/complaints/${id}`, updateData, {
    params: { officer_username: officerUsername }
  });
};

export const scheduleFollowUp = async (id, followUpData, officerUsername = 'officer_sharma') => {
  return await api.post(`/officer/complaints/${id}/follow-up`, followUpData, {
    params: { officer_username: officerUsername }
  });
};

export const getAuditTrail = async (id) => {
  return await api.get(`/officer/complaints/${id}/audit-trail`);
};

export const reseedDemoData = async () => {
  return await api.post('/officer/seed-demo');
};

export const loginOfficer = async (username, password) => {
  return await api.post('/auth/login', { username, password });
};

export default api;
