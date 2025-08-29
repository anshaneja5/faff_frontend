import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Chat from './pages/Chat'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    
    if (userId && userName && userEmail) {
      setCurrentUser({
        id: userId,
        name: userName,
        email: userEmail
      })
    }
    
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('userId', userData.id)
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userEmail', userData.email)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/chat" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/chat" 
          element={
            currentUser ? (
              <Chat currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={currentUser ? "/chat" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  )
}

export default App
