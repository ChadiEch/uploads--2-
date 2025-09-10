import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import TaskDetail from './TaskDetail';
import { useWebSocket } from '../../context/WebSocketContext';

const TaskCalendar = () => {
  const { 
    selectedEmployee, 
    getEmployeeById,
    getTasksByEmployee, 
    navigateToDepartmentEmployees,
    navigateToDayView,
    isAdmin,
    tasks,
    navigateToCalendar
  } = useApp();
  
  const { subscribeToTaskUpdates, connected } = useWebSocket();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [visibleDates, setVisibleDates] = useState([]);
  const [tasksByDate, setTasksByDate] = useState({});
  
  const employee = selectedEmployee ? getEmployeeById(selectedEmployee.id) : null;
  const employeeTasks = selectedEmployee ? getTasksByEmployee(selectedEmployee.id) : [];
  
  useEffect(() => {
    // Generate dates for current month view
    generateDatesForMonth(currentDate);
  }, [currentDate]);
  
  // Update tasks when tasks or employee change
  useEffect(() => {
    organizeTasksByDate(employeeTasks);
  }, [employeeTasks, tasks]);
  
  // Subscribe to WebSocket task updates
  useEffect(() => {
    if (connected && subscribeToTaskUpdates) {
      const unsubscribe = subscribeToTaskUpdates((eventData) => {
        // Refresh tasks when there's an update
        const updatedTasks = selectedEmployee ? getTasksByEmployee(selectedEmployee.id) : [];
        organizeTasksByDate(updatedTasks);
      });

      return unsubscribe;
    }
  }, [connected, subscribeToTaskUpdates, selectedEmployee, getTasksByEmployee, tasks]);
  
  const generateDatesForMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Adjust the start date to include the last days of previous month if needed
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from previous Sunday
    
    const dates = [];
    const currentDay = new Date(startDate);
    
    // Generate 42 days (6 weeks) to make sure we include all days of the month
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setVisibleDates(dates);
  };
  
  const organizeTasksByDate = (taskList) => {
    const taskMap = {};
    
    taskList.forEach(task => {
      // Use due_date instead of date
      const dateStr = task.due_date?.split('T')[0];
      if (dateStr) {
        if (!taskMap[dateStr]) {
          taskMap[dateStr] = [];
        }
        taskMap[dateStr].push(task);
      }
    });
    
    setTasksByDate(taskMap);
  };
  
  const navigateToPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };
  
  const navigateToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };
  
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleDateClick = (date) => {
    // Navigate to day view to show tasks for the selected date
    navigateToDayView(date);
  };
  
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };
  
  const closeTaskDetail = () => {
    setSelectedTask(null);
  };
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasksByDate[dateStr] || [];
  };
  
  if (!employee) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigateToDepartmentEmployees(employee.department_id)}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Tasks for {employee.name}</h1>
        
        <button
          onClick={navigateToCalendar}
          className="ml-auto text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View All Employees
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-medium text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={navigateToToday}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Today
            </button>
            <button
              onClick={navigateToPreviousMonth}
              className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={navigateToNextMonth}
              className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {visibleDates.slice(0, 35).map((date, index) => {
            const dateStr = formatDate(date);
            const dayTasks = getTasksForDate(date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[100px] p-2 border-b border-r relative hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                  isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50'
                } ${isToday(date) ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm mb-1 font-medium ${
                  isCurrentMonth(date) ? 'text-gray-700' : 'text-gray-400'
                } ${isToday(date) ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                </div>
                
                <div className="overflow-y-auto max-h-20">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                      className={`mb-1 px-2 py-1 rounded-md text-xs truncate cursor-pointer ${
                        task.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={closeTaskDetail}
        />
      )}
    </div>
  );
};

export default TaskCalendar;