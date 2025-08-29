import { formatDistanceToNow } from 'date-fns'

function MessageList({ messages, currentUserId }) {
  // Group messages by date for better organization
  const groupMessagesByDate = (messages) => {
    const groups = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return 'Just now'
    }
  }

  const isOwnMessage = (message) => message.sender_id === currentUserId

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-slate-400">
          <div className="h-16 w-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No messages yet</h3>
          <p className="text-gray-600 dark:text-slate-400">Start the conversation by sending a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4 animate-fade-in">
          {/* Date Header */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-full shadow-soft dark:shadow-dark-soft">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-4">
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-soft ${
                    isOwnMessage(message)
                      ? 'bg-gradient-to-br from-primary-500 to-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-100 dark:border-slate-700'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold opacity-90">
                      {isOwnMessage(message) ? 'You' : message.sender_name}
                    </span>
                    <span className={`text-xs opacity-90 ${
                      isOwnMessage(message) ? 'text-primary-100' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="break-words leading-relaxed">
                    {message.message}
                  </div>
                  
                  {/* Message Status */}
                  {isOwnMessage(message) && (
                    <div className="flex items-center justify-end mt-2">
                      <svg className="h-3 w-3 text-primary-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList
