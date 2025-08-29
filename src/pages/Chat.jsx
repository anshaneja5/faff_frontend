import { useState, useEffect, useRef } from 'react'
import { userAPI, messageAPI } from '../api'
import socketManager from '../socket'
import MessageList from '../components/MessageList'
import UserList from '../components/UserList'
import MessageInput from '../components/MessageInput'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import DarkModeToggle from '../components/DarkModeToggle'

function Chat({ currentUser, onLogout }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [unreadByUserId, setUnreadByUserId] = useState({})
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // Handle search results
  const handleSearchResults = (results, query) => {
    setSearchResults(results)
    setSearchQuery(query)
    setShowSearch(true)
  }

  // Handle search result click
  const handleSearchResultClick = (result) => {
    // Find the user this message was sent to/received from
    const otherUserId = result.senderId === currentUser.id ? result.receiverId : result.senderId
    
    // Find the user in our users list
    const otherUser = users.find(u => u.id === otherUserId)
    
    if (otherUser) {
      // Select that user and load the conversation
      handleUserSelect(otherUser)
      setShowSearch(false)
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
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-soft dark:shadow-dark-soft border-b border-gray-100 dark:border-slate-700 mobile-container py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow dark:shadow-dark-glow">
              <span className="text-white font-bold text-sm sm:text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Chat App</h1>
              <div className="flex items-center space-x-3">
                <p className="text-gray-600 dark:text-slate-400 text-sm">Welcome, <span className="font-semibold text-gray-900 dark:text-slate-100">{currentUser.name}</span></p>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${socketManager.getConnectionStatus() ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className={`text-xs font-medium ${socketManager.getConnectionStatus() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {socketManager.getConnectionStatus() ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <DarkModeToggle />
            <button
              onClick={onLogout}
              className="btn-secondary text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-3"
            >
              <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* User List Sidebar - Mobile Responsive */}
        <div className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:w-80 w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed lg:relative inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out lg:transition-none`}>
          <UserList
            users={users}
            currentUser={currentUser}
            selectedUser={selectedUser}
            onUserSelect={(user) => {
              handleUserSelect(user)
              setIsMobileMenuOpen(false) // Close mobile menu when user is selected
            }}
            unreadByUserId={unreadByUserId}
          />
        </div>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

                 {/* Chat Window */}
         <div className="flex-1 flex flex-col">
           {/* Search Bar - Always visible */}
           <SearchBar 
             currentUserId={currentUser.id}
             onSearchResults={handleSearchResults}
           />
           
           {/* Search Results */}
           {showSearch && (
             <SearchResults
               results={searchResults}
               query={searchQuery}
               onResultClick={handleSearchResultClick}
             />
           )}
           
           {selectedUser ? (
             <>
               {/* Chat Header */}
               <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-700 mobile-container py-4">
                 <div className="flex items-center space-x-3 sm:space-x-4">
                   <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow dark:shadow-dark-glow">
                     <span className="text-white font-bold text-sm sm:text-lg">
                       {selectedUser.name.charAt(0).toUpperCase()}
                     </span>
                   </div>
                   <div>
                     <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">{selectedUser.name}</h2>
                     <p className="text-gray-600 dark:text-slate-400 text-sm">{selectedUser.email}</p>
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
                  <div className="px-6 py-3 text-sm text-gray-500 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="font-medium">{selectedUser.name} is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100">
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
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="text-center mobile-padding">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-soft dark:shadow-dark-soft">
                  <svg className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="mobile-heading font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-3">Select a user to start chatting</h3>
                <p className="text-gray-600 dark:text-slate-400 mobile-text">Choose someone from the user list to begin your conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-up border border-red-200">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {/* Success Toast for new messages */}
      {messages.length > 0 && !selectedUser && (
        <div className="fixed bottom-6 left-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-up border border-green-200">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">New messages received! Select a user to start chatting.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
