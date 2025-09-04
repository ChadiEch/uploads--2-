// API configuration for Node.js backend
// Use relative URLs in production when served from same domain, absolute URLs in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// API request helper with authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  register: async (email, password, name, position, department_id, phone) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, name, position, department_id, phone },
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/tasks?${params}`);
  },

  getTask: async (id) => {
    return apiRequest(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  updateTask: async (id, taskData) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  },

  deleteTask: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Departments API
export const departmentsAPI = {
  getDepartments: async () => {
    return apiRequest('/departments');
  },

  getDepartment: async (id) => {
    return apiRequest(`/departments/${id}`);
  },

  createDepartment: async (departmentData) => {
    return apiRequest('/departments', {
      method: 'POST',
      body: departmentData,
    });
  },

  updateDepartment: async (id, departmentData) => {
    return apiRequest(`/departments/${id}`, {
      method: 'PUT',
      body: departmentData,
    });
  },

  deleteDepartment: async (id) => {
    return apiRequest(`/departments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Employees API
export const employeesAPI = {
  getEmployees: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/employees?${params}`);
  },

  getEmployee: async (id) => {
    return apiRequest(`/employees/${id}`);
  },

  createEmployee: async (employeeData) => {
    return apiRequest('/employees', {
      method: 'POST',
      body: employeeData,
    });
  },

  updateEmployee: async (id, employeeData) => {
    return apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: employeeData,
    });
  },

  deleteEmployee: async (id) => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Helper functions
export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const getCurrentUser = async () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await authAPI.getProfile();
    return response.employee;
  } catch (error) {
    console.error('Error getting current user:', error);
    removeAuthToken();
    return null;
  }
};