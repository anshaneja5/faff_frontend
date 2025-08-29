import { formatDistanceToNow } from 'date-fns'

function SearchResults({ results, query, onResultClick }) {
  if (!query) return null

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-slate-400 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-700">
        <svg className="h-16 w-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-xl font-semibold mb-2">No results found</p>
        <p className="text-gray-600 dark:text-slate-400">Try a different search term or check your spelling</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-700">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Search Results for "{query}"
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Found <span className="font-semibold text-primary-600">{results.length}</span> relevant messages
        </p>
      </div>
      
      <div className="space-y-4 p-6">
        {results.map((result, index) => (
          <div
            key={result.messageId}
            className="card p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => onResultClick(result)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 dark:from-primary-900 dark:to-blue-900 dark:text-primary-300">
                    Score: {(result.score * 100).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center space-x-1">
                    <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-gray-900 dark:text-slate-100 leading-relaxed mb-3">
                  {result.text}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    From: <span className="font-medium">{result.senderId === result.userId ? 'You' : 'Other'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    To: <span className="font-medium">{result.receiverId === result.userId ? 'You' : 'Other'}</span>
                  </span>
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onResultClick(result)
                  }}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-soft hover:shadow-glow"
                >
                  View Context
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 text-sm text-gray-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700">
        💡 Results are ranked by semantic similarity. Higher scores indicate more relevant matches.
      </div>
    </div>
  )
}

export default SearchResults
