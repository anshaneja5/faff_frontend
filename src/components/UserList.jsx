import { useState } from 'react'

function UserList({ users, currentUser, selectedUser, onUserSelect, unreadByUserId = {} }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserClick = (user) => {
    onUserSelect(user)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Users</h2>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No users found matching your search.' : 'No users available.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
                              <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-primary-50 border-r-2 border-primary-600' : 
                    unreadByUserId[user.id] > 0 ? 'bg-green-50' : ''
                  }`}
                >
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                                           <p className={`text-sm font-medium truncate ${
                       selectedUser?.id === user.id ? 'text-primary-900' : 
                       unreadByUserId[user.id] > 0 ? 'text-gray-900 font-bold' : 'text-gray-900'
                     }`}>
                       {user.name}
                     </p>
                      <div className="flex items-center space-x-2">
                        {unreadByUserId[user.id] > 0 && selectedUser?.id !== user.id && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full min-w-[20px] h-5">
                            {unreadByUserId[user.id] > 99 ? '99+' : unreadByUserId[user.id]}
                          </span>
                        )}
                        {selectedUser?.id === user.id && (
                          <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs truncate ${
                      selectedUser?.id === user.id ? 'text-primary-700' : 'text-gray-500'
                    }`}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current User Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserList
