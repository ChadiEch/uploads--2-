import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { BarChart } from './charts/BarChart'
import { PieChart } from './charts/PieChart'
import { LineChart } from './charts/LineChart'
import { AreaChart } from './charts/AreaChart'

// Helper function to normalize dates for comparison
const normalizeDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  // Reset time part to compare only dates
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper function to check if a task is overdue
const isOverdue = (task) => {
  // Check if task has a due date and is not completed
  if (!task.due_date || task.status === 'completed') {
    return false
  }
  
  // Normalize dates for comparison
  const dueDate = normalizeDate(task.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // A task is overdue if its due date is before today (not including today)
  return dueDate < today
}

// Helper function to check if a task is high priority
const isHighPriority = (task) => {
  return task.priority === 'high' || task.priority === 'urgent'
}

const Reports = () => {
  const { tasks, employees, departments, navigateToFilteredTasks, loading } = useApp()
  const { isAdmin } = useAuth()
  
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [dateRange, setDateRange] = useState('30') // days

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view reports.</p>
        </div>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Handle case where there are no tasks
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600">There are no tasks to generate reports from.</p>
        </div>
      </div>
    )
  }

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))
    
    const filtered = tasks.filter(task => {
      // Date range filter - but always include overdue tasks regardless of creation date
      // This ensures that overdue tasks are always visible in reports, even if they were
      // created outside the selected date range
      const taskDate = new Date(task.created_at)
      const isTaskOverdue = isOverdue(task)
      
      // Include tasks that are either within the date range OR are overdue
      if (taskDate < cutoffDate && !isTaskOverdue) {
        return false
      }
      
      // Department filter
      if (selectedDepartment && task.department_id !== selectedDepartment) {
        return false
      }
      
      // Employee filter
      if (selectedEmployee && task.assigned_to !== selectedEmployee) {
        return false
      }
      
      return true
    })
    
    return filtered
  }, [tasks, selectedDepartment, selectedEmployee, dateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(t => t.status === 'completed').length
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length
    const overdue = filteredTasks.filter(isOverdue).length
    const highPriority = filteredTasks.filter(isHighPriority).length
    
    // Time tracking calculations
    const estimatedHours = filteredTasks.reduce((sum, task) => {
      return sum + (parseFloat(task.estimated_hours) || 0)
    }, 0)
    
    const actualHours = filteredTasks.reduce((sum, task) => {
      return sum + (parseFloat(task.actual_hours) || 0)
    }, 0)
    
    const efficiency = estimatedHours > 0 && actualHours > 0 ? Math.round((actualHours / estimatedHours) * 100) : (actualHours > 0 ? 100 : 0)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    // Performance score based on multiple factors
    const performanceScore = (() => {
      const completionWeight = 0.5;
      const efficiencyWeight = 0.3;
      const overdueWeight = 0.2;
      
      const overduePenalty = total > 0 ? (overdue / total) * 100 : 0;
      const efficiencyScore = isNaN(efficiency) ? 0 : efficiency;
      
      let score = (completionRate * completionWeight) + 
                  (efficiencyScore * efficiencyWeight) - 
                  (overduePenalty * overdueWeight);
      
      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));
      return Math.round(score);
    })();
    
    return {
      total,
      completed,
      inProgress,
      overdue,
      highPriority,
      completionRate: isNaN(completionRate) ? 0 : completionRate,
      estimatedHours: estimatedHours.toFixed(2),
      actualHours: actualHours.toFixed(2),
      efficiency: isNaN(efficiency) ? 0 : efficiency,
      performanceScore
    }
  }, [filteredTasks])

  // Prepare data for charts
  const departmentTaskData = useMemo(() => {
    if (!departments || !filteredTasks) return []
    
    const deptMap = {}
    departments.forEach(dept => {
      deptMap[dept.id] = { 
        name: dept.name, 
        total: 0, 
        completed: 0,
        overdue: 0,
        inProgress: 0,
        estimatedHours: 0
      }
    })
    
    filteredTasks.forEach(task => {
      if (task.department_id && deptMap[task.department_id]) {
        const dept = deptMap[task.department_id]
        dept.total++
        if (task.status === 'completed') dept.completed++
        if (isOverdue(task)) dept.overdue++
        if (task.status === 'in-progress') dept.inProgress++
        dept.estimatedHours += parseFloat(task.estimated_hours) || 0
      }
    })
    
    return Object.values(deptMap).map(dept => ({
      name: dept.name,
      total: dept.total,
      completed: dept.completed,
      overdue: dept.overdue,
      inProgress: dept.inProgress,
      avgHoursPerTask: dept.total > 0 ? (isNaN(dept.estimatedHours / dept.total) ? '0.00' : (dept.estimatedHours / dept.total).toFixed(2)) : '0.00',
      productivityScore: dept.total > 0 ? Math.round((isNaN(dept.completed / dept.total) ? 0 : (dept.completed / dept.total)) * 100) : 0
    })).filter(dept => dept.total > 0)
  }, [departments, filteredTasks])

  const employeeTaskData = useMemo(() => {
    if (!employees || !filteredTasks) return []
    
    const empMap = {}
    employees.forEach(emp => {
      empMap[emp.id] = { 
        id: emp.id,
        name: emp.name,
        email: emp.email,
        total: 0, 
        completed: 0,
        overdue: 0,
        inProgress: 0,
        estimatedHours: 0,
        actualHours: 0
      }
    })
    
    filteredTasks.forEach(task => {
      if (task.assigned_to && empMap[task.assigned_to]) {
        const emp = empMap[task.assigned_to]
        emp.total++
        if (task.status === 'completed') emp.completed++
        if (isOverdue(task)) emp.overdue++
        if (task.status === 'in-progress') emp.inProgress++
        emp.estimatedHours += parseFloat(task.estimated_hours) || 0
        emp.actualHours += parseFloat(task.actual_hours) || 0
      }
    })
    
    return Object.values(empMap)
      .filter(emp => emp.total > 0)
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        total: emp.total,
        completed: emp.completed,
        overdue: emp.overdue,
        inProgress: emp.inProgress,
        estimatedHours: isNaN(emp.estimatedHours) ? '0.00' : emp.estimatedHours.toFixed(2),
        actualHours: isNaN(emp.actualHours) ? '0.00' : emp.actualHours.toFixed(2),
        completionRate: emp.total > 0 ? Math.round((isNaN(emp.completed / emp.total) ? 0 : (emp.completed / emp.total)) * 100) : 0
      }))
  }, [employees, filteredTasks])

  const taskStatusData = useMemo(() => {
    const planned = filteredTasks.filter(t => t.status === 'planned').length
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length
    const completed = filteredTasks.filter(t => t.status === 'completed').length
    
    // Handle potential NaN values
    const safePlanned = isNaN(planned) ? 0 : planned
    const safeInProgress = isNaN(inProgress) ? 0 : inProgress
    const safeCompleted = isNaN(completed) ? 0 : completed
    
    return [
      { name: 'Planned', value: safePlanned, color: '#3B82F6' },
      { name: 'In Progress', value: safeInProgress, color: '#F59E0B' },
      { name: 'Completed', value: safeCompleted, color: '#10B981' }
    ]
  }, [filteredTasks])

  // Generate weekly trend data
  const weeklyTrendData = useMemo(() => {
    if (!filteredTasks.length) return []
    
    // Get date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(dateRange))
    
    // Create weekly data points
    const weeks = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= new Date()) {
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      weeks.push({
        start: new Date(currentDate),
        end: weekEnd
      })
      
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    // Calculate data for each week
    return weeks.map((week, index) => {
      const weekTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.created_at)
        return taskDate >= week.start && taskDate <= week.end
      })
      
      const completedTasks = weekTasks.filter(task => task.status === 'completed').length
      const inProgressTasks = weekTasks.filter(task => task.status === 'in-progress').length
      const createdTasks = weekTasks.length
      const overdueTasks = weekTasks.filter(isOverdue).length
      
      // Handle potential NaN values
      const safeCompleted = isNaN(completedTasks) ? 0 : completedTasks
      const safeInProgress = isNaN(inProgressTasks) ? 0 : inProgressTasks
      const safeCreated = isNaN(createdTasks) ? 0 : createdTasks
      const safeOverdue = isNaN(overdueTasks) ? 0 : overdueTasks
      
      return {
        week: `Week ${index + 1}`,
        completed: safeCompleted,
        inProgress: safeInProgress,
        created: safeCreated,
        overdue: safeOverdue
      }
    })
  }, [filteredTasks, dateRange])

  const handleNavigateToFilteredTasks = (filterType) => {
    navigateToFilteredTasks(filterType)
  }

  // Get overall productivity status
  const getOverallProductivityStatus = () => {
    console.log('Completion rate for productivity status:', stats.completionRate);
    if (stats.completionRate >= 80) return { status: 'Excellent', color: 'text-green-600' }
    if (stats.completionRate >= 60) return { status: 'Good', color: 'text-blue-600' }
    if (stats.completionRate >= 40) return { status: 'Average', color: 'text-yellow-600' }
    return { status: 'Needs Improvement', color: 'text-red-600' }
  }

  const productivityStatus = getOverallProductivityStatus()
  
  // Get productivity status description
  const getProductivityDescription = () => {
    switch(productivityStatus.status) {
      case 'Excellent':
        return 'Outstanding performance with high task completion rates.'
      case 'Good':
        return 'Solid performance with good task completion rates.'
      case 'Average':
        return 'Moderate performance, opportunities for improvement.'
      case 'Needs Improvement':
        return 'Low completion rate. Immediate attention required to improve productivity.'
      default:
        return ''
    }
  }
  
  const productivityDescription = getProductivityDescription()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            productivityStatus.status === 'Needs Improvement' ? 'bg-red-100 text-red-800 animate-pulse' :
            productivityStatus.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
            productivityStatus.status === 'Good' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            Overall Productivity: {productivityStatus.status}
          </span>
        </div>
      </div>
      
      {/* Productivity Status Banner */}
      <div className={`${
        productivityStatus.status === 'Needs Improvement' ? 'bg-red-50 border-l-4 border-red-500' :
        productivityStatus.status === 'Average' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
        productivityStatus.status === 'Good' ? 'bg-blue-50 border-l-4 border-blue-500' :
        'bg-green-50 border-l-4 border-green-500'
      } p-4 mb-6`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className={`h-5 w-5 ${
              productivityStatus.status === 'Needs Improvement' ? 'text-red-400' :
              productivityStatus.status === 'Average' ? 'text-yellow-400' :
              productivityStatus.status === 'Good' ? 'text-blue-400' :
              'text-green-400'
            }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              {productivityStatus.status === 'Needs Improvement' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              )}
            </svg>
          </div>
          <div className="ml-3">
            <p className={`text-sm ${
              productivityStatus.status === 'Needs Improvement' ? 'text-red-700' :
              productivityStatus.status === 'Average' ? 'text-yellow-700' :
              productivityStatus.status === 'Good' ? 'text-blue-700' :
              'text-green-700'
            }`}>
              <span className="font-medium">
                {productivityStatus.status === 'Needs Improvement' ? 'Attention Required:' : 'Productivity Status:'}
              </span> {productivityDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDepartment('')
                setSelectedEmployee('')
                setDateRange('30')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Task Distribution</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleNavigateToFilteredTasks('highPriority')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">High Priority</p>
              <p className="text-lg font-semibold text-gray-900">{stats.highPriority}</p>
              <p className="text-xs text-gray-500">Click to view</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleNavigateToFilteredTasks('overdue')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{stats.overdue}</p>
              <p className="text-xs text-gray-500">Click to view</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Completion Rate</p>
              <p className="text-lg font-semibold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Estimated Hours</p>
              <p className="text-lg font-semibold text-gray-900">{stats.estimatedHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Actual Hours</p>
              <p className="text-lg font-semibold text-gray-900">{stats.actualHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">{!isFinite(stats.efficiency) || isNaN(stats.efficiency) ? 'NaN' : stats.efficiency}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.performanceScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Productivity</p>
              <p className={`text-lg font-semibold ${productivityStatus.color}`}>{productivityStatus.status}</p>
              <p className="text-xs text-gray-500">Completion: {stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Task Status</h2>
          <PieChart data={taskStatusData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Tasks by Department</h2>
          <BarChart data={departmentTaskData} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Tasks by Employee</h2>
          <BarChart data={employeeTaskData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Weekly Task Trend</h2>
          <AreaChart data={weeklyTrendData} />
        </div>
      </div>

      {/* Employee Performance Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Employee Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeTaskData.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.overdue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.inProgress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.estimatedHours}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Department Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Hours/Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productivity Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentTaskData.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.overdue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.inProgress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.avgHoursPerTask}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.productivityScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports