import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const EnhancedCalendar = () => {
  const { tasks, navigateToDayView, selectedEmployee } = useApp()
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

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1)
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0)
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
    
    // Filter tasks by date first
    let filteredTasks = tasks.filter(task => {
      if (!task.due_date) return false
      
      // Handle different date formats and ensure proper comparison
      let taskDateStr
      try {
        // If due_date is already a date string in YYYY-MM-DD format
        if (typeof task.due_date === 'string' && task.due_date.includes('-') && !task.due_date.includes('T')) {
          taskDateStr = task.due_date
        } else {
          // Parse as full datetime and extract date part using local time
          const taskDueDate = new Date(task.due_date)
          const taskYear = taskDueDate.getFullYear()
          const taskMonth = String(taskDueDate.getMonth() + 1).padStart(2, '0')
          const taskDay = String(taskDueDate.getDate()).padStart(2, '0')
          taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`
        }
        
        return taskDateStr === targetDateStr
      } catch (error) {
        console.warn('Date parsing error for task:', task.id, task.due_date)
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
    setView('month')
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

  const navigateToToday = () => {
    const now = new Date()
    setSelectedYear(now.getFullYear())
    setSelectedMonth(now.getMonth())
    setCurrentDate(now)
    setView('days')
  }

  const goBack = () => {
    if (view === 'month') {
      setView('year')
    } else if (view === 'days') {
      setView('month')
    }
  }

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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {selectedEmployee ? `${selectedEmployee.name}'s Calendar` : 
             view === 'year' ? 'Select Year' :
             view === 'month' ? `${selectedYear}` :
             `${monthNames[selectedMonth]} ${selectedYear}`}
          </h2>
          <div className="flex space-x-1 md:space-x-2">
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

        {/* Year View */}
        {view === 'year' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {generateYears().map(year => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`p-3 rounded-md border text-center ${
                  year === selectedYear 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {year}
              </button>
            ))}
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
              {dayNames.map(day => (
                <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, index) => {
                const dayTasks = getTasksForDay(day)
                const isToday = day && 
                  selectedYear === today.getFullYear() && 
                  selectedMonth === today.getMonth() && 
                  day === today.getDate()

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[60px] md:min-h-[80px] p-1 md:p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 touch-manipulation
                      ${day ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    {day && (
                      <>
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