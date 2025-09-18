import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import TaskDetail from './tasks/TaskDetail'

const EnhancedCalendar = () => {
  const { tasks, navigateToDayView, selectedEmployee, navigateToCalendar } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('year') // 'year', 'month', or 'days'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [viewingTask, setViewingTask] = useState(null)
  const [taskToView, setTaskToView] = useState(null) // For opening a specific task

  const today = new Date()

  // Check if there's a task to view when component mounts or when tasks change
  useEffect(() => {
    if (taskToView) {
      // Add a small delay to ensure tasks are loaded
      const timer = setTimeout(() => {
        const task = tasks.find(t => t.id === taskToView);
        if (task) {
          setViewingTask(task);
        } else {
          console.warn(`Task with ID ${taskToView} not found`);
        }
        setTaskToView(null); // Clear it after processing
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [taskToView, tasks]);

  // Generate years for selection (10 years before and after current year)
  const generateYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i)
    }
    return years
  }

  // Generate months for selection
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Check if a date has tasks for the selected employee
  const hasTasksOnDate = (year, month, day) => {
    const targetDate = new Date(year, month, day)
    const yearStr = targetDate.getFullYear()
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(targetDate.getDate()).padStart(2, '0')
    const targetDateStr = `${yearStr}-${monthStr}-${dayStr}`

    // Filter tasks by created_at date instead of due_date
    let filteredTasks = tasks.filter(task => {
      if (!task.created_at) return false
      
      let taskDateStr
      try {
        // Parse the date with timezone awareness
        const taskCreatedDate = new Date(task.created_at)
        
        // Extract date part using local time (this handles timezone conversion properly)
        const taskYear = taskCreatedDate.getFullYear()
        const taskMonth = String(taskCreatedDate.getMonth() + 1).padStart(2, '0')
        const taskDay = String(taskCreatedDate.getDate()).padStart(2, '0')
        taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`
        
        return taskDateStr === targetDateStr
      } catch (error) {
        return false
      }
    })
    
    // If there's a selected employee, filter tasks to show only those assigned to the selected employee
    if (selectedEmployee) {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === selectedEmployee.id)
    }
    
    return filteredTasks.length > 0
  }

  // Generate calendar days for a specific month
  const generateCalendarDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayWeekday = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const calendarDays = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day)
    }
    
    return calendarDays
  }

  const getTasksForDay = (day) => {
    if (!day || view !== 'days') return []
    
    // Create date for the specific day using local timezone
    const targetDate = new Date(selectedYear, selectedMonth, day)
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(targetDate.getDate()).padStart(2, '0')
    const targetDateStr = `${year}-${month}-${dayStr}`
    
    // Filter tasks by created_at date instead of due_date
    let filteredTasks = tasks.filter(task => {
      if (!task.created_at) return false
      
      // Handle different date formats and ensure proper comparison
      let taskDateStr
      try {
        // Parse the date with timezone awareness
        const taskCreatedDate = new Date(task.created_at)
        
        // Extract date part using local time (this handles timezone conversion properly)
        const taskYear = taskCreatedDate.getFullYear()
        const taskMonth = String(taskCreatedDate.getMonth() + 1).padStart(2, '0')
        const taskDay = String(taskCreatedDate.getDate()).padStart(2, '0')
        taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`
        
        return taskDateStr === targetDateStr
      } catch (error) {
        console.warn('Date parsing error for task:', task.id, task.created_at)
        return false
      }
    })
    
    // If there's a selected employee, filter tasks to show only those assigned to the selected employee
    if (selectedEmployee) {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === selectedEmployee.id)
    }
    
    return filteredTasks
  }

  const handleYearSelect = (year) => {
    setSelectedYear(year)
    // Keep view as 'year' to show all months on the same page
  }

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex)
    setView('days')
  }

  const handleDayClick = (day) => {
    if (!day) return
    const selectedDate = new Date(selectedYear, selectedMonth, day)
    navigateToDayView(selectedDate)
  }

  // Handle day click in year view
  const handleYearViewDayClick = (year, month, day) => {
    if (!day) return
    const selectedDate = new Date(year, month, day)
    navigateToDayView(selectedDate)
  }

  // Handle month click in year view (navigate to month view)
  const handleYearViewMonthClick = (monthIndex) => {
    setSelectedMonth(monthIndex)
    setView('days')
  }

  const navigateToToday = () => {
    const now = new Date()
    setSelectedYear(now.getFullYear())
    setSelectedMonth(now.getMonth())
    setCurrentDate(now)
    setView('days')
  }

  const goBack = () => {
    if (view === 'month') {
      setView('year');
    } else if (view === 'days') {
      setView('year');
    }
    // Keep selectedEmployee context when going back
  };

  const navigateToAllEmployeesCalendar = () => {
    // Navigate to calendar view but keep the selected employee context
    setCurrentView('calendar');
  };

  const openTaskView = (task) => {
    setViewingTask(task)
  }

  const closeTaskView = () => {
    setViewingTask(null)
  }

  const openTaskById = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setViewingTask(task);
    }
  }

  const openAttachment = (attachment) => {
    if (attachment.type === 'link') {
      window.open(attachment.url, '_blank')
    } else {
      // For documents and photos, open in a new tab
      window.open(attachment.url, '_blank')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-amber-100 text-amber-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'high':
        return 'bg-orange-500'
      case 'urgent':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Function to open a task by ID (to be called from other components)
  const openTaskFromNotification = (taskId) => {
    if (!taskId) {
      console.warn('No task ID provided to openTaskFromNotification');
      return;
    }
    setTaskToView(taskId);
  }

  // Make this function available to other components through context or props
  // For now, we'll just export it as a named export
  window.openTaskFromNotification = openTaskFromNotification;

  return (
    <div className="p-6">
      {/* Header with navigation controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {view === 'year' && 'Calendar Overview'}
            {view === 'month' && `${monthNames[selectedMonth]} ${selectedYear}`}
            {view === 'days' && `${monthNames[selectedMonth]} ${selectedYear}`}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={navigateToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Today
          </button>
          
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={goBack}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <select
              value={selectedYear}
              onChange={(e) => handleYearSelect(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {generateYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Year View - Show all months */}
      {view === 'year' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthNames.map((month, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleYearViewMonthClick(index)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">{month}</h3>
                <span className="text-sm text-gray-500">{selectedYear}</span>
              </div>
              
              {/* Mini calendar for the month */}
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-xs text-center text-gray-500 py-1">{day}</div>
                ))}
                
                {generateCalendarDays(selectedYear, index).map((day, i) => (
                  <div 
                    key={i} 
                    className={`text-xs text-center py-1 rounded-full ${
                      day && hasTasksOnDate(selectedYear, index, day) 
                        ? 'bg-indigo-100 text-indigo-800 font-medium' 
                        : day 
                          ? 'text-gray-700' 
                          : 'text-gray-300'
                    }`}
                  >
                    {day || ''}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Days View - Show calendar for selected month */}
      {view === 'days' && (
        <div className="bg-white rounded-lg shadow">
          {/* Month header */}
          <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
          </div>
          
          {/* Calendar grid */}
          <div className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day.substring(0, 3)}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(selectedYear, selectedMonth).map((day, index) => (
                <div 
                  key={index} 
                  className={`min-h-24 p-2 border border-gray-200 rounded-lg ${
                    day ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${
                    day && 
                    selectedYear === today.getFullYear() && 
                    selectedMonth === today.getMonth() && 
                    day === today.getDate()
                      ? 'bg-blue-50 border-blue-200'
                      : ''
                  }`}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                      <div className="space-y-1">
                        {getTasksForDay(day).slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className="text-xs p-1 bg-indigo-100 text-indigo-800 rounded truncate cursor-pointer hover:bg-indigo-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTaskView(task);
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                        {getTasksForDay(day).length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{getTasksForDay(day).length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetail 
          task={viewingTask} 
          onClose={closeTaskView}
        />
      )}
    </div>
  )
}

export default EnhancedCalendar;