import { useState, useRef, useEffect } from 'react'

function MessageInput({ onSendMessage, disabled = false, onTypingChange }) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!message.trim() || disabled) return
    
    onSendMessage(message)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    setIsTyping(true)
    if (onTypingChange) onTypingChange(true)
    
    // Clear typing indicator after user stops typing
    clearTimeout(window.typingTimeout)
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false)
      if (onTypingChange) onTypingChange(false)
    }, 1000)
  }

  return (
    <div className="space-y-4 p-6 border-t border-gray-100 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
      {/* Typing Indicator */}
      {isTyping && message.trim() && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 animate-fade-in">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="font-medium">Typing...</span>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            className="input-field resize-none overflow-hidden min-h-[48px] max-h-32"
            rows={1}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
            message.trim() && !disabled
              ? 'btn-primary shadow-soft hover:shadow-glow'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}

export default MessageInput
