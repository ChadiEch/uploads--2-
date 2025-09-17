import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmployeeForm from './EmployeeForm';
import { getEmployeePhotoUrl, handleImageError } from '../../lib/imageUtils';

const EmployeeDetail = () => {
  const { 
    selectedEmployee, 
    departments, 
    getTasksByEmployee, 
    navigateToDepartmentEmployees,
    isAdmin,
    navigateToTasks
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  
  if (!selectedEmployee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Employee Selected</h2>
          <p className="text-gray-600">Please select an employee to view their profile.</p>
        </div>
      </div>
    );
  }
  
  const employee = selectedEmployee;
  const department = departments.find(d => d.id === employee.department_id);
  const employeeTasks = getTasksByEmployee(employee.id);
  
  const taskStats = {
    total: employeeTasks.length,
    completed: employeeTasks.filter(t => t.status === 'completed').length,
    inProgress: employeeTasks.filter(t => t.status === 'in-progress').length,
    planned: employeeTasks.filter(t => t.status === 'planned').length,
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6 mt-2">
        <button
          onClick={() => navigateToDepartmentEmployees(employee.department_id)}
          className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">{employee.name}</h1>
        
        {isAdmin && !isEditing && (
          <button
            onClick={handleEdit}
            className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Employee
          </button>
        )}
      </div>

      {isEditing ? (
        <EmployeeForm
          employee={employee}
          onClose={closeForm}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Employee Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Employee Information</h2>
              
              <div className="flex flex-col md:flex-row items-center mb-6">
                {/* Employee Photo */}
                <div className="mb-4 md:mb-0 md:mr-6">
                  {employee.photo ? (
                    <img 
                      src={getEmployeePhotoUrl(employee.photo)}
                      alt={employee.name} 
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => handleImageError(e)}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Employee Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-sm text-gray-900">{employee.name || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <p className="text-sm text-gray-900">{employee.position || 'Not provided'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <p className="text-sm text-gray-900">{employee.job_description || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{employee.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{employee.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : employee.role === 'manager'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {employee.role === 'admin' ? 'Administrator' : 
                         employee.role === 'manager' ? 'Manager' : 'Employee'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-sm text-gray-900">{department?.name || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                    <p className="text-sm text-gray-900">
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <p className="text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Task Statistics</h2>
              
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

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // This would navigate to tasks view for this employee
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  View All Tasks
                </button>
                <button
                  onClick={() => {
                    // Navigate to the calendar view for this employee
                    navigateToTasks(employee.id);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;