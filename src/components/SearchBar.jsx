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
    <div className="p-4 border-b border-gray-200 bg-white">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chat history..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              disabled={isSearching}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear
            </button>
          )}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          💡 Search through your chat history using natural language. Try queries like "meeting tomorrow", "project deadline", or "lunch plans".
        </div>
      </form>
    </div>
  )
}

export default SearchBar
