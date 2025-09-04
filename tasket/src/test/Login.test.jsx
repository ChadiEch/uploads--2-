import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Login from '../components/auth/Login'
import { useAuth } from '../context/AuthContext'

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock window.alert
const mockAlert = vi.fn()
global.alert = mockAlert

describe('Login', () => {
  const mockSignIn = vi.fn()
  const mockSignUp = vi.fn()

  const defaultMockAuth = {
    signIn: mockSignIn,
    signUp: mockSignUp,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue(defaultMockAuth)
    mockAlert.mockClear()
  })

  it('renders login form by default', () => {
    render(<Login />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByText('Task Management System')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    
    // Should not show name and role fields in login mode
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
  })

  it('switches to signup mode when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('switches back to login mode from signup', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    // Switch to signup
    await user.click(screen.getByText("Don't have an account? Sign up"))
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    
    // Switch back to login
    await user.click(screen.getByText('Already have an account? Sign in'))
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('handles form input changes', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ user: { name: 'Test User' }, error: null })
    
    render(<Login />)
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage))
    
    render(<Login />)
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('handles successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce({ user: { name: 'New User' }, error: null })
    
    render(<Login />)
    
    // Switch to signup mode
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    // Fill out signup form
    await user.type(screen.getByLabelText('Full Name'), 'New User')
    await user.type(screen.getByLabelText('Email Address'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.selectOptions(screen.getByLabelText('Role'), 'admin')
    
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123', {
        name: 'New User',
        role: 'admin'
      })
      expect(mockAlert).toHaveBeenCalledWith('Check your email for the confirmation link!')
    })
  })

  it('handles signup error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email already exists'
    mockSignUp.mockRejectedValueOnce(new Error(errorMessage))
    
    render(<Login />)
    
    // Switch to signup mode
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    // Fill out form
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Email Address'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    // Mock a delayed response
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<Login />)
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Button should be disabled and show loading state
    expect(submitButton).toBeDisabled()
    // Check for loading spinner SVG
    expect(screen.getByRole('button', { name: /sign in/i })).toContainHTML('animate-spin')
  })

  it('clears error when switching between login and signup', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValueOnce(new Error('Login error'))
    
    render(<Login />)
    
    // Trigger login error
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Login error')).toBeInTheDocument()
    })
    
    // Switch to signup - error should be cleared
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    expect(screen.queryByText('Login error')).not.toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('shows demo credentials in login mode', () => {
    render(<Login />)
    
    expect(screen.getByText('Demo Credentials')).toBeInTheDocument()
    expect(screen.getByText(/admin@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/employee@example.com/)).toBeInTheDocument()
  })

  it('hides demo credentials in signup mode', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    expect(screen.queryByText('Demo Credentials')).not.toBeInTheDocument()
  })

  it('has proper password requirements', () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('minLength', '6')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('defaults to employee role in signup', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    await user.click(screen.getByText("Don't have an account? Sign up"))
    
    const roleSelect = screen.getByLabelText('Role')
    expect(roleSelect).toHaveValue('employee')
  })
})
