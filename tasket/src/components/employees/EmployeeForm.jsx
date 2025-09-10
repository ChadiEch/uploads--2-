import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const EmployeeForm = ({ employee, departmentId, onClose }) => {
  const { addEmployee, updateEmployee, deleteEmployee, departments, isAdmin } = useApp();
  const isEditing = !!employee?.id;
  const [realTimeUpdateEnabled, setRealTimeUpdateEnabled] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Helper function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    position: employee?.position || '',
    job_description: employee?.job_description || '', // Add job description field
    email: employee?.email || '',
    password: '', // Required for new employees
    phone: employee?.phone || '',
    department_id: employee?.department_id || departmentId,
    role: employee?.role || 'employee',
    hire_date: employee?.hire_date ? getLocalDateString(new Date(employee.hire_date)) : getLocalDateString(),
    salary: employee?.salary || '',
    photo: employee?.photo || '' // Add photo field
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    position: ''
  });

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        position: employee.position || '',
        job_description: employee.job_description || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        department_id: employee.department_id || departmentId,
        role: employee.role || 'employee',
        hire_date: employee.hire_date ? getLocalDateString(new Date(employee.hire_date)) : getLocalDateString(),
        salary: employee.salary || '',
        photo: employee.photo || ''
      });
    }
  }, [employee, departmentId]);

  // Auto-save functionality for admin edits
  useEffect(() => {
    if (!isEditing || !isAdmin || !realTimeUpdateEnabled) return;

    const autoSaveDelay = 1000; // 1 second delay after user stops typing
    const timer = setTimeout(() => {
      if (hasChanges()) {
        handleAutoSave();
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [formData, realTimeUpdateEnabled, isEditing, isAdmin]);

  const hasChanges = () => {
    if (!employee) return false;
    return (
      formData.name !== (employee.name || '') ||
      formData.position !== (employee.position || '') ||
      formData.job_description !== (employee.job_description || '') || // Add job description to change detection
      formData.phone !== (employee.phone || '') ||
      formData.department_id !== (employee.department_id || '') ||
      formData.role !== (employee.role || 'employee') ||
      formData.salary !== (employee.salary || '') ||
      formData.photo !== (employee.photo || '') || // Add photo to change detection
      formData.hire_date !== (employee.hire_date ? getLocalDateString(new Date(employee.hire_date)) : getLocalDateString())
    );
  };

  const handleAutoSave = async () => {
    if (!isAdmin || !isEditing) return;

    try {
      const { password, ...updateData } = formData;
      const updatedEmployee = {
        ...employee,
        ...updateData
      };
      
      await updateEmployee(updatedEmployee);
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Enable real-time updates if admin is editing
    if (isAdmin && isEditing && !realTimeUpdateEnabled) {
      setRealTimeUpdateEnabled(true);
    }
  };

  // Handle photo upload (only for admin users)
  const [photoFile, setPhotoFile] = useState(null);
  
  const handlePhotoUpload = (e) => {
    // Only allow photo upload for admin users
    if (!isAdmin) return;
    
    const file = e.target.files[0];
    if (file) {
      // Store the file to be uploaded
      setPhotoFile(file);
      // Show preview using temporary URL
      const photoUrl = URL.createObjectURL(file);
      setFormData({ ...formData, photo: photoUrl });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Password is required and must be at least 6 characters';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If real-time updates are enabled, don't submit the form
    if (realTimeUpdateEnabled && isAdmin && isEditing) {
      onClose();
      return;
    }
    
    if (!validate()) {
      return;
    }
    
    try {
      if (isEditing) {
        // For editing, include all fields
        // If password is empty, exclude it from the update
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        // If we have a photo file, include it in the update
        if (photoFile) {
          updateData.photo = photoFile;
        }
        
        await updateEmployee({
          ...employee,
          ...updateData
        });
      } else {
        // For creating new employee, include all fields including password
        const createData = { ...formData };
        
        // If we have a photo file, include it in the creation
        if (photoFile) {
          createData.photo = photoFile;
        }
        
        await addEmployee(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      // Display backend validation errors
      if (error.message) {
        setErrors(prev => ({ ...prev, general: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Failed to save employee. Please try again.' }));
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee? This may deactivate the employee if they have assigned tasks.')) {
      try {
        const result = await deleteEmployee(employee.id);
        if (result.error) {
          alert(`Failed to delete employee: ${result.error}`);
        } else {
          alert(result.message || 'Employee processed successfully');
          onClose();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Employee' : 'Add Employee'}
              </h2>
              {isEditing && isAdmin && realTimeUpdateEnabled && (
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Auto-save enabled
                  {lastSaveTime && (
                    <span className="ml-2 text-gray-500">
                      (Last saved: {lastSaveTime.toLocaleTimeString()})
                    </span>
                  )}
                </div>
              )}
            </div>
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
            
            {/* Photo Upload Section - Only show for admin users */}
            {isAdmin && (
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  {formData.photo ? (
                    <img 
                      src={typeof formData.photo === 'string' && formData.photo.startsWith('/uploads/') 
                        ? `${import.meta.env.VITE_API_BASE_URL || ''}${formData.photo}` 
                        : formData.photo} 
                      alt="Employee" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-pointer">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to upload photo</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter position"
                />
                {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
              </div>
            </div>
            
            {/* Job Description Field */}
            <div>
              <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                id="job_description"
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-md border-gray-300"
                placeholder="Enter job description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {!isEditing && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter password (min 6 characters)"
                    minLength={6}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}
              {isEditing && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md border-gray-300"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  placeholder="Enter salary"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              {isEditing && isAdmin && (
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
                  {realTimeUpdateEnabled ? 'Close' : 'Cancel'}
                </button>
                {!realTimeUpdateEnabled && (
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

export default EmployeeForm;