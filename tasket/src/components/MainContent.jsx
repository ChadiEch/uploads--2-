import React from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import Dashboard from './Dashboard'
import DepartmentList from './departments/DepartmentList'
import EmployeeList from './employees/EmployeeList'
import EmployeeDetail from './employees/EmployeeDetail'
// import Calendar from './Calendar'  // Comment out the old calendar
import EnhancedCalendar from './EnhancedCalendar'  // Use the new enhanced calendar
import DayView from './DayView'
import Reports from './Reports'
import Profile from './Profile'
import ProtectedRoute from './auth/ProtectedRoute'
import SearchResults from './SearchResults'
import FilteredTasksView from './FilteredTasksView'
import ProjectList from './projects/ProjectList'
import ProjectTasks from './projects/ProjectTasks'
import NotificationPage from './NotificationPage'

const MainContent = () => {
  const { currentView, searchTerm, navigateTo, selectedProject } = useApp()
  const { isAdmin } = useAuth()

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ProtectedRoute requireAdmin={true}>
            <Dashboard />
          </ProtectedRoute>
        )
      case 'projects':
        return <ProjectList />
      case 'project-tasks':
        return <ProjectTasks />
      case 'departments':
        return (
          <ProtectedRoute requireAdmin={true}>
            <DepartmentList />
          </ProtectedRoute>
        )
      case 'employees':
        return (
          <ProtectedRoute requireAdmin={true}>
            <EmployeeList />
          </ProtectedRoute>
        )
      case 'employee-detail':
        return (
          <ProtectedRoute requireAdmin={true}>
            <EmployeeDetail />
          </ProtectedRoute>
        )
      case 'calendar':
        // Always use the enhanced calendar with 3-step navigation
        return <EnhancedCalendar />
      case 'day-view':
        return <DayView />
      case 'reports':
        return (
          <ProtectedRoute requireAdmin={true}>
            <Reports />
          </ProtectedRoute>
        )
      case 'profile':
        return <Profile />
      case 'search-results':
        return <SearchResults onBack={() => navigateTo('calendar')} />
      case 'filtered-tasks':
        return <FilteredTasksView />
      case 'notifications':
        return <NotificationPage />
      case 'tasks':
        // Always use the enhanced calendar with 3-step navigation
        return <EnhancedCalendar />
      default:
        // Always use the enhanced calendar with 3-step navigation
        return <EnhancedCalendar />
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {renderContent()}
    </div>
  )
}

export default MainContent