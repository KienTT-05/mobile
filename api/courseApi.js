import apiClient from './apiClient';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    apiClient.post('/login', { email, password }),

  register: (name, email, password, password_confirmation) =>
    apiClient.post('/register', { name, email, password, password_confirmation }),

  verifyEmail: (email, code) =>
    apiClient.post('/register/verify-email', { email, code }),

  resendOtp: (email) =>
    apiClient.post('/register/resend-otp', { email }),

  getUser: () => apiClient.get('/user'),
};

// ─── Student ──────────────────────────────────────────────────────────────────
export const studentApi = {
  getHome: (params) =>
    apiClient.get('/student/home', { params }),

  search: (params) =>
    apiClient.get('/courses/search', { params }),

  getMyCourses: () => apiClient.get('/student/my-courses'),

  getCourseDetail: (courseGroupId) =>
    apiClient.get(`/courses/${courseGroupId}/detail`),

  getCourseContent: (courseGroupId) =>
    apiClient.get(`/student/courses/${courseGroupId}/learn`),

  updateProgress: (courseGroupId, lessonId) =>
    apiClient.post(`/student/courses/${courseGroupId}/progress`, { lessonId }),

  enrollCourse: (courseGroupId) =>
    apiClient.post(`/student/enroll/${courseGroupId}`),

  submitReview: (courseGroupId, content, rating) =>
    apiClient.post(`/student/courses/${courseGroupId}/comment`, { content, rating }),

  checkout: (courseGroupId, paymentMethod = 'payos') =>
    apiClient.post(`/student/courses/${courseGroupId}/checkout`, { paymentMethod, source: 'app' }),
};

// ─── Lecturer ─────────────────────────────────────────────────────────────────
export const lecturerApi = {
  getStatistics: () => apiClient.get('/lecturer/statistics'),

  getCourses: () => apiClient.get('/lecturer/courses'),

  createCourse: (title) =>
    apiClient.post('/lecturer/courses', { title }),

  getDraft: (courseGroupId) =>
    apiClient.get(`/lecturer/courses/${courseGroupId}/draft`),

  updateDraft: (courseGroupId, data) =>
    apiClient.put(`/lecturer/courses/${courseGroupId}/draft`, data),

  publishCourse: (courseGroupId) =>
    apiClient.post(`/lecturer/courses/${courseGroupId}/publish`),

  unpublishCourse: (courseGroupId) =>
    apiClient.post(`/lecturer/courses/${courseGroupId}/unpublish`),

  updatePrice: (courseGroupId, discountPrice) =>
    apiClient.put(`/lecturer/courses/${courseGroupId}/price`, { discountPrice }),

  getPublishedCourse: (courseGroupId) =>
    apiClient.get(`/lecturer/courses/${courseGroupId}/published`),
};
