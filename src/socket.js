import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.messageHandlers = new Set()
    this.typingHandlers = new Set()
    this.userCreatedHandlers = new Set()
    this.roomUserId = null
  }

  // Connect to the Socket.IO server
  connect(backendUrl = null) {
    const url = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id)
      this.isConnected = true
      // Ensure we (re)join the user's room after connecting/reconnecting
      if (this.roomUserId) {
        this.socket.emit('join', this.roomUserId)
        console.log('Rejoined room for user after connect:', this.roomUserId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      this.isConnected = false
    })

    // Listen for new messages
    this.socket.on('new_message', (message) => {
      console.log('New message received via Socket.IO:', message)
      this.messageHandlers.forEach(handler => handler(message))
    })

    // Listen for typing events
    this.socket.on('typing', (payload) => {
      this.typingHandlers.forEach(handler => handler(payload))
    })

    // Listen for new user creation
    this.socket.on('user_created', (user) => {
      this.userCreatedHandlers.forEach(handler => handler(user))
    })

    // Listen for test messages
    this.socket.on('test_message', (message) => {
      console.log('🧪 Test message received:', message)
    })

    return this.socket
  }

  // Disconnect from the server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Join a user's room
  joinRoom(userId) {
    // Remember desired room so we can join on initial connect and on reconnects
    this.roomUserId = userId

    if (this.socket && this.isConnected) {
      this.socket.emit('join', userId)
      console.log('Joined room for user:', userId)
      return
    }

    // Not connected yet: join as soon as connection is established
    if (this.socket) {
      this.socket.once('connect', () => {
        if (this.roomUserId) {
          this.socket.emit('join', this.roomUserId)
          console.log('Joined room for user after deferred connect:', this.roomUserId)
        }
      })
    } else {
      console.warn('Socket instance not initialized; call connect() first')
    }
  }

  // Add a message handler
  onMessage(handler) {
    this.messageHandlers.add(handler)
  }

  // Remove a message handler
  offMessage(handler) {
    this.messageHandlers.delete(handler)
  }

  // Typing handlers
  onTyping(handler) {
    this.typingHandlers.add(handler)
  }

  offTyping(handler) {
    this.typingHandlers.delete(handler)
  }

  emitTyping(toUserId, fromUserId, isTyping) {
    if (!this.socket || !this.isConnected) return
    this.socket.emit('typing', { to: toUserId, from: fromUserId, isTyping: !!isTyping })
  }

  // User created handlers
  onUserCreated(handler) {
    this.userCreatedHandlers.add(handler)
  }

  offUserCreated(handler) {
    this.userCreatedHandlers.delete(handler)
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected
  }

  // Get socket instance
  getSocket() {
    return this.socket
  }
}

// Create a singleton instance
const socketManager = new SocketManager()

export default socketManager
