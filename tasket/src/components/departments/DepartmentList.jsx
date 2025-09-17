import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DepartmentForm from './DepartmentForm';

const DepartmentList = () => {
  const { departments, employees, navigateToDepartmentEmployees, isAdmin } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);

  const handleAddDepartment = () => {
    setEditDepartment(null);
    setIsFormOpen(true);
  };

  const handleEditDepartment = (department) => {
    setEditDepartment(department);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditDepartment(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl font-semibold text-gray-800">Departments</h1>
        {isAdmin && (
          <button
            onClick={handleAddDepartment}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Add Department
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {departments.map((department) => {
          const employeeCount = employees.filter(emp => emp.department_id === department.id).length;
          
          return (
            <div 
              key={department.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">{department.name}</h2>
                  {isAdmin && (
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{department.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span className="text-sm text-gray-600">{employeeCount} Employees</span>
                  </div>
                  <button
                    onClick={() => navigateToDepartmentEmployees(department.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                  >
                    View Team
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {departments.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500">No departments found</p>
            {isAdmin && (
              <button
                onClick={handleAddDepartment}
                className="mt-4 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Add your first department
              </button>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <DepartmentForm
          department={editDepartment}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default DepartmentList;