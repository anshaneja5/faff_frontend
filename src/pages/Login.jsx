import { useState } from 'react'
import { userAPI } from '../api'

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login flow
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required')
        }

        const response = await userAPI.login(formData.email, formData.password)
        
        if (response.user) {
          // Store user data in localStorage
          localStorage.setItem('userId', response.user.id)
          localStorage.setItem('userName', response.user.name)
          localStorage.setItem('userEmail', response.user.email)
          
          // Call the onLogin callback
          onLogin(response.user)
        }
      } else {
        // Registration flow
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Name, email, and password are required')
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }

        const response = await userAPI.register(formData.name, formData.email, formData.password)
        
        if (response.user) {
          // Store user data in localStorage
          localStorage.setItem('userId', response.user.id)
          localStorage.setItem('userName', response.user.name)
          localStorage.setItem('userEmail', response.user.email)
          
          // Call the onLogin callback
          onLogin(response.user)
        }
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err.response?.data?.error || err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary-200 dark:bg-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 mobile-padding glass rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 dark:border-slate-600/30">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow dark:shadow-dark-glow mb-4 sm:mb-6">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="mobile-heading font-bold text-gray-900 dark:text-slate-100 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Chat App'}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mobile-text">
            {isLogin ? 'Sign in to continue your conversations' : 'Create your account and start chatting'}
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
                              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLogin}
                  className="input-field"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}
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

          <div className="pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="btn-ghost text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
