import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AppProvider, useApp } from '../context/AppContext'
import { AuthProvider } from '../context/AuthContext'
import { tasksAPI, departmentsAPI, employeesAPI } from '../lib/api'

// Mock the APIs
vi.mock('../lib/api', () => ({
  tasksAPI: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
  departmentsAPI: {
    getDepartments: vi.fn(),
    createDepartment: vi.fn(),
    updateDepartment: vi.fn(),
  },
  employeesAPI: {
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
  },
  authAPI: {
    login: vi.fn(),
    logout: vi.fn(),
  },
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
}))

// Mock AuthContext
const mockAuthContext = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  isAuthenticated: true,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  updateProfile: vi.fn(),
}

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...actual,
    useAuth: () => mockAuthContext,
  }
})

// Test component
const TestComponent = () => {
  const {
    tasks,
    departments,
    employees,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createDepartment,
    getTasksByStatus,
    getTasksByEmployee,
  } = useApp()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="tasks-count">{tasks.length}</div>
      <div data-testid="departments-count">{departments.length}</div>
      <div data-testid="employees-count">{employees.length}</div>
      
      <button onClick={() => createTask({ title: 'New Task', status: 'planned' })}>
        Create Task
      </button>
      <button onClick={() => updateTask(1, { title: 'Updated Task' })}>
        Update Task
      </button>
      <button onClick={() => deleteTask(1)}>
        Delete Task
      </button>
      <button onClick={() => createDepartment({ name: 'New Department' })}>
        Create Department
      </button>
      <button onClick={() => {
        const completedTasks = getTasksByStatus('completed')
        console.log('Completed tasks:', completedTasks.length)
      }}>
        Get Completed Tasks
      </button>
    </div>
  )
}

const renderWithProviders = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <TestComponent />
      </AppProvider>
    </AuthProvider>
  )
}

describe('AppContext', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', status: 'planned', assigned_to: 1 },
    { id: 2, title: 'Task 2', status: 'completed', assigned_to: 2 },
  ]
  
  const mockDepartments = [
    { id: 1, name: 'Engineering', budget: 100000 },
    { id: 2, name: 'Marketing', budget: 80000 },
  ]
  
  const mockEmployees = [
    { id: 1, name: 'John Doe', department_id: 1 },
    { id: 2, name: 'Jane Smith', department_id: 2 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    tasksAPI.getTasks.mockResolvedValue({ tasks: mockTasks })
    departmentsAPI.getDepartments.mockResolvedValue({ departments: mockDepartments })
    employeesAPI.getEmployees.mockResolvedValue({ employees: mockEmployees })
  })

  it('should fetch and provide initial data', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('2')
      expect(screen.getByTestId('departments-count')).toHaveTextContent('2')
      expect(screen.getByTestId('employees-count')).toHaveTextContent('2')
    })

    expect(tasksAPI.getTasks).toHaveBeenCalled()
    expect(departmentsAPI.getDepartments).toHaveBeenCalled()
    expect(employeesAPI.getEmployees).toHaveBeenCalled()
  })

  it('should handle loading state', () => {
    renderWithProviders()
    
    // Initially should not be loading (due to mocked fast responses)
    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
  })

  it('should handle create task', async () => {
    const user = userEvent.setup()
    const newTask = { id: 3, title: 'New Task', status: 'planned' }
    
    tasksAPI.createTask.mockResolvedValueOnce({ task: newTask })
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('2')
    })
    
    await user.click(screen.getByText('Create Task'))
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('3')
    })

    expect(tasksAPI.createTask).toHaveBeenCalledWith({ title: 'New Task', status: 'planned' })
  })

  it('should handle update task', async () => {
    const user = userEvent.setup()
    const updatedTask = { id: 1, title: 'Updated Task', status: 'planned' }
    
    tasksAPI.updateTask.mockResolvedValueOnce({ task: updatedTask })
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('2')
    })
    
    await user.click(screen.getByText('Update Task'))
    
    await waitFor(() => {
      expect(tasksAPI.updateTask).toHaveBeenCalledWith(1, { title: 'Updated Task' })
    })
  })

  it('should handle delete task', async () => {
    const user = userEvent.setup()
    
    tasksAPI.deleteTask.mockResolvedValueOnce({})
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('2')
    })
    
    await user.click(screen.getByText('Delete Task'))
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1')
    })

    expect(tasksAPI.deleteTask).toHaveBeenCalledWith(1)
  })

  it('should handle create department', async () => {
    const user = userEvent.setup()
    const newDepartment = { id: 3, name: 'New Department', budget: 50000 }
    
    departmentsAPI.createDepartment.mockResolvedValueOnce({ department: newDepartment })
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('departments-count')).toHaveTextContent('2')
    })
    
    await user.click(screen.getByText('Create Department'))
    
    await waitFor(() => {
      expect(screen.getByTestId('departments-count')).toHaveTextContent('3')
    })

    expect(departmentsAPI.createDepartment).toHaveBeenCalledWith({ name: 'New Department' })
  })

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to fetch data'
    
    tasksAPI.getTasks.mockRejectedValueOnce(new Error(errorMessage))
    departmentsAPI.getDepartments.mockResolvedValue({ departments: mockDepartments })
    employeesAPI.getEmployees.mockResolvedValue({ employees: mockEmployees })
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
    })
  })

  it('should provide utility functions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const user = userEvent.setup()
    
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('2')
    })
    
    await user.click(screen.getByText('Get Completed Tasks'))
    
    expect(consoleSpy).toHaveBeenCalledWith('Completed tasks:', 1)
    
    consoleSpy.mockRestore()
  })

  it('should throw error when useApp is used outside AppProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useApp must be used within an AppProvider')
    
    consoleSpy.mockRestore()
  })
})
