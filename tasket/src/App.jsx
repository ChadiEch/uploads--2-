import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { WebSocketProvider } from './context/WebSocketContext'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import MobileNavigation from './components/MobileNavigation'
import Login from './components/auth/Login'
import NotificationContainer from './components/NotificationContainer'

function AppContent() {
  const { user, loading, error } = useAuth()

  // Add error boundary for debugging
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Authentication Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <WebSocketProvider>
      <AppProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <Header />
          </div>
          
          {/* Mobile Navigation */}
          <MobileNavigation />
          
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <MainContent />
            </main>
          </div>
          
          {/* Real-time Notifications */}
          <NotificationContainer />
        </div>
      </AppProvider>
    </WebSocketProvider>
  )
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  )
}

export default App
