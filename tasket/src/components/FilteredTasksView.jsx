import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const FilteredTasksView = () => {
  const { 
    tasks, 
    selectedDepartment, 
    selectedEmployee, 
    getFilteredOverdueTasks, 
    getFilteredHighPriorityTasks,
    getFilteredInProgressTasks,
    navigateToCalendar,
    navigateToDayView,
    filteredTasksFilterType
  } = useApp();
  
  const { isAdmin } = useAuth();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterType, setFilterType] = useState(filteredTasksFilterType || 'overdue'); // 'overdue' or 'highPriority'
  const [dateRange, setDateRange] = useState('30'); // days

  // Update filter type when it changes in context
  useEffect(() => {
    if (filteredTasksFilterType) {
      setFilterType(filteredTasksFilterType);
    }
  }, [filteredTasksFilterType]);

  // Get filtered tasks based on current filters
  useEffect(() => {
    const departmentId = selectedDepartment?.id || '';
    const employeeId = selectedEmployee?.id || '';
    
    let result = [];
    if (filterType === 'overdue') {
      result = getFilteredOverdueTasks(departmentId, employeeId, dateRange);
    } else if (filterType === 'highPriority') {
      result = getFilteredHighPriorityTasks(departmentId, employeeId, dateRange);
    } else if (filterType === 'inProgress') {
      result = getFilteredInProgressTasks(departmentId, employeeId, dateRange);
    }
    
    setFilteredTasks(result);
  }, [selectedDepartment, selectedEmployee, dateRange, filterType, getFilteredOverdueTasks, getFilteredHighPriorityTasks, getFilteredInProgressTasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleTaskClick = (task) => {
    // Parse the created_at date and navigate to day view
    if (task.created_at) {
      const createdDate = new Date(task.created_at);
      navigateToDayView(createdDate);
    } else if (task.due_date) {
      // Fallback to due_date if created_at is not available
      const dueDate = new Date(task.due_date);
      navigateToDayView(dueDate);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={navigateToCalendar}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Calendar
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {filterType === 'overdue' ? 'Overdue Tasks' : 
             filterType === 'highPriority' ? 'High Priority Tasks' : 
             'In Progress Tasks'}
          </h1>
          <p className="text-gray-600">
            {selectedDepartment ? `Department: ${selectedDepartment.name}` : 'All Departments'} • 
            {selectedEmployee ? ` Employee: ${selectedEmployee.name}` : ' All Employees'} • 
            Last {dateRange} days
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="overdue">Overdue Tasks</option>
              <option value="highPriority">High Priority Tasks</option>
              <option value="inProgress">In Progress Tasks</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No {filterType === 'overdue' ? 'overdue' : 
                 filterType === 'highPriority' ? 'high priority' : 
                 'in progress'} tasks match your current filters.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTaskClick(task)}
            >
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
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs md:text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                    
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
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilteredTasksView;