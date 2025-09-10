import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TaskForm from './TaskForm';

const TaskDetail = ({ task, onClose }) => {
  const { isAdmin } = useApp();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const employee = task?.assignedToEmployee;
  
  if (!task) {
    return null;
  }
  
  const handleEdit = () => {
    setIsEditMode(true);
  };
  
  const closeEditMode = () => {
    setIsEditMode(false);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to construct proper attachment URL
  const getAttachmentUrl = (attachment) => {
    if (attachment.type === 'link') {
      return attachment.url;
    } else {
      // For documents and photos, construct the full URL if it's a relative path
      if (attachment.url.startsWith('/uploads/')) {
        // Get the base URL without the /api part
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const serverBaseUrl = baseUrl.replace('/api', '');
        return `${serverBaseUrl}${attachment.url}`;
      }
      return attachment.url;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      {isEditMode ? (
        <TaskForm 
          task={task} 
          onClose={closeEditMode}
          employeeId={task.assigned_to}
          date={task.due_date?.split('T')[0]}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 my-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Task Details
              </h2>
              <div className="flex space-x-2">
                {isAdmin && (
                  <button
                    onClick={handleEdit}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(task.status)}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                <div className="flex items-center mt-1">
                  <div className="w-8 h-8 rounded-full mr-2 bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-medium">
                      {employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-800">{employee?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                <p className="text-gray-800 mt-1">{formatDate(task.due_date)}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {task.estimated_hours && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estimated Hours</h4>
                  <p className="text-gray-800 mt-1">{task.estimated_hours}</p>
                </div>
              )}
            </div>
            
            {task.attachments && task.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {task.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={getAttachmentUrl(attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;