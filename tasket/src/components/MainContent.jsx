import React from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import Dashboard from './Dashboard'
import DepartmentList from './departments/DepartmentList'
import EmployeeList from './employees/EmployeeList'
import EmployeeDetail from './employees/EmployeeDetail'
import Calendar from './Calendar'
import TaskCalendar from './tasks/TaskCalendar'
import DayView from './DayView'
import Reports from './Reports'
import Profile from './Profile'
import ProtectedRoute from './auth/ProtectedRoute'

const MainContent = () => {
  const { currentView, selectedEmployee } = useApp()
  const { isAdmin } = useAuth()

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ProtectedRoute requireAdmin={true}>
            <Dashboard />
          </ProtectedRoute>
        )
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
        // If there's a selected employee, show their specific task calendar
        // Otherwise show the general calendar
        return selectedEmployee ? <TaskCalendar /> : <Calendar />
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
      case 'tasks':
      default:
        // If there's a selected employee, show their specific task calendar
        // Otherwise show the general calendar
        return selectedEmployee ? <TaskCalendar /> : <Calendar />
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {renderContent()}
    </div>
  )
}

export default MainContent
