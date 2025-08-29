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
        <div className="text-center text-gray-500">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600">Start the conversation by sending a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 space-y-6">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-gray-600">
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
          <div className="space-y-3">
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage(message)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium opacity-75">
                      {isOwnMessage(message) ? 'You' : message.sender_name}
                    </span>
                    <span className={`text-xs opacity-75 ${
                      isOwnMessage(message) ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="break-words">
                    {message.message}
                  </div>
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
