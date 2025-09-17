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
      // For documents, photos, and videos, construct the full URL if it's a relative path
      if (attachment.url.startsWith('/uploads/')) {
        // Get the base URL without the /api part
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const serverBaseUrl = baseUrl.replace('/api', '');
        return `${serverBaseUrl}${attachment.url}`;
      }
      return attachment.url;
    }
  };

  // Render attachments with appropriate icons and handling
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return null;
    }

    // Separate photos, videos, and documents
    const photos = attachments.filter(attachment => attachment.type === 'photo');
    const videos = attachments.filter(attachment => attachment.type === 'video');
    const documents = attachments.filter(attachment => attachment.type !== 'photo' && attachment.type !== 'video' && attachment.type !== 'link');
    const links = attachments.filter(attachment => attachment.type === 'link');

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
        
        {photos.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-600 mb-1">Photos:</h5>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <a
                  key={index}
                  href={getAttachmentUrl(photo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={getAttachmentUrl(photo)} 
                    alt={photo.name || `Photo ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md border border-gray-300"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-600 mb-1">Videos:</h5>
            <div className="flex flex-wrap gap-2">
              {videos.map((video, index) => (
                <a
                  key={index}
                  href={getAttachmentUrl(video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="text-sm text-gray-700">{video.name || `Video ${index + 1}`}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {(documents.length > 0 || links.length > 0) && (
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-1">Files & Links:</h5>
            <div className="flex flex-wrap gap-2">
              {documents.map((document, index) => (
                <a
                  key={index}
                  href={getAttachmentUrl(document)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 002-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{document.name || `Document ${index + 1}`}</span>
                </a>
              ))}
              {links.map((link, index) => (
                <a
                  key={index}
                  href={getAttachmentUrl(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm text-gray-700">{link.name || link.url || `Link ${index + 1}`}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
              {task.actual_hours !== undefined && task.actual_hours !== null && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Actual Hours</h4>
                  <p className="text-gray-800 mt-1">{task.actual_hours}</p>
                </div>
              )}
              {task.start_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                  <p className="text-gray-800 mt-1">{formatDate(task.start_date)}</p>
                </div>
              )}
              {task.completed_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Completed Date</h4>
                  <p className="text-gray-800 mt-1">{formatDate(task.completed_date)}</p>
                </div>
              )}
            </div>
            
            {renderAttachments(task.attachments)}
            
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