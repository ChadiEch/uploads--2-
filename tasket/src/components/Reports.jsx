import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { BarChart } from './charts/BarChart'
import { AreaChart } from './charts/AreaChart'

const Reports = () => {
  const { tasks, employees, departments } = useApp()
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

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesDepartment = !selectedDepartment || task.department_id === selectedDepartment
    const matchesEmployee = !selectedEmployee || task.assigned_to === selectedEmployee
    
    // Date range filter
    const taskDate = new Date(task.created_at)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))
    const matchesDate = taskDate >= cutoffDate
    
    return matchesDepartment && matchesEmployee && matchesDate
  })

  // Calculate comprehensive statistics
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    planned: filteredTasks.filter(t => t.status === 'planned').length,
    cancelled: filteredTasks.filter(t => t.status === 'cancelled').length,
    overdue: filteredTasks.filter(t => {
      const dueDate = new Date(t.due_date)
      return dueDate < new Date() && t.status !== 'completed'
    }).length,
    highPriority: filteredTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
    avgCompletionTime: (() => {
      const completedTasks = filteredTasks.filter(t => t.completed_date && t.start_date)
      if (completedTasks.length === 0) return 0
      const totalTime = completedTasks.reduce((sum, task) => {
        const start = new Date(task.start_date)
        const end = new Date(task.completed_date)
        return sum + (end - start) / (1000 * 60 * 60 * 24) // days
      }, 0)
      return Math.round(totalTime / completedTasks.length * 10) / 10
    })(),
    productivityScore: (() => {
      const total = filteredTasks.length
      if (total === 0) return 0
      const completed = filteredTasks.filter(t => t.status === 'completed').length
      const overdue = filteredTasks.filter(t => {
        const dueDate = new Date(t.due_date)
        return dueDate < new Date() && t.status !== 'completed'
      }).length
      return Math.max(0, Math.round(((completed / total) * 100 - (overdue / total) * 20)))
    })(),
    totalEstimatedHours: filteredTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
    totalActualHours: filteredTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0),
    timeEfficiency: (() => {
      const totalEstimated = filteredTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
      const totalActual = filteredTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0)
      if (totalActual === 0 || totalEstimated === 0) return 0
      return Math.round((totalEstimated / totalActual) * 100)
    })()
  }



  // Department performance data - simplified (no online/instore breakdown)
  const departmentData = departments.map(dept => {
    const deptTasks = filteredTasks.filter(t => t.department_id === dept.id)
    const completed = deptTasks.filter(t => t.status === 'completed').length
    const total = deptTasks.length
    const overdue = deptTasks.filter(t => {
      const dueDate = new Date(t.due_date)
      return dueDate < new Date() && t.status !== 'completed'
    }).length
    const totalHours = deptTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
    const avgHours = total > 0 ? Math.round((totalHours / total) * 10) / 10 : 0
    
    return {
      name: dept.name,
      total: total,
      completed: completed,
      overdue: overdue,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avg_hours: avgHours,
      productivity: total > 0 ? Math.max(0, Math.round(((completed / total) * 100) - ((overdue / total) * 20))) : 0
    }
  }).filter(dept => dept.total > 0)

  // Employee performance data with enhanced metrics
  const employeeData = employees.map(emp => {
    const empTasks = filteredTasks.filter(t => t.assigned_to === emp.id)
    const completed = empTasks.filter(t => t.status === 'completed').length
    const overdue = empTasks.filter(t => {
      const dueDate = new Date(t.due_date)
      return dueDate < new Date() && t.status !== 'completed'
    }).length
    const inProgress = empTasks.filter(t => t.status === 'in-progress').length
    const totalHours = empTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
    const actualHours = empTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0)
    
    return {
      name: emp.name,
      email: emp.email,
      total: empTasks.length,
      completed: completed,
      overdue: overdue,
      inProgress: inProgress,
      completion_rate: empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0,
      estimated_hours: totalHours,
      actual_hours: actualHours,
      efficiency: actualHours > 0 && totalHours > 0 ? Math.round((totalHours / actualHours) * 100) : 0,
      workload: inProgress + empTasks.filter(t => t.status === 'planned').length
    }
  }).filter(emp => emp.total > 0).sort((a, b) => b.completion_rate - a.completion_rate)

  // Weekly productivity data for area chart - improved with better metrics
  const weeklyProductivity = []
  for (let i = 6; i >= 0; i--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const weekCompleted = tasks.filter(t => {
      if (!t.completed_date) return false
      const completedDate = new Date(t.completed_date)
      return completedDate >= weekStart && completedDate <= weekEnd
    })
    
    const weekCreated = tasks.filter(t => {
      const createdDate = new Date(t.created_at)
      return createdDate >= weekStart && createdDate <= weekEnd
    })
    
    const weekInProgress = tasks.filter(t => {
      const startDate = new Date(t.start_date || t.created_at)
      return startDate >= weekStart && startDate <= weekEnd && t.status === 'in-progress'
    })
    
    weeklyProductivity.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: weekCompleted.length,
      created: weekCreated.length,
      inProgress: weekInProgress.length,
      productivity: weekCompleted.length,
      efficiency: weekCompleted.length > 0 ? Math.round((weekCompleted.length / (weekCreated.length || 1)) * 100) : 0
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">Active work</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overdue}</p>
              <p className="text-xs text-gray-500">Need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgCompletionTime}</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productivity</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.productivityScore}</p>
              <p className="text-xs text-gray-500">score</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEstimatedHours}</p>
              <p className="text-xs text-gray-500">estimated</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Time Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.timeEfficiency}%</p>
              <p className="text-xs text-gray-500">{stats.timeEfficiency >= 100 ? 'On track' : 'Over budget'}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h3>
          {departmentData.length > 0 ? (
            <BarChart data={departmentData.map(d => ({ name: d.name, completed: d.completed, total: d.total }))} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Productivity Trend</h3>
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Completed Tasks</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Tasks Created</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span>In Progress</span>
              </div>
            </div>
          </div>
          {weeklyProductivity.length > 0 ? (
            <AreaChart data={weeklyProductivity} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Priority</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.highPriority / stats.total) * 100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-medium">{stats.highPriority}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue Tasks</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.overdue / stats.total) * 100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-medium">{stats.overdue}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-medium">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Management</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Hours</span>
                <span className="font-medium">{stats.totalEstimatedHours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual Hours</span>
                <span className="font-medium">{stats.totalActualHours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className={`h-2 rounded-full ${
                  stats.totalActualHours <= stats.totalEstimatedHours ? 'bg-green-500' : 'bg-red-500'
                }`} style={{width: `${stats.totalEstimatedHours > 0 ? Math.min((stats.totalActualHours / stats.totalEstimatedHours) * 100, 100) : 0}%`}}></div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efficiency</span>
                <span className={`text-sm font-medium ${
                  stats.timeEfficiency >= 100 ? 'text-green-600' : 'text-red-600'
                }`}>{stats.timeEfficiency}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Score</h3>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={stats.productivityScore >= 80 ? '#10B981' : stats.productivityScore >= 60 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(stats.productivityScore / 100) * 251.2}, 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{stats.productivityScore}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Overall Productivity</p>
            <p className={`text-xs font-medium mt-1 ${
              stats.productivityScore >= 80 ? 'text-green-600' : 
              stats.productivityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.productivityScore >= 80 ? 'Excellent' : 
               stats.productivityScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Workload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeData.map(emp => (
                <tr key={emp.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {emp.completed}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.overdue > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {emp.overdue}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emp.workload > 5 ? 'bg-yellow-100 text-yellow-800' : 
                      emp.workload > 2 ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.workload} tasks
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.estimated_hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-20">
                        <div
                          className={`h-2 rounded-full ${
                            emp.completion_rate >= 80 ? 'bg-green-500' :
                            emp.completion_rate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(emp.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium min-w-12">{emp.completion_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Department Performance Details */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Department Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Hours/Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productivity Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.map(dept => (
                <tr key={dept.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {dept.completed}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.overdue > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {dept.overdue}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.avg_hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-20">
                        <div
                          className={`h-2 rounded-full ${
                            dept.productivity >= 80 ? 'bg-green-500' :
                            dept.productivity >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(dept.productivity, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium min-w-12">{dept.productivity}%</span>
                    </div>
                  </td>
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
