import { useState } from 'react'
import { messageAPI } from '../api'

function SearchBar({ currentUserId, onSearchResults }) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError('')

    try {
      const response = await messageAPI.semanticSearch(currentUserId, query.trim(), 10)
      
      if (response.results && response.results.length > 0) {
        onSearchResults(response.results, query.trim())
      } else {
        onSearchResults([], query.trim())
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
      onSearchResults([], query.trim())
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    onSearchResults([], '')
  }

  return (
    <div className="mobile-padding border-b border-gray-100 dark:border-slate-700 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
      <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chat history..."
              className="input-field pl-12"
              disabled={isSearching}
            />
          </div>
          
          <div className="flex space-x-2 sm:space-x-3">
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="btn-primary flex-1 sm:flex-none flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
            
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary px-4 sm:px-6"
              >
                <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-slate-400 text-center">
          💡 Search through your chat history using natural language. Try queries like "meeting tomorrow", "project deadline", or "lunch plans".
        </div>
      </form>
    </div>
  )
}

export default SearchBar
