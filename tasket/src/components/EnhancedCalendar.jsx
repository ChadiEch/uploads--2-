import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const EnhancedCalendar = () => {
  const { tasks, navigateToDayView, selectedEmployee, navigateToCalendar } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('year') // 'year', 'month', or 'days'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [viewingTask, setViewingTask] = useState(null)

  const today = new Date()

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
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {selectedEmployee ? `${selectedEmployee.name}'s Calendar` : 
             view === 'year' ? `Year ${selectedYear}` :
             view === 'month' ? `${selectedYear}` :
             `${monthNames[selectedMonth]} ${selectedYear}`}
          </h2>
          <div className="flex space-x-1 md:space-x-2">
            {selectedEmployee && (
              <button
                onClick={navigateToAllEmployeesCalendar}
                className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 touch-manipulation"
              >
                View All Employees
              </button>
            )}
            <button
              onClick={goBack}
              disabled={view === 'year'}
              className={`p-2 rounded-md border border-gray-300 hover:bg-gray-50 touch-manipulation ${view === 'year' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateToToday}
              className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 touch-manipulation"
            >
              Today
              </button>
          </div>
        </div>

        {/* Year Selection View */}
        {view === 'year' && (
          <div className="space-y-6">
            {/* Year Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
              {generateYears().map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`px-3 py-1 rounded-md ${
                    year === selectedYear
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            
            {/* All Months with Days - iPhone-like layout (3 per row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {monthNames.map((month, monthIndex) => {
                const calendarDays = generateCalendarDays(selectedYear, monthIndex)
                const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate()
                
                // Check if current month has any tasks
                const hasTasksInMonth = (() => {
                  for (let day = 1; day <= daysInMonth; day++) {
                    if (hasTasksOnDate(selectedYear, monthIndex, day)) {
                      return true
                    }
                  }
                  return false
                })()
                
                // Check if this is the current month and year
                const isCurrentMonth = selectedYear === today.getFullYear() && monthIndex === today.getMonth()
                
                return (
                  <div 
                    key={monthIndex} 
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleYearViewMonthClick(monthIndex)}
                  >
                    {/* Month Header */}
                    <div className={`text-center py-2 mb-2 rounded-md ${isCurrentMonth ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      <h3 className="font-bold text-sm">{month.substring(0, 3)}</h3>
                    </div>
                    
                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {dayNames.map(day => (
                        <div key={day} className="p-1 text-center text-xs font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        const isToday = day && 
                          selectedYear === today.getFullYear() && 
                          monthIndex === today.getMonth() && 
                          day === today.getDate()
                        
                        // Check if this day has tasks
                        const hasTasks = day && hasTasksOnDate(selectedYear, monthIndex, day)
                        
                        return (
                          <div
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleYearViewDayClick(selectedYear, monthIndex, day);
                            }}
                            className={`
                              h-6 flex items-center justify-center text-xs cursor-pointer rounded-full
                              ${day ? 'hover:bg-gray-200' : ''}
                              ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}
                              ${hasTasks && !isToday ? 'relative font-bold' : ''}
                            `}
                          >
                            {day && (
                              <>
                                {day}
                                {hasTasks && !isToday && (
                                  <div className="absolute bottom-0.5 w-1 h-1 bg-red-500 rounded-full"></div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Month View */}
        {view === 'month' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {monthNames.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`p-3 rounded-md border text-center ${
                  index === selectedMonth && selectedYear === today.getFullYear()
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{month.substring(0, 3)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Days View */}
        {view === 'days' && (
          <>
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(selectedYear, selectedMonth).map((day, index) => {
                const dayTasks = getTasksForDay(day)
                const isToday = day && 
                  selectedYear === today.getFullYear() && 
                  selectedMonth === today.getMonth() && 
                  day === today.getDate()
                
                // Check if this day has tasks (for circle indicator)
                const hasTasks = day && hasTasksOnDate(selectedYear, selectedMonth, day)

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[60px] md:min-h-[80px] p-1 md:p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 touch-manipulation relative
                      ${day ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    {day && (
                      <>
                        {/* Circle indicator for days with tasks */}
                        {hasTasks && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        {dayTasks.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {/* Show fewer tasks on mobile */}
                            {dayTasks.slice(0, window.innerWidth < 768 ? 1 : 2).map(task => (
                              <div
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTaskView(task);
                                }}
                                className={`text-xs px-1 md:px-2 py-0.5 md:py-1 rounded truncate cursor-pointer ${
                                  task.priority === 'high' || task.priority === 'urgent'
                                    ? 'bg-red-100 text-red-800'
                                    : task.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > (window.innerWidth < 768 ? 1 : 2) && (
                              <div className="text-xs text-gray-500">
                                +{dayTasks.length - (window.innerWidth < 768 ? 1 : 2)} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Task Detail Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
                <button
                  onClick={closeTaskView}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{viewingTask.title}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingTask.status)}`}>
                      {viewingTask.status.replace('-', ' ')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ml-2 ${getPriorityColor(viewingTask.priority)}`}></div>
                    <span className="text-xs text-gray-500 ml-1">Priority: {viewingTask.priority}</span>
                  </div>
                </div>
                
                {viewingTask.description && (
                  <div>
                    <p className="text-gray-600">{viewingTask.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{viewingTask.assignedToEmployee?.name || 'Unassigned'}</p>
                  </div>
                  
                  {viewingTask.department && (
                    <div>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium">{viewingTask.department.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="font-medium">
                      {viewingTask.due_date 
                        ? new Date(viewingTask.due_date).toLocaleDateString() 
                        : 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Estimated Hours</p>
                    <p className="font-medium">{viewingTask.estimated_hours || 'Not set'}</p>
                  </div>
                </div>
                
                {/* Attachments Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Attachments</h3>
                  
                  <div className="space-y-3">
                    {viewingTask.attachments && viewingTask.attachments.length > 0 ? (
                      viewingTask.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            {attachment.type === 'link' && (
                              <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                            {attachment.type === 'document' && (
                              <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            {attachment.type === 'photo' && (
                              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                          <button
                            onClick={() => openAttachment(attachment)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Open
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No attachments available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedCalendar