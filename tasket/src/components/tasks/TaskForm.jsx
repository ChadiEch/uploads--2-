import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { tasksAPI } from '../../lib/api'; // Import tasksAPI for file uploads

const TaskForm = ({ task, employeeId, date, onClose }) => {
  const { createTask, updateTask, deleteTask, userRole, currentUser, employees, updateTaskState, addTaskState } = useApp();
  const isEditing = !!task?.id;
  const canEdit = userRole === 'admin' || (userRole === 'employee' && currentUser?.id === employeeId) || (!isEditing && userRole === 'employee' && !employeeId);
  const canDelete = userRole === 'admin' || (userRole === 'employee' && task?.created_by === currentUser?.id);
  const isAdmin = userRole === 'admin';

  // Helper function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date?.split('T')[0] || date || getLocalDateString(),
    priority: task?.priority || 'medium',
    status: task?.status || 'planned',
    assigned_to: task?.assigned_to || employeeId || currentUser?.id,
    estimated_hours: task?.estimated_hours !== undefined && task?.estimated_hours !== null ? task.estimated_hours : 1.00,
    department_id: task?.department_id || currentUser?.department_id,
    attachments: task?.attachments || []
  });

  const [errors, setErrors] = useState({
    title: '',
    assigned_to: '',
    estimated_hours: '',
    general: ''
  });

  const [newAttachment, setNewAttachment] = useState({ type: 'link', url: '', name: '' });
  const [attachmentFiles, setAttachmentFiles] = useState([]); // For file attachments
  const [attachmentFileMap, setAttachmentFileMap] = useState({}); // Map attachment IDs to files

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date?.split('T')[0] || date || getLocalDateString(),
        priority: task.priority || 'medium',
        status: task.status || 'planned',
        assigned_to: task.assigned_to || employeeId || currentUser?.id,
        estimated_hours: task.estimated_hours !== undefined && task.estimated_hours !== null ? task.estimated_hours : 1.00,
        department_id: task.department_id || currentUser?.department_id,
        attachments: task.attachments || []
      });
    }
  }, [task, employeeId, date, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAttachmentChange = (e) => {
    const { name, value } = e.target;
    setNewAttachment({ ...newAttachment, [name]: value });
  };

  // Handle file upload for documents, photos, and videos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Store the files to be uploaded
      const fileAttachments = files.map(file => {
        let type = 'document'; // Default type
        if (file.type.startsWith('image/')) {
          type = 'photo';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        }
        
        return {
          file,
          attachment: {
            id: Date.now() + Math.random(),
            type: type,
            url: URL.createObjectURL(file), // For preview only
            name: file.name
          }
        };
      });
      
      // Update the file map
      const newFileMap = {};
      fileAttachments.forEach(({ file, attachment }) => {
        newFileMap[attachment.id] = file;
      });
      
      setAttachmentFileMap(prev => ({ ...prev, ...newFileMap }));
      
      // Add file info to newAttachment for display (use the first one)
      setNewAttachment(fileAttachments[0].attachment);
    }
  };

  const addAttachment = () => {
    if ((newAttachment.type === 'link' && !newAttachment.url) || 
        ((newAttachment.type === 'document' || newAttachment.type === 'photo') && (!newAttachment.name || !newAttachment.url))) {
      return;
    }
    
    const attachment = {
      id: newAttachment.id || Date.now() + Math.random(), // Use existing ID if it's a file, generate new one for links
      type: newAttachment.type,
      // For file attachments, use a placeholder URL that will be replaced by the server
      // For links, use the actual URL
      url: newAttachment.type === 'link' ? newAttachment.url : (newAttachment.url || ''), 
      name: newAttachment.name || newAttachment.url
    };
    
    setFormData({
      ...formData,
      attachments: [...formData.attachments, attachment]
    });
    
    // Clear newAttachment but preserve file mapping
    setNewAttachment({ type: 'link', url: '', name: '' });
  };

  const removeAttachment = (id) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(attachment => attachment.id !== id)
    });
    
    // Also remove from attachmentFileMap if it's a file
    setAttachmentFileMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    // For admins, allow empty assigned_to (will be handled by backend)
    // For employees, require assigned_to for new tasks
    if (!isAdmin && !formData.assigned_to && !isEditing) {
      newErrors.assigned_to = 'Assigned employee is required';
    }
    // Check if estimated_hours is provided and is a valid number >= 0.01
    const estimatedHours = formData.estimated_hours !== undefined && formData.estimated_hours !== null && formData.estimated_hours !== '' ? parseFloat(formData.estimated_hours) : 1.00;
    if (isNaN(estimatedHours) || estimatedHours < 0.01) {
      newErrors.estimated_hours = 'Estimated hours is required and must be at least 0.01';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setErrors({ title: '', assigned_to: '', estimated_hours: '', general: '' }); // Clear previous errors
    
      // Prepare data with proper type conversion
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours !== undefined && formData.estimated_hours !== null && formData.estimated_hours !== '' ? parseFloat(formData.estimated_hours) : 1.00 // Ensure proper float conversion
      };
    
      // For admin, allow assignment to any employee or no assignment (backend will handle)
      // For employee, keep current behavior
      if (isAdmin) {
        // Admin can assign to any employee or leave it blank
        // If assigned_to is empty string, set it to null so backend can handle it properly
        if (taskData.assigned_to === '') {
          taskData.assigned_to = null;
        }
        // Backend will handle assignment logic
      } else {
        // For non-admins, ensure proper assignment
        // Consistent with backend logic: always assign to current user
        taskData.assigned_to = currentUser?.id;
      }
    
      let result;
      // Get files that need to be uploaded
      const filesToUpload = formData.attachments
        .filter(attachment => attachmentFileMap[attachment.id])
        .map(attachment => attachmentFileMap[attachment.id]);
      
      // Prepare attachments for submission
      // We need to filter out blob URLs and only send valid attachments or placeholders
      const attachmentsForSubmission = formData.attachments.map(attachment => {
        // For file attachments that will be uploaded, ensure they have proper placeholder data
        if ((attachment.type === 'document' || attachment.type === 'photo') && attachmentFileMap[attachment.id]) {
          // Return a clean placeholder without the blob URL
          return {
            ...attachment,
            url: '' // Empty URL for placeholder - will be replaced by backend
          };
        }
        return attachment;
      }).filter(attachment => {
        // Keep all link attachments with valid URLs
        if (attachment.type === 'link') {
          return attachment.url;
        }
        // Keep file attachments (either with files to upload or with existing URLs)
        if (attachment.type === 'document' || attachment.type === 'photo') {
          return attachment.url || attachmentFileMap[attachment.id];
        }
        return false;
      });
      
      // Log for debugging
      console.log('Submitting task data:', taskData);
      console.log('Files to upload:', filesToUpload.length);
      console.log('Attachments for submission:', attachmentsForSubmission);
      
      if (isEditing) {
        // For updates with file attachments, we need to use the API directly
        if (filesToUpload.length > 0) {
          result = await tasksAPI.updateTask(task.id, {
            ...taskData,
            attachments: attachmentsForSubmission
          }, filesToUpload); // Pass files to be uploaded
          
          // Update the context state with the updated task
          // We already have the updated task from our direct API call,
          // so we just need to update the local state without making another API call
          if (result.task) {
            updateTaskState(result.task);
          }
        } else {
          result = await updateTask(task.id, taskData);
        }
      } else {
        // For creation with file attachments, we need to use the API directly
        if (filesToUpload.length > 0) {
          result = await tasksAPI.createTask({
            ...taskData,
            attachments: attachmentsForSubmission
          }, filesToUpload); // Pass files to be uploaded
          
          // Add the new task to the context state
          if (result.task) {
            addTaskState(result.task);
          }
        } else {
          result = await createTask(taskData);
        }
      }
      
      if (result.error) {
        setErrors(prev => ({ ...prev, general: result.error }));
        return;
      }
      
      // Clear attachment file map and new attachment state
      setAttachmentFileMap({});
      setNewAttachment({ type: 'link', url: '', name: '' });
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      // Display backend validation errors
      if (error.message) {
        setErrors(prev => ({ ...prev, general: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Failed to save task. Please try again.' }));
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Helper function to construct proper attachment URL for display
  const getAttachmentDisplayUrl = (attachment) => {
    if (attachment.type === 'link') {
      return attachment.url;
    } else {
      // For documents, photos, and videos, if it's a local URL, use it as is for display
      // If it's a blob URL (from file upload preview), use that
      if (attachment.url && attachment.url.startsWith('blob:')) {
        return attachment.url;
      }
      // For existing attachments, construct the full URL
      if (attachment.url && attachment.url.startsWith('/uploads/')) {
        // Get the base URL without the /api part
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const serverBaseUrl = baseUrl.replace('/api', '');
        return `${serverBaseUrl}${attachment.url}`;
      }
      return attachment.url || '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Task' : 'Add Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!canEdit}
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'} ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              {isAdmin ? (
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md ${errors.assigned_to ? 'border-red-500' : 'border-gray-300'} ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Unassigned</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.position})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="assigned_to"
                  name="assigned_to"
                  value={employees.find(emp => emp.id === formData.assigned_to)?.name || 'Self'}
                  disabled
                  className="w-full p-2 border rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                />
              )}
              {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!canEdit}
                rows={3}
                className={`w-full p-2 border rounded-md border-gray-300 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter task description"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md border-gray-300 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours *</label>
                <input
                  type="text"
                  id="estimated_hours"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md ${errors.estimated_hours ? 'border-red-500' : 'border-gray-300'} ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Hours"
                  required
                />
                {errors.estimated_hours && <p className="text-red-500 text-xs mt-1">{errors.estimated_hours}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="relative">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className={`w-full p-2 pl-10 border rounded-md border-gray-300 appearance-none ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.priority === 'low' ? 'bg-green-500' :
                      formData.priority === 'medium' ? 'bg-blue-500' :
                      formData.priority === 'high' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {/* Priority legend */}
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <div className="flex items-center justify-center py-1 bg-green-50 rounded text-xs text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Low
                  </div>
                  <div className="flex items-center justify-center py-1 bg-blue-50 rounded text-xs text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    Medium
                  </div>
                  <div className="flex items-center justify-center py-1 bg-orange-50 rounded text-xs text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                    High
                  </div>
                  <div className="flex items-center justify-center py-1 bg-red-50 rounded text-xs text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    Urgent
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md border-gray-300 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            {/* Attachments Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Attachments</h3>
              
              {/* Add Attachment Form */}
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <select
                    name="type"
                    value={newAttachment.type}
                    onChange={handleAttachmentChange}
                    className="p-2 border rounded-md border-gray-300"
                  >
                    <option value="link">Link</option>
                    <option value="document">Document</option>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                  
                  {newAttachment.type === 'link' ? (
                    <input
                      type="url"
                      name="url"
                      value={newAttachment.url}
                      onChange={handleAttachmentChange}
                      placeholder="Enter URL"
                      className="p-2 border rounded-md border-gray-300 col-span-2"
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={newAttachment.name}
                        onChange={handleAttachmentChange}
                        placeholder="File name"
                        className="p-2 border rounded-md border-gray-300"
                      />
                      <label className="bg-white text-gray-700 px-3 py-2 border border-gray-300 rounded-md cursor-pointer text-center">
                        <span>Choose File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept={newAttachment.type === 'photo' ? 'image/*' : newAttachment.type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                        />
                      </label>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Attachment List */}
              <div className="space-y-2">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-white border rounded-md">
                    <div className="flex items-center">
                      {attachment.type === 'link' && (
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                      {attachment.type === 'document' && (
                        <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 002-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {attachment.type === 'photo' && (
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {attachment.type === 'video' && (
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                    <div className="flex items-center">
                      {attachment.type !== 'link' && (
                        <a
                          href={getAttachmentDisplayUrl(attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={!canEdit}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.attachments.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No attachments added</p>
                )}
              </div>
            </div>
            
            {!canEdit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  You can only view this task. Contact your administrator to make changes.
                </p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              {isEditing && canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              )}
              
              <div className="flex space-x-4 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {canEdit ? 'Cancel' : 'Close'}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;