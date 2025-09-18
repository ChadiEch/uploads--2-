import React from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { currentView, navigateTo } = useApp()
  const { employee, isAdmin, signOut } = useAuth()

  const adminMenuItems = [
    { 
      name: 'Dashboard', 
      key: 'dashboard',
      icon: 'chart-square-bar', 
      onClick: () => navigateTo('dashboard')
    },
    { 
      name: 'Projects', 
      key: 'projects',
      icon: 'folder', 
      onClick: () => navigateTo('projects')
    },
    { 
      name: 'Departments', 
      key: 'departments',
      icon: 'office-building', 
      onClick: () => navigateTo('departments')
    },
    { 
      name: 'Employees', 
      key: 'employees',
      icon: 'users', 
      onClick: () => navigateTo('employees')
    },
    { 
      name: 'Enhanced Calendar', 
      key: 'calendar',
      icon: 'calendar', 
      onClick: () => navigateTo('calendar')
    },
    { 
      name: 'Notifications', 
      key: 'notifications',
      icon: 'bell', 
      onClick: () => navigateTo('notifications')
    },
    { 
      name: 'Reports', 
      key: 'reports',
      icon: 'chart-bar', 
      onClick: () => navigateTo('reports')
    }
  ]

  const employeeMenuItems = [
    { 
      name: 'My Tasks', 
      key: 'calendar',
      icon: 'clipboard-list', 
      onClick: () => navigateTo('calendar')
    },
    { 
      name: 'Projects', 
      key: 'projects',
      icon: 'folder', 
      onClick: () => navigateTo('projects')
    },
    { 
      name: 'Notifications', 
      key: 'notifications',
      icon: 'bell', 
      onClick: () => navigateTo('notifications')
    },
    { 
      name: 'Profile', 
      key: 'profile',
      icon: 'user', 
      onClick: () => navigateTo('profile')
    }
  ]

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems

  const getIcon = (iconName) => {
    const icons = {
      'chart-square-bar': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
      'folder': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      ),
      'office-building': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
        </svg>
      ),
      'users': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      'clipboard-list': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      'calendar': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      'bell': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
        </svg>
      ),
      'user': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    }
    return icons[iconName] || <div className="w-5 h-5 bg-gray-400 rounded"></div>
  }

  const isActiveRoute = (route) => {
    return currentView === route ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500' : 'text-gray-600 hover:bg-gray-50'
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="flex-grow flex flex-col pt-5">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Administrator Panel' : 'Employee Portal'}
          </p>
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`group flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActiveRoute(item.key)}`}
            >
              {getIcon(item.icon)}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {employee?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {employee?.position || 'Employee'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* App Info */}
      <div className="p-4 border-t border-gray-200">
        <div className={`p-3 rounded-lg ${isAdmin ? 'bg-purple-50' : 'bg-indigo-50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
            <span className={`text-sm font-medium ${isAdmin ? 'text-purple-800' : 'text-indigo-800'}`}>
              {isAdmin ? 'Administrator' : 'Employee'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isAdmin ? 'text-purple-600' : 'text-indigo-600'}`}>
            Task Management v2.0
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar