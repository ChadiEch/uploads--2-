import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { authAPI } from '../lib/api'

// Mock the API
vi.mock('../lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
}))

// Test component to use the AuthContext
const TestComponent = () => {
  const { user, loading, error, signIn, signOut, signUp, updateProfile, isAuthenticated } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Login</button>
      <button onClick={() => signOut()}>Logout</button>
      <button onClick={() => signUp('new@example.com', 'password', { name: 'New User' })}>Register</button>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>Update Profile</button>
    </div>
  )
}

const renderWithAuthProvider = (component = <TestComponent />) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should provide initial state', () => {
    renderWithAuthProvider()
    
    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(screen.getByTestId('error')).toHaveTextContent('no-error')
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    const mockEmployee = { id: 1, name: 'Test User', email: 'test@example.com' }
    
    authAPI.login.mockResolvedValueOnce({
      employee: mockEmployee,
      token: 'test-token'
    })

    renderWithAuthProvider()
    
    await user.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })

    expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    
    authAPI.login.mockRejectedValueOnce(new Error(errorMessage))

    renderWithAuthProvider()
    
    await user.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
  })

  it('should handle successful registration', async () => {
    const user = userEvent.setup()
    const mockEmployee = { id: 2, name: 'New User', email: 'new@example.com' }
    
    authAPI.register.mockResolvedValueOnce({
      employee: mockEmployee,
      token: 'test-token'
    })

    renderWithAuthProvider()
    
    await user.click(screen.getByText('Register'))
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('New User')
    })

    expect(authAPI.register).toHaveBeenCalledWith(
      'new@example.com',
      'password',
      'New User',
      '',
      null,
      ''
    )
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()
    const mockEmployee = { id: 1, name: 'Test User', email: 'test@example.com' }
    
    // First login
    authAPI.login.mockResolvedValueOnce({
      employee: mockEmployee,
      token: 'test-token'
    })

    renderWithAuthProvider()
    
    await user.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })

    // Then logout
    await user.click(screen.getByText('Logout'))
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })

    expect(authAPI.logout).toHaveBeenCalled()
  })

  it('should handle profile update', async () => {
    const user = userEvent.setup()
    const initialUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    const updatedUser = { id: 1, name: 'Updated Name', email: 'test@example.com' }
    
    // Setup initial authenticated state
    authAPI.login.mockResolvedValueOnce({
      employee: initialUser,
      token: 'test-token'
    })

    authAPI.updateProfile.mockResolvedValueOnce({
      employee: updatedUser
    })

    renderWithAuthProvider()
    
    // Login first
    await user.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })

    // Update profile
    await user.click(screen.getByText('Update Profile'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Updated Name')
    })

    expect(authAPI.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' })
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})
