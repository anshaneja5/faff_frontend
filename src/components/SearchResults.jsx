import { formatDistanceToNow } from 'date-fns'

function SearchResults({ results, query, onResultClick }) {
  if (!query) return null

  if (results.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">
          No messages found matching "{query}". Try different keywords or phrases.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Search Results for "{query}"
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Found {results.length} relevant messages
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {results.map((result, index) => (
          <div
            key={result.messageId}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            onClick={() => onResultClick(result)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Score: {(result.score * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 leading-relaxed">
                  {result.text}
                </p>
                
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>
                    From: {result.senderId === result.userId ? 'You' : 'Other'}
                  </span>
                  <span>
                    To: {result.receiverId === result.userId ? 'You' : 'Other'}
                  </span>
                </div>
              </div>
              
              <div className="ml-3 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onResultClick(result)
                  }}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  View Context
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        💡 Results are ranked by semantic similarity. Higher scores indicate more relevant matches.
      </div>
    </div>
  )
}

export default SearchResults
