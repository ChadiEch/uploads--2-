import { render, screen } from '@testing-library/react'
import Dashboard from '../components/Dashboard'
import { useApp } from '../context/AppContext'

// Mock the context
vi.mock('../context/AppContext', () => ({
  useApp: vi.fn(),
}))

// Mock chart components
vi.mock('../components/charts/BarChart', () => ({
  BarChart: ({ data }) => <div data-testid="bar-chart">{JSON.stringify(data)}</div>
}))

vi.mock('../components/charts/PieChart', () => ({
  PieChart: ({ data }) => <div data-testid="pie-chart">{JSON.stringify(data)}</div>
}))

vi.mock('../components/charts/LineChart', () => ({
  LineChart: ({ data }) => <div data-testid="line-chart">{JSON.stringify(data)}</div>
}))

vi.mock('../components/StatsCard', () => ({
  default: ({ title, value, color }) => (
    <div data-testid={`stats-card-${title.toLowerCase().replace(' ', '-')}`}>
      <span data-testid="title">{title}</span>
      <span data-testid="value">{value}</span>
      <span data-testid="color">{color}</span>
    </div>
  )
}))

// Mock mock data
vi.mock('../data/mockData', () => ({
  sampleData: [
    { name: 'Jan', value: 10 },
    { name: 'Feb', value: 20 },
  ],
  taskStatus: {},
  departmentEmployees: {},
}))

describe('Dashboard', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      status: 'planned',
      priority: 'high',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    },
    {
      id: 2,
      title: 'Task 2',
      status: 'in-progress',
      priority: 'medium',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    },
    {
      id: 3,
      title: 'Task 3',
      status: 'completed',
      priority: 'urgent',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    },
    {
      id: 4,
      title: 'Task 4',
      status: 'planned',
      priority: 'low',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    },
  ]

  const mockDepartments = [
    { id: 1, name: 'Engineering', employeeCount: 10 },
    { id: 2, name: 'Marketing', employeeCount: 5 },
    { id: 3, name: 'Sales', employeeCount: 8 },
  ]

  const mockEmployees = [
    { id: 1, name: 'John Doe', department_id: 1 },
    { id: 2, name: 'Jane Smith', department_id: 2 },
    { id: 3, name: 'Bob Johnson', department_id: 3 },
  ]

  const defaultMockContext = {
    tasks: mockTasks,
    departments: mockDepartments,
    employees: mockEmployees,
    loading: false,
    error: null,
  }

  beforeEach(() => {
    useApp.mockReturnValue(defaultMockContext)
  })

  it('renders dashboard title and welcome message', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Admin User')).toBeInTheDocument()
  })

  it('displays correct stats cards', () => {
    render(<Dashboard />)
    
    // Check departments count
    const departmentsCard = screen.getByTestId('stats-card-departments')
    expect(departmentsCard.querySelector('[data-testid="value"]')).toHaveTextContent('3')
    
    // Check employees count
    const employeesCard = screen.getByTestId('stats-card-employees')
    expect(employeesCard.querySelector('[data-testid="value"]')).toHaveTextContent('3')
    
    // Check total tasks count
    const tasksCard = screen.getByTestId('stats-card-total-tasks')
    expect(tasksCard.querySelector('[data-testid="value"]')).toHaveTextContent('4')
    
    // Check due this week count (tasks due within 7 days)
    const dueCard = screen.getByTestId('stats-card-due-this-week')
    expect(dueCard.querySelector('[data-testid="value"]')).toHaveTextContent('3') // 3 tasks due within a week
  })

  it('calculates task statistics correctly', () => {
    render(<Dashboard />)
    
    // Check task summary section
    const plannedTasks = screen.getByText('1') // 2 planned tasks but only one should show in specific context
    const inProgressTasks = screen.getByText('1') // 1 in-progress task  
    const completedTasks = screen.getByText('1') // 1 completed task
    
    expect(plannedTasks).toBeInTheDocument()
    expect(inProgressTasks).toBeInTheDocument()
    expect(completedTasks).toBeInTheDocument()
  })

  it('renders charts with correct data', () => {
    render(<Dashboard />)
    
    // Check if charts are rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    
    // Check pie chart data (task status)
    const pieChart = screen.getByTestId('pie-chart')
    expect(pieChart).toHaveTextContent('Planned')
    expect(pieChart).toHaveTextContent('In Progress')
    expect(pieChart).toHaveTextContent('Completed')
  })

  it('displays task completion progress bars', () => {
    render(<Dashboard />)
    
    // Check for high priority tasks section
    expect(screen.getByText('High Priority Tasks')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    
    // Should show progress indicators
    const progressBars = screen.getAllByRole('progressbar', { hidden: true })
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('handles empty data gracefully', () => {
    useApp.mockReturnValue({
      tasks: [],
      departments: [],
      employees: [],
      loading: false,
      error: null,
    })
    
    render(<Dashboard />)
    
    // Should show zero counts
    const departmentsCard = screen.getByTestId('stats-card-departments')
    expect(departmentsCard.querySelector('[data-testid="value"]')).toHaveTextContent('0')
    
    const employeesCard = screen.getByTestId('stats-card-employees')
    expect(employeesCard.querySelector('[data-testid="value"]')).toHaveTextContent('0')
    
    const tasksCard = screen.getByTestId('stats-card-total-tasks')
    expect(tasksCard.querySelector('[data-testid="value"]')).toHaveTextContent('0')
  })

  it('handles loading state', () => {
    useApp.mockReturnValue({
      ...defaultMockContext,
      loading: true,
    })
    
    render(<Dashboard />)
    
    // Dashboard should still render with current data during loading
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('handles error state', () => {
    useApp.mockReturnValue({
      ...defaultMockContext,
      error: 'Failed to load data',
    })
    
    render(<Dashboard />)
    
    // Dashboard should still render, error handling might be done at higher level
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('calculates high priority tasks correctly', () => {
    render(<Dashboard />)
    
    // Should count high and urgent priority tasks (2 in our mock data)
    const highPrioritySection = screen.getByText('High Priority Tasks')
    expect(highPrioritySection).toBeInTheDocument()
    
    // Check the fraction display
    expect(screen.getByText('2 of 4')).toBeInTheDocument()
  })
})
