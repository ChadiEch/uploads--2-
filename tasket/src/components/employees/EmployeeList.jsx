import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmployeeForm from './EmployeeForm';
import { getEmployeePhotoUrl, handleImageError } from '../../lib/imageUtils';

const EmployeeList = () => {
  const { 
    selectedDepartment, 
    getDepartmentById, 
    getEmployeesByDepartment, 
    navigateToEmployee, 
    navigateToTasks,
    navigateToDepartments,
    navigateToCalendar,
    isAdmin
  } = useApp();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const department = selectedDepartment ? getDepartmentById(selectedDepartment.id) : null;
  const employees = selectedDepartment ? getEmployeesByDepartment(selectedDepartment.id) : [];

  const handleAddEmployee = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  if (!department) {
    return null;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6 mt-2">
        <button
          onClick={navigateToDepartments}
          className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">{department.name} Team</h1>
        
        <button
          onClick={navigateToCalendar}
          className="ml-auto text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View Calendar
        </button>
      </div>
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <p className="text-gray-600">{department.description}</p>
        {isAdmin && (
          <button
            onClick={handleAddEmployee}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Add Employee
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {employees.map(employee => (
          <div 
            key={employee.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src={getEmployeePhotoUrl(employee.photo)}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-200" 
                    onError={(e) => handleImageError(e)}
                  />
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">{employee.name}</h2>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => navigateToEmployee(employee.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {employee.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {employee.phone}
                </p>
              </div>
              
              <button
                onClick={() => navigateToTasks(employee.id)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                View Tasks
              </button>
            </div>
          </div>
        ))}
        
        {employees.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500">No employees found in this department</p>
            {isAdmin && (
              <button
                onClick={handleAddEmployee}
                className="mt-4 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Add your first employee
              </button>
            )}
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <EmployeeForm
          departmentId={department.id}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default EmployeeList;