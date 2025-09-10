import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasksAPI, departmentsAPI, employeesAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const AppContext = createContext({});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { subscribeToTaskUpdates, connected, emitTaskUpdate, subscribeToNotifications } = useWebSocket();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState('calendar');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch all data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAllData();
    } else {
      // Clear data when not authenticated
      setTasks([]);
      setDepartments([]);
      setEmployees([]);
    }
  }, [isAuthenticated, user]);

  // Subscribe to WebSocket task updates
  useEffect(() => {
    if (connected && subscribeToTaskUpdates) {
      const unsubscribe = subscribeToTaskUpdates((eventData) => {
        if (eventData.type === 'deleted') {
          // Handle task deletion
          setTasks(prev => prev.filter(task => task.id !== eventData.taskId));
        } else {
          // Handle task creation/update
          const updatedTask = eventData.task;
          const updatedBy = eventData.updatedBy;
          
          // Skip if this update was made by the current user to prevent duplicates
          if (updatedBy && user && updatedBy.id === user.id) {
            // Still update the state to ensure consistency
            setTasks(prev => {
              const existingIndex = prev.findIndex(task => task.id === updatedTask.id);
              if (existingIndex >= 0) {
                // Update existing task
                const newTasks = [...prev];
                newTasks[existingIndex] = updatedTask;
                return newTasks;
              } else {
                // Add new task
                return [updatedTask, ...prev];
              }
            });
            return;
          }
          
          setTasks(prev => {
            const existingIndex = prev.findIndex(task => task.id === updatedTask.id);
            if (existingIndex >= 0) {
              // Update existing task
              const newTasks = [...prev];
              newTasks[existingIndex] = updatedTask;
              return newTasks;
            } else {
              // Add new task
              return [updatedTask, ...prev];
            }
          });
        }
      });

      return unsubscribe;
    }
  }, [connected, subscribeToTaskUpdates, user]);

  // Subscribe to WebSocket notifications for employee updates
  useEffect(() => {
    if (connected && subscribeToNotifications) {
      const unsubscribe = subscribeToNotifications((notification) => {
        // Handle employee update notifications
        if (notification.type === 'employee_updated') {
          // Update the specific employee in the employees array
          setEmployees(prev => {
            return prev.map(emp => {
              if (emp.id === notification.data.id) {
                return notification.data;
              }
              return emp;
            });
          });
          
          // Also update selectedEmployee if it matches
          if (selectedEmployee && selectedEmployee.id === notification.data.id) {
            setSelectedEmployee(notification.data);
          }
        }
      });

      return unsubscribe;
    }
  }, [connected, subscribeToNotifications, selectedEmployee]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksResponse, departmentsResponse, employeesResponse] = await Promise.all([
        tasksAPI.getTasks(),
        departmentsAPI.getDepartments(),
        employeesAPI.getEmployees(),
      ]);

      setTasks(tasksResponse.tasks || []);
      setDepartments(departmentsResponse.departments || []);
      setEmployees(employeesResponse.employees || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Task operations
  const createTask = async (taskData) => {
    try {
      setError(null);
      const response = await tasksAPI.createTask(taskData);
      setTasks(prev => [response.task, ...prev]);
      
      // Don't emit WebSocket event here as the backend already handles it
      // The WebSocket subscription will handle real-time updates for other users
      
      return { task: response.task, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message);
      return { task: null, error: error.message };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setError(null);
      const response = await tasksAPI.updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.task : task
      ));
      
      // Don't emit WebSocket event here as the backend already handles it
      // The WebSocket subscription will handle real-time updates for other users
      
      return { task: response.task, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      return { task: null, error: error.message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError(null);
      await tasksAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
      return { error: error.message };
    }
  };

  // Update task state without making an API call
  const updateTaskState = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Add task to state without making an API call
  const addTaskState = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  // Department operations
  const addDepartment = async (departmentData) => {
    try {
      setError(null);
      const response = await departmentsAPI.createDepartment(departmentData);
      setDepartments(prev => [...prev, response.department]);
      return { department: response.department, error: null };
    } catch (error) {
      console.error('Error creating department:', error);
      setError(error.message);
      return { department: null, error: error.message };
    }
  };

  const createDepartment = async (departmentData) => {
    try {
      setError(null);
      const response = await departmentsAPI.createDepartment(departmentData);
      setDepartments(prev => [...prev, response.department]);
      return { department: response.department, error: null };
    } catch (error) {
      console.error('Error creating department:', error);
      setError(error.message);
      return { department: null, error: error.message };
    }
  };

  const updateDepartment = async (departmentData) => {
    try {
      setError(null);
      const departmentId = departmentData.id;
      const response = await departmentsAPI.updateDepartment(departmentId, departmentData);
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId ? response.department : dept
      ));
      return { department: response.department, error: null };
    } catch (error) {
      console.error('Error updating department:', error);
      setError(error.message);
      return { department: null, error: error.message };
    }
  };

  const deleteDepartment = async (departmentId) => {
    try {
      setError(null);
      const response = await departmentsAPI.deleteDepartment(departmentId);
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
      return { error: null, message: response.message || 'Department deleted successfully' };
    } catch (error) {
      console.error('Error deleting department:', error);
      const errorMessage = error.message || 'Failed to delete department';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Employee operations
  const addEmployee = async (employeeData) => {
    try {
      setError(null);
      const response = await employeesAPI.createEmployee(employeeData);
      setEmployees(prev => [...prev, response.employee]);
      return { employee: response.employee, error: null };
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.message);
      return { employee: null, error: error.message };
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      setError(null);
      const response = await employeesAPI.createEmployee(employeeData);
      setEmployees(prev => [...prev, response.employee]);
      return { employee: response.employee, error: null };
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.message);
      return { employee: null, error: error.message };
    }
  };

  const updateEmployee = async (employeeData) => {
    try {
      setError(null);
      const employeeId = employeeData.id;
      const response = await employeesAPI.updateEmployee(employeeId, employeeData);
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? response.employee : emp
      ));
      
      // Also update the selectedEmployee if it matches
      if (selectedEmployee && selectedEmployee.id === employeeId) {
        setSelectedEmployee(response.employee);
      }
      
      return { employee: response.employee, error: null };
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error.message);
      return { employee: null, error: error.message };
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      setError(null);
      const response = await employeesAPI.deleteEmployee(employeeId);
      // Only remove from state if actually deleted (not just deactivated)
      if (response.message.includes('deleted')) {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      } else {
        // If deactivated, refresh the employee data to show updated status
        const employeesResponse = await employeesAPI.getEmployees();
        setEmployees(employeesResponse.employees || []);
      }
      return { error: null, message: response.message || 'Employee processed successfully' };
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMessage = error.message || 'Failed to delete employee';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Utility functions
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByEmployee = (employeeId) => {
    return tasks.filter(task => task.assigned_to === employeeId);
  };

  const getTasksByDepartment = (departmentId) => {
    return tasks.filter(task => task.department_id === departmentId);
  };

  const getTasksByDateRange = (startDate, endDate) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= startDate && dueDate <= endDate;
    });
  };

  // Navigation functions
  const navigateTo = (view) => {
    setCurrentView(view);
  };

  const navigateToDepartments = () => {
    setCurrentView('departments');
    setSelectedDepartment(null);
    setSelectedEmployee(null);
  };

  const navigateToDepartmentEmployees = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    setSelectedDepartment(department);
    setCurrentView('employees');
    setSelectedEmployee(null);
  };

  const navigateToEmployee = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    setCurrentView('employee-detail');
  };

  const navigateToTasks = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    setCurrentView('calendar'); // Use the enhanced calendar with 3-step navigation
  };

  // Utility functions
  const getDepartmentById = (id) => {
    return departments.find(dept => dept.id === id);
  };

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id);
  };

  const getEmployeesByDepartment = (departmentId) => {
    return employees.filter(emp => emp.department_id === departmentId);
  };

  const getMyTasks = () => {
    if (!user) return [];
    return tasks.filter(task => task.assigned_to === user.id || task.created_by === user.id);
  };

  const navigateToDayView = (date) => {
    setSelectedDate(date);
    setCurrentView('day-view');
  };

  const navigateToCalendar = () => {
    setSelectedDate(null);
    setCurrentView('calendar');
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    
    // Convert the selected date to local date string (YYYY-MM-DD format)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`;
    
    let filteredTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      
      // Handle different date formats and ensure proper comparison
      let taskDateStr;
      try {
        // If due_date is already a date string in YYYY-MM-DD format
        if (typeof task.due_date === 'string' && task.due_date.includes('-') && !task.due_date.includes('T')) {
          taskDateStr = task.due_date;
        } else {
          // Parse as full datetime and extract date part using local time
          const taskDueDate = new Date(task.due_date);
          const taskYear = taskDueDate.getFullYear();
          const taskMonth = String(taskDueDate.getMonth() + 1).padStart(2, '0');
          const taskDay = String(taskDueDate.getDate()).padStart(2, '0');
          taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`;
        }
        
        return taskDateStr === targetDateStr;
      } catch (error) {
        console.warn('Date parsing error for task:', task.id, task.due_date);
        return false;
      }
    });
    
    // If there's a selected employee and the current user is an admin,
    // filter tasks to show only those assigned to the selected employee
    if (selectedEmployee && user?.role === 'admin') {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === selectedEmployee.id);
    }
    
    return filteredTasks;
  };

  const value = {
    // Data
    tasks,
    departments,
    employees,
    loading,
    error,
    
    // Navigation state
    currentView,
    selectedDepartment,
    selectedEmployee,
    selectedDate,
    
    // User/Auth info (derived from AuthContext but provided here for convenience)
    currentUser: user,
    userRole: user?.role || 'employee',
    isAdmin: user?.role === 'admin',
    
    // Operations
    fetchAllData,
    createTask,
    updateTask,
    deleteTask,
    addDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    addEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateTaskState,
    addTaskState,
    
    // Function aliases for compatibility
    addTask: createTask,
    
    // Navigation functions
    navigateTo,
    navigateToDepartments,
    navigateToDepartmentEmployees,
    navigateToEmployee,
    navigateToTasks,
    
    // Utility functions
    getTasksByStatus,
    getTasksByEmployee,
    getTasksByDepartment,
    getTasksByDateRange,
    getDepartmentById,
    getEmployeeById,
    getEmployeesByDepartment,
    getMyTasks,
    getTasksForDate,
    navigateToDayView,
    navigateToCalendar,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};