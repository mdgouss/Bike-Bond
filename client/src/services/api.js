import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  uploadAvatar: (formData) => api.put('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// User APIs
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  findBuddies: () => api.get('/users/buddies'),
  getUserStats: (id) => api.get(`/users/${id}/stats`)
};

// Bike APIs
export const bikeAPI = {
  getMyBikes: () => api.get('/bikes'),
  getBike: (id) => api.get(`/bikes/${id}`),
  addBike: (data) => api.post('/bikes', data),
  updateBike: (id, data) => api.put(`/bikes/${id}`, data),
  deleteBike: (id) => api.delete(`/bikes/${id}`),
  uploadPhotos: (id, formData) => api.put(`/bikes/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  setPrimary: (id) => api.put(`/bikes/${id}/primary`)
};

// Ride APIs
export const rideAPI = {
  getRides: (params) => api.get('/rides', { params }),
  getRide: (id) => api.get(`/rides/${id}`),
  createRide: (data) => api.post('/rides', data),
  updateRide: (id, data) => api.put(`/rides/${id}`, data),
  endRide: (id, data) => api.put(`/rides/${id}/end`, data),
  deleteRide: (id) => api.delete(`/rides/${id}`),
  joinRide: (id, data) => api.post(`/rides/${id}/join`, data),
  leaveRide: (id) => api.delete(`/rides/${id}/leave`),
  getMyRides: () => api.get('/rides/my'),
  addReview: (id, data) => api.post(`/rides/${id}/reviews`, data)
};

// Forum APIs
export const forumAPI = {
  getCategories: () => api.get('/forum/categories'),
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  updatePost: (id, data) => api.put(`/forum/posts/${id}`, data),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  toggleLike: (id) => api.put(`/forum/posts/${id}/like`),
  addReply: (id, data) => api.post(`/forum/posts/${id}/replies`, data),
  deleteReply: (id) => api.delete(`/forum/replies/${id}`)
};

// Marketplace APIs
export const marketplaceAPI = {
  getListings: (params) => api.get('/marketplace', { params }),
  getListing: (id) => api.get(`/marketplace/${id}`),
  createListing: (data) => api.post('/marketplace', data),
  updateListing: (id, data) => api.put(`/marketplace/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
  markAsSold: (id) => api.put(`/marketplace/${id}/sold`),
  toggleSave: (id) => api.put(`/marketplace/${id}/save`),
  getMyListings: () => api.get('/marketplace/my'),
  getSavedListings: () => api.get('/marketplace/saved'),
  uploadPhotos: (id, formData) => api.put(`/marketplace/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Message APIs
export const messageAPI = {
  getConversations: () => api.get('/messages'),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (userId, data) => api.post(`/messages/${userId}`, data),
  getGroupChats: () => api.get('/messages/groups'),
  getGroupMessages: (chatId, params) => api.get(`/messages/groups/${chatId}`, { params }),
  sendGroupMessage: (chatId, data) => api.post(`/messages/groups/${chatId}`, data),
  createGroupChat: (data) => api.post('/messages/groups', data),
  leaveGroupChat: (chatId) => api.delete(`/messages/groups/${chatId}/leave`)
};

export default api;
