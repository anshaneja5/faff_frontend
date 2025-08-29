import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API functions
export const userAPI = {
  // Create a new user account
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  // Login existing user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Create a new user (legacy - now uses register)
  createUser: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users')
    return response.data
  },
}

export const messageAPI = {
  // Send a message
  sendMessage: async (senderId, receiverId, message) => {
    const response = await api.post('/messages', {
      senderId,
      receiverId,
      message,
    })
    return response.data
  },

  // Get messages for a user
  getMessagesForUser: async (userId, limit = 50) => {
    const response = await api.get(`/messages?userId=${userId}&limit=${limit}`)
    return response.data
  },

  // Get conversation between two users
  getConversation: async (userId1, userId2, limit = 50) => {
    const response = await api.get(
      `/messages/conversation/${userId1}/${userId2}?limit=${limit}`
    )
    return response.data
  },

  // Semantic search through user's messages
  semanticSearch: async (userId, query, limit = 10) => {
    const response = await api.get(
      `/messages/semantic-search?userId=${encodeURIComponent(userId)}&q=${encodeURIComponent(query)}&limit=${limit}`
    )
    return response.data
  },
}

export default api
