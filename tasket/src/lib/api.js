// API configuration for Node.js backend
// Use relative URLs when using proxy, absolute URLs in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  // Add some debugging to see if token is being retrieved properly
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return token;
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
    ...options,
  };

  // Set Authorization header if token exists
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }

  // Don't stringify body if it's FormData
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Log the request for debugging
  console.log('API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    hasToken: !!token,
    headers: config.headers,
    body: config.body instanceof FormData ? 'FormData' : config.body
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Log the response for debugging
  console.log('API Response:', {
    url: `${API_BASE_URL}${endpoint}`,
    status: response.status,
    ok: response.ok
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    
    // Log the error for debugging
    console.error('API Error:', {
      url: `${API_BASE_URL}${endpoint}`,
      status: response.status,
      error: error
    });
    
    // Handle validation errors from express-validator
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map(e => e.msg || e.message).join(', ');
      throw new Error(errorMessages);
    }
    
    // Handle single error message
    if (error.message) {
      throw new Error(error.message);
    }
    
    // Handle generic "invalid value" errors
    if (response.status === 400) {
      throw new Error('Invalid value provided for one or more fields. Please check your input and try again.');
    }
    
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Check if we have a file to upload
    if (profileData.photo && profileData.photo instanceof File) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Append all profile data as JSON string
      const { photo, ...otherData } = profileData;
      formData.append('data', JSON.stringify(otherData));
      formData.append('photo', photo);
      
      // For FormData requests, we don't set Content-Type header
      // Browser will set it with boundary automatically
      return apiRequest('/auth/profile', {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Regular JSON update
      // Remove photo field if it's not a File object
      const { photo, ...otherData } = profileData;
      
      return apiRequest('/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: otherData,
      });
    }
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

  createTask: async (taskData, files = []) => {
    // Check if we have files to upload
    if (files && files.length > 0) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Prepare task data with proper formatting
      const { attachments, estimated_hours, ...otherData } = taskData;
      
      // Ensure estimated_hours is properly formatted and always provided
      const formattedTaskData = {
        ...otherData,
        estimated_hours: estimated_hours !== undefined && estimated_hours !== null && estimated_hours !== '' ? parseFloat(estimated_hours) : 1.00,
        // Filter out placeholder attachments (those with empty URLs) when sending to backend
        attachments: Array.isArray(attachments) ? attachments.filter(att => att && att.url) : []
      };
      
      // Log for debugging
      console.log('Sending FormData with task data:', formattedTaskData);
      
      // Append task data as JSON string
      formData.append('data', JSON.stringify(formattedTaskData));
      
      // Append files
      files.forEach((file, index) => {
        formData.append('attachments', file);
      });
      
      // For FormData requests, we don't set Content-Type header
      // Browser will set it with boundary automatically
      return apiRequest('/tasks', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Ensure required fields are properly formatted
      const formattedData = {
        ...taskData,
        // Ensure estimated_hours is always provided and is at least 1
        estimated_hours: taskData.estimated_hours !== undefined && taskData.estimated_hours !== null && taskData.estimated_hours !== '' ? parseFloat(taskData.estimated_hours) : 1.00,
        // Ensure attachments is an array and filter out invalid attachments
        attachments: Array.isArray(taskData.attachments) ? taskData.attachments.filter(att => att && att.url) : []
      };
      
      // Remove any undefined or null values that might cause issues
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });
      
      return apiRequest('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formattedData,
      });
    }
  },

  updateTask: async (id, taskData, files = []) => {
    // Check if we have files to upload
    if (files && files.length > 0) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Prepare task data with proper formatting
      const { attachments, estimated_hours, ...otherData } = taskData;
      
      // Ensure estimated_hours is properly formatted
      const formattedTaskData = {
        ...otherData,
        estimated_hours: estimated_hours !== undefined && estimated_hours !== null && estimated_hours !== '' ? parseFloat(estimated_hours) : 1.00,
        // Filter out placeholder attachments (those with empty URLs) when sending to backend
        attachments: Array.isArray(attachments) ? attachments.filter(att => att && att.url) : []
      };
      
      // Log for debugging
      console.log('Sending FormData update with task data:', formattedTaskData);
      
      // Append task data as JSON string
      formData.append('data', JSON.stringify(formattedTaskData));
      
      // Append files
      files.forEach((file, index) => {
        formData.append('attachments', file);
      });
      
      // For FormData requests, we don't set Content-Type header
      // Browser will set it with boundary automatically
      return apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Ensure estimated_hours is properly formatted
      const formattedData = {
        ...taskData,
        estimated_hours: taskData.estimated_hours !== undefined && taskData.estimated_hours !== null && taskData.estimated_hours !== '' ? parseFloat(taskData.estimated_hours) : 1.00,
        // Ensure attachments is an array and filter out invalid attachments
        attachments: Array.isArray(taskData.attachments) ? taskData.attachments.filter(att => att && att.url) : []
      };
      
      // Remove any undefined or null values that might cause issues
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });
      
      return apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formattedData,
      });
    }
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: departmentData,
    });
  },

  updateDepartment: async (id, departmentData) => {
    return apiRequest(`/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Check if we have a file to upload
    if (employeeData.photo && employeeData.photo instanceof File) {
      // Handle file upload
      const formData = new FormData();
      
      // Append all employee data as JSON string
      const { photo, ...otherData } = employeeData;
      formData.append('data', JSON.stringify(otherData));
      formData.append('photo', photo);
      
      return apiRequest('/employees', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Regular JSON creation
      // Ensure photo field is properly handled and salary is formatted
      const formattedData = {
        ...employeeData,
        salary: employeeData.salary ? parseFloat(employeeData.salary) : null
      };
      
      // Remove any undefined or null values that might cause issues
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });
      
      return apiRequest('/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formattedData,
      });
    }
  },

  updateEmployee: async (id, employeeData) => {
    // Check if we have a file to upload
    if (employeeData.photo && employeeData.photo instanceof File) {
      // Handle file upload
      const formData = new FormData();
      
      // Append all employee data as JSON string
      const { photo, ...otherData } = employeeData;
      formData.append('data', JSON.stringify(otherData));
      formData.append('photo', photo);
      
      return apiRequest(`/employees/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Regular JSON update
      // Ensure salary is properly formatted if provided
      const formattedData = { ...employeeData };
      if (employeeData.salary !== undefined) {
        formattedData.salary = employeeData.salary ? parseFloat(employeeData.salary) : null;
      }
      
      // Remove any undefined or null values that might cause issues
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });
      
      return apiRequest(`/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formattedData,
      });
    }
  },

  deleteEmployee: async (id) => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Projects API
export const projectsAPI = {
  getProjects: async () => {
    return apiRequest('/projects');
  },

  getProject: async (id) => {
    return apiRequest(`/projects/${id}`);
  },

  getProjectTasks: async (id) => {
    return apiRequest(`/projects/${id}/tasks`);
  },

  createProject: async (projectData) => {
    return apiRequest('/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: projectData,
    });
  },

  updateProject: async (id, projectData) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: projectData,
    });
  },

  deleteProject: async (id) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/notifications?${queryParams}`);
  },

  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest(`/notifications/read-all`, {
      method: 'PUT',
    });
  },

  deleteNotification: async (id) => {
    return apiRequest(`/notifications/${id}`, {
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