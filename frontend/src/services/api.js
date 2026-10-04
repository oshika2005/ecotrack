import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecotrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};

// ── Activities ──────────────────────────────────────────────────
export const activityAPI = {
  log: (data) => api.post('/activities/', data),
  list: (skip = 0, limit = 20) => api.get(`/activities/?skip=${skip}&limit=${limit}`),
  stats: () => api.get('/activities/stats'),
};

// ── Carbon Calculator ───────────────────────────────────────────
export const carbonAPI = {
  calculate: (data) => api.post('/carbon/calculate', data),
  history: (skip = 0, limit = 30) => api.get(`/carbon/history?skip=${skip}&limit=${limit}`),
  trends: (days = 30) => api.get(`/carbon/trends?days=${days}`),
};

// ── Challenges ──────────────────────────────────────────────────
export const challengeAPI = {
  list: () => api.get('/challenges/'),
  join: (id) => api.post(`/challenges/${id}/join`),
  complete: (id) => api.post(`/challenges/${id}/complete`),
  my: () => api.get('/challenges/my'),
};

// ── Community ───────────────────────────────────────────────────
export const communityAPI = {
  createPost: (data) => api.post('/community/posts', data),
  listPosts: (skip = 0) => api.get(`/community/posts?skip=${skip}`),
  likePost: (id) => api.post(`/community/posts/${id}/like`),
  addComment: (id, data) => api.post(`/community/posts/${id}/comments`, data),
};

// ── Leaderboard ─────────────────────────────────────────────────
export const leaderboardAPI = {
  get: (limit = 20) => api.get(`/leaderboard/?limit=${limit}`),
};

// ── Marketplace ─────────────────────────────────────────────────
export const marketplaceAPI = {
  listCredit: (data) => api.post('/marketplace/credits', data),
  browse: (status = 'available') => api.get(`/marketplace/credits?status=${status}`),
  purchase: (creditId) => api.post('/marketplace/credits/purchase', { credit_id: creditId }),
  myCredits: () => api.get('/marketplace/my-credits'),
};

export default api;
