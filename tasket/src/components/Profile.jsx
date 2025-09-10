import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const Profile = () => {
  const { employee, updateProfile, isAdmin } = useAuth() // Get isAdmin from useAuth instead of useApp
  const { departments, getMyTasks } = useApp() // Remove isAdmin from useApp
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    position: employee?.position || '',
    phone: employee?.phone || '',
    department_id: employee?.department_id || '',
    email: employee?.email || '',
    password: '',
    confirmPassword: '',
    job_description: employee?.job_description || '',
    photo: employee?.photo || ''
  })
  const [previewPhoto, setPreviewPhoto] = useState(employee?.photo || '')

  const myTasks = getMyTasks()
  const taskStats = {
    total: myTasks.length,
    completed: myTasks.filter(t => t.status === 'completed').length,
    inProgress: myTasks.filter(t => t.status === 'in-progress').length,
    planned: myTasks.filter(t => t.status === 'planned').length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate password fields if changing password
      if ((formData.password || formData.confirmPassword)) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        if (formData.password && formData.password.length < 6) {
          setError('Password must be at least 6 characters long')
          setLoading(false)
          return
        }
      }

      // Prepare data - only admin users can edit all fields
      let updateData = { 
        name: formData.name, 
        position: formData.position, 
        phone: formData.phone, 
        department_id: formData.department_id,
        email: formData.email,
        job_description: formData.job_description,
        ...(formData.password && { password: formData.password })
      }

      // Handle photo upload - only for admin users
      if (isAdmin && formData.photo && formData.photo instanceof File) {
        updateData.photo = formData.photo
      } else if (isAdmin && typeof formData.photo === 'string' && formData.photo !== employee?.photo) {
        // If it's a string but different from current photo, it might be a base64 preview
        // In this case, we'll send it as is (for backward compatibility)
        updateData.photo = formData.photo
      }

      await updateProfile(updateData)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    // Only allow changes for admin users
    if (!isAdmin) return;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Handle photo file upload - only for admin users
  const handlePhotoUpload = (e) => {
    // Only allow photo upload for admin users
    if (!isAdmin) return;
    
    const file = e.target.files[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, GIF)')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewPhoto(reader.result)
    }
    reader.readAsDataURL(file)

    // Store the actual file for upload
    setFormData(prev => ({
      ...prev,
      photo: file
    }))
  }

  const handleCancel = () => {
    setFormData({
      name: employee?.name || '',
      position: employee?.position || '',
      phone: employee?.phone || '',
      department_id: employee?.department_id || '',
      email: employee?.email || '',
      password: '',
      confirmPassword: '',
      job_description: employee?.job_description || '',
      photo: employee?.photo || ''
    })
    setPreviewPhoto(employee?.photo || '')
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          {/* Only show edit button for admin users */}
          {!isEditing && isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Only admin users can edit fields */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Job Description field - only for admin users */}
                  <div>
                    <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description
                    </label>
                    <textarea
                      id="job_description"
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleChange}
                      rows="3"
                      disabled={!isAdmin} // Disable for non-admin users
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Enter your job description"
                    />
                  </div>

                  {/* Photo upload field - only for admin users */}
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={previewPhoto?.startsWith('/uploads/') 
                              ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002'}${previewPhoto}` 
                              : (previewPhoto || '/default-avatar.png')}
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                              e.target.onerror = null;
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <label 
                            htmlFor="photo-upload"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
                          >
                            Upload Photo
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    {isAdmin && ( // Only show save button for admin users
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={employee?.photo ? `${import.meta.env.VITE_API_BASE_URL || ''}${employee.photo}` : '/default-avatar.png'}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{employee?.name || 'Not provided'}</h3>
                      <p className="text-sm text-gray-500">{employee?.position || 'Position not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{employee?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="mt-1 text-sm text-gray-900">{employee?.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <p className="mt-1 text-sm text-gray-900">{employee?.position || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{employee?.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Description</label>
                    <p className="mt-1 text-sm text-gray-900">{employee?.job_description || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {employee?.department?.name || 'Not assigned'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : employee?.role === 'manager'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {employee?.role === 'admin' ? 'Administrator' : 
                         employee?.role === 'manager' ? 'Manager' : 'Employee'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {employee?.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">My Task Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="text-lg font-semibold text-gray-900">{taskStats.total}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-semibold text-green-600">{taskStats.completed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-lg font-semibold text-yellow-600">{taskStats.inProgress}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Planned</span>
                  <span className="text-lg font-semibold text-blue-600">{taskStats.planned}</span>
                </div>

                {taskStats.total > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((taskStats.completed / taskStats.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(taskStats.completed / taskStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h2>
              
              <div className="space-y-3">
                {myTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {myTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile