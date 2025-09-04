import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const TaskForm = ({ task, employeeId, date, onClose }) => {
  const { createTask, updateTask, deleteTask, userRole, currentUser, employees } = useApp();
  const isEditing = !!task?.id;
  const canEdit = userRole === 'admin' || (userRole === 'employee' && currentUser?.id === employeeId);
  const canDelete = userRole === 'admin';

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date?.split('T')[0] || date || new Date().toISOString().split('T')[0],
    priority: task?.priority || 'medium',
    status: task?.status || 'planned',
    assigned_to: task?.assigned_to || employeeId || currentUser?.id,
    estimated_hours: task?.estimated_hours || '',
    department_id: task?.department_id || currentUser?.department_id,
  });

  const [errors, setErrors] = useState({
    title: '',
    assigned_to: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Assigned employee is required';
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
      if (isEditing) {
        await updateTask(task.id, {
          ...formData,
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null
        });
      } else {
        await createTask({
          ...formData,
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
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
              {userRole === 'admin' ? (
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md ${errors.assigned_to ? 'border-red-500' : 'border-gray-300'} ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
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

              <div>
                <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  id="estimated_hours"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md border-gray-300 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Hours"
                  min="0"
                  step="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`w-full p-2 border rounded-md border-gray-300 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
