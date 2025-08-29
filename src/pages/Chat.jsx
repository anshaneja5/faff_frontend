import { useState, useEffect, useRef } from 'react'
import { userAPI, messageAPI } from '../api'
import socketManager from '../socket'
import MessageList from '../components/MessageList'
import UserList from '../components/UserList'
import MessageInput from '../components/MessageInput'

function Chat({ currentUser, onLogout }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [unreadByUserId, setUnreadByUserId] = useState({})
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  // Initialize socket connection and load data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initializing chat for user:', currentUser.id)
        
        // Connect to Socket.IO
        socketManager.connect()
        
        // Join user's room
        socketManager.joinRoom(currentUser.id)
        
        // Set up handlers
        socketManager.onMessage(handleNewMessage)
        socketManager.onTyping(handleTyping)
        socketManager.onUserCreated(handleUserCreated)
        
        console.log('Socket handlers set up successfully')
        
        // Load users and messages
        await loadUsers()
        await loadMessages()
        
        setIsLoading(false)
        console.log('Chat initialization complete')
      } catch (err) {
        console.error('Failed to initialize chat:', err)
        setError('Failed to connect to chat. Please refresh the page.')
        setIsLoading(false)
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up chat handlers')
      socketManager.offMessage(handleNewMessage)
      socketManager.offTyping(handleTyping)
      socketManager.offUserCreated(handleUserCreated)
      socketManager.disconnect()
    }
  }, [currentUser.id])

  // Load all users
  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers()
      // Filter out current user
      const otherUsers = response.users.filter(user => user.id !== currentUser.id)
      setUsers(otherUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  // Load messages for current user
  const loadMessages = async () => {
    try {
      const response = await messageAPI.getMessagesForUser(currentUser.id, 100)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  // Handle new message from Socket.IO
  const handleNewMessage = (message) => {
    console.log('New message received via Socket.IO:', message)
    console.log('Current selected user:', selectedUser?.id)
    console.log('Message sender:', message.sender_id)
    console.log('Current user:', currentUser.id)
    
    // Check if message already exists to avoid duplicates
    const messageExists = messages.some(m => m.id === message.id)
    if (messageExists) {
      console.log('Message already exists, skipping')
      return
    }
    
    // Add message to chat if:
    // 1. It's from the currently selected user, OR
    // 2. It's from the current user (sent by us), OR  
    // 3. It's a new message and we should show it in the main messages list
    if (selectedUser && (message.sender_id === selectedUser.id || message.sender_id === currentUser.id)) {
      console.log('Adding message to current chat')
      setMessages(prev => {
        const newMessages = [...prev, message]
        console.log('Updated messages state:', newMessages.length, 'messages')
        return newMessages
      })
    } else if (message.sender_id !== currentUser.id) {
      // Message from another user, but no user is selected
      // Add it to messages list so it shows up in the main view
      console.log('Adding message to main messages list (no user selected)')
      setMessages(prev => {
        const newMessages = [...prev, message]
        console.log('Updated messages state:', newMessages.length, 'messages')
        return newMessages
      })
    }

    // Mark as unread if message is from another user and not from currently selected user
    if (message.sender_id !== currentUser.id && (!selectedUser || selectedUser.id !== message.sender_id)) {
      console.log('Marking message as unread for user:', message.sender_id)
      setUnreadByUserId(prev => ({
        ...prev,
        [message.sender_id]: (prev[message.sender_id] || 0) + 1
      }))
      
      // Show a brief notification toast for new messages
      setError(`New message from ${message.sender_name}`)
      setTimeout(() => setError(''), 3000)
    }
  }

  // Handle typing payloads
  const handleTyping = ({ to, from, isTyping }) => {
    console.log('Typing event received:', { to, from, isTyping, currentUserId: currentUser.id, selectedUserId: selectedUser?.id })
    
    if (to === currentUser.id && from !== currentUser.id) {
      // If we have a selected user and they're typing, show typing indicator
      if (selectedUser && from === selectedUser.id) {
        setIsPartnerTyping(!!isTyping)
        if (isTyping) {
          // auto-clear after a short window in case stop event is missed
          clearTimeout(window.__typingClearTimeout)
          window.__typingClearTimeout = setTimeout(() => setIsPartnerTyping(false), 2000)
        }
      }
    }
  }

  // Handle real-time user creation
  const handleUserCreated = (user) => {
    if (user.id !== currentUser.id) {
      setUsers(prev => {
        const exists = prev.some(u => u.id === user.id)
        return exists ? prev : [...prev, user]
      })
    }
  }

  // Handle sending a message
  const handleSendMessage = async (messageText) => {
    if (!selectedUser || !messageText.trim()) return

    try {
      const response = await messageAPI.sendMessage(
        currentUser.id,
        selectedUser.id,
        messageText.trim()
      )
      
      if (response.data) {
        // Add the sent message to the list immediately
        setMessages(prev => [...prev, response.data])
        console.log('Message sent successfully:', response.data)
      } else {
        console.error('No message data in response:', response)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000)
    }
  }

  // Handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user)
    setError('')
    // Clear unread count for this user
    setUnreadByUserId(prev => {
      const { [user.id]: _, ...rest } = prev
      return rest
    })
    
    try {
      // Load conversation between current user and selected user
      const response = await messageAPI.getConversation(currentUser.id, user.id, 100)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('Failed to load conversation:', err)
      setError('Failed to load conversation. Please try again.')
    }
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('Messages state updated:', messages.length, 'messages')
    if (messages.length > 0) {
      console.log('Latest message:', messages[messages.length - 1])
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
              <p className="text-sm text-gray-600">Welcome, {currentUser.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${socketManager.getConnectionStatus() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {socketManager.getConnectionStatus() ? 'Connected' : 'Disconnected'}
              </span>
            </div>
                         <button
               onClick={onLogout}
               className="btn-secondary"
             >
               Logout
             </button>
             
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* User List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <UserList
            users={users}
            currentUser={currentUser}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            unreadByUserId={unreadByUserId}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  messages={messages}
                  currentUserId={currentUser.id}
                />
                {isPartnerTyping && (
                  <div className="px-6 py-2 text-sm text-gray-500">Typing...</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={!socketManager.getConnectionStatus()}
                  onTypingChange={(isTyping) => {
                    if (selectedUser) {
                      socketManager.emitTyping(selectedUser.id, currentUser.id, isTyping)
                    }
                  }}
                />
              </div>
            </>
          ) : (
            /* No User Selected State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user to start chatting</h3>
                <p className="text-gray-600">Choose someone from the user list to begin your conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      {/* Success Toast for new messages */}
      {messages.length > 0 && !selectedUser && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>New messages received! Select a user to start chatting.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
