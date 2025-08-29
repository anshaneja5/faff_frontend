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
      <div className="mobile-padding border-b border-gray-100 dark:border-slate-700 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
        <h2 className="mobile-heading font-bold text-gray-900 dark:text-slate-100 mb-3">Users</h2>
        
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
            <svg className="h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="space-y-2 p-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${
                  selectedUser?.id === user.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-600 shadow-glow dark:shadow-dark-glow' 
                    : 'hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* User Avatar */}
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    selectedUser?.id === user.id 
                      ? 'bg-gradient-to-br from-primary-500 to-blue-600 shadow-glow dark:shadow-dark-glow' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-slate-600 dark:to-slate-500'
                  }`}>
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold truncate ${
                        selectedUser?.id === user.id ? 'text-primary-900 dark:text-primary-100' : 
                        unreadByUserId[user.id] > 0 ? 'text-gray-900 dark:text-slate-100' : 'text-gray-900 dark:text-slate-100'
                      }`}>
                        {user.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {unreadByUserId[user.id] > 0 && selectedUser?.id !== user.id && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 shadow-lg animate-pulse">
                            {unreadByUserId[user.id] > 99 ? '99+' : unreadByUserId[user.id]}
                          </span>
                        )}
                        {selectedUser?.id === user.id && (
                          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-primary-600 rounded-full shadow-glow dark:shadow-dark-glow"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs truncate ${
                      selectedUser?.id === user.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-slate-400'
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
      <div className="mobile-padding border-t border-gray-100 dark:border-slate-700 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-primary-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow dark:shadow-dark-glow">
            <span className="text-white font-bold text-xs sm:text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary-900 dark:text-primary-100 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300 truncate">
              {currentUser.email}
            </p>
          </div>
          <div className="h-2 w-2 bg-primary-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default UserList
