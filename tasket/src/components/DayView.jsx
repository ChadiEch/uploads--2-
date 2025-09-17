import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import TaskForm from './tasks/TaskForm'
import { useWebSocket } from '../context/WebSocketContext'

const DayView = () => {
  const { selectedDate, selectedEmployee, getTasksForDate, navigateToCalendar, navigateToTasks, currentUser, deleteTask, isAdmin, tasks } = useApp()
  const { subscribeToTaskUpdates, connected } = useWebSocket()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewingAttachments, setViewingAttachments] = useState(null)
  const [dayTasks, setDayTasks] = useState([])
  
  // Update tasks when date, selected employee, or tasks change
  useEffect(() => {
    if (selectedDate) {
      setDayTasks(getTasksForDate(selectedDate))
    }
  }, [selectedDate, selectedEmployee, getTasksForDate, tasks])
  
  // Subscribe to WebSocket task updates
  useEffect(() => {
    if (connected && subscribeToTaskUpdates) {
      const unsubscribe = subscribeToTaskUpdates((eventData) => {
        // Refresh tasks when there's an update
        if (selectedDate) {
          setDayTasks(getTasksForDate(selectedDate))
        }
      })

      return unsubscribe
    }
  }, [connected, subscribeToTaskUpdates, selectedDate, getTasksForDate, selectedEmployee, tasks])
  
  if (!selectedDate) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="text-center">
          <p className="text-gray-500">No date selected</p>
          <button
            onClick={navigateToCalendar}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 touch-manipulation"
          >
            Back to Calendar
          </button>
        </div>
      </div>
    )
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
        alert('Failed to delete task. Please try again.')
      }
    }
  }

  const closeTaskForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const closeAttachmentsView = () => {
    setViewingAttachments(null)
  }

  const openAttachmentsView = (task) => {
    setViewingAttachments(task)
  }

  // Helper function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  // Helper function to construct proper attachment URL
  const getAttachmentUrl = (attachment) => {
    if (attachment.type === 'link') {
      return attachment.url;
    } else {
      // For documents and photos, construct the full URL if it's a relative path
      if (attachment.url && attachment.url.startsWith('/uploads/')) {
        // Get the base URL without the /api part
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const serverBaseUrl = baseUrl.replace('/api', '');
        return `${serverBaseUrl}${attachment.url}`;
      }
      return attachment.url || '';
    }
  };

  const openAttachment = (attachment) => {
    const url = getAttachmentUrl(attachment);
    if (url) {
      if (attachment.type === 'link') {
        window.open(url, '_blank');
      } else {
        // For documents and photos, open in a new tab
        window.open(url, '_blank');
      }
    }
  }

  // Function to get thumbnail for attachment
  const getAttachmentThumbnail = (attachment) => {
    if (attachment.type === 'photo') {
      return getAttachmentUrl(attachment);
    } else if (attachment.type === 'document') {
      return '/document-icon.png'; // You can replace this with an actual document icon
    } else {
      return '/link-icon.png'; // You can replace this with an actual link icon
    }
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <button
            onClick={() => selectedEmployee && isAdmin ? navigateToTasks(selectedEmployee.id) : navigateToCalendar()}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2 touch-manipulation"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {selectedEmployee && isAdmin ? `Back to ${selectedEmployee.name}'s Calendar` : 'Back to Calendar'}
          </button>
          {selectedEmployee && isAdmin && (
            <button
              onClick={navigateToCalendar}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2 touch-manipulation"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View All Employees
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {selectedEmployee && isAdmin ? (
              <>
                {dateStr}
                <span className="block text-lg text-indigo-600 font-normal">
                  Tasks for {selectedEmployee.name}
                </span>
              </>
            ) : (
              dateStr
            )}
          </h1>
          <p className="text-gray-600">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center touch-manipulation"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {dayTasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedEmployee && isAdmin 
                ? `No tasks assigned to ${selectedEmployee.name} for this day.`
                : 'Get started by creating a new task for this day.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 touch-manipulation"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        ) : (
          dayTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900">{task.title}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)} self-start`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3 text-sm md:text-base">{task.description}</p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs md:text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{task.assignedToEmployee?.name || 'Unassigned'}</span>
                    </div>
                    
                    {task.department && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{task.department.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                      </svg>
                      Priority: {task.priority}
                    </div>
                    
                    {/* Estimated Hours */}
                    {task.estimated_hours && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {task.estimated_hours} hrs
                      </div>
                    )}
                  </div>
                  
                  {/* Attachments Preview with Thumbnails */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {task.attachments.slice(0, 3).map((attachment) => (
                          <div 
                            key={attachment.id} 
                            className="relative cursor-pointer"
                            onClick={() => openAttachment(attachment)}
                          >
                            {attachment.type === 'photo' ? (
                              <img 
                                src={getAttachmentUrl(attachment)} 
                                alt={attachment.name}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                                {attachment.type === 'document' ? (
                                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                )}
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center truncate px-1">
                              {attachment.type === 'photo' ? '📷' : attachment.type === 'document' ? '📄' : '🔗'}
                            </div>
                          </div>
                        ))}
                        {task.attachments.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                            <span className="text-xs text-gray-500">+{task.attachments.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => openAttachmentsView(task)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View All Attachments ({task.attachments.length})
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 self-start">
                  <button 
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 touch-manipulation"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={closeTaskForm}
          date={getLocalDateString(selectedDate)}
          employeeId={selectedEmployee && isAdmin ? selectedEmployee.id : currentUser?.id}
          task={editingTask}
        />
      )}

      {/* Attachments View Modal */}
      {viewingAttachments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Attachments</h2>
                <button
                  onClick={closeAttachmentsView}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">{viewingAttachments.title}</h3>
                <p className="text-sm text-gray-500">{viewingAttachments.description}</p>
              </div>
              
              <div className="space-y-3">
                {viewingAttachments.attachments && viewingAttachments.attachments.length > 0 ? (
                  viewingAttachments.attachments.map((attachment) => (
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
      )}
    </div>
  )
}

export default DayView