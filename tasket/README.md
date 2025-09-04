# TaskFlow Frontend - Real-time Task Management System

A modern, real-time task management system built with React, Vite, and WebSocket integration. Features comprehensive testing, live updates, and collaborative task management.

## 🚀 Features

### Core Features
- **Real-time Collaboration**: Live task updates, notifications, and user presence
- **Task Management**: Complete CRUD operations with status tracking and priorities
- **Department Management**: Organize teams and track department performance
- **Employee Management**: User profiles with role-based permissions
- **Interactive Dashboard**: Real-time charts and statistics with live data updates
- **Calendar Integration**: Task scheduling and daily views
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Real-time Features
- **Live Task Updates**: See changes instantly across all connected clients
- **Real-time Notifications**: Toast notifications for task assignments and updates
- **User Presence**: See who's online in your department
- **Live Dashboard**: Statistics update automatically as data changes
- **Collaborative Editing**: Real-time indicators for active users

### Testing & Quality
- **Comprehensive Test Suite**: Unit and integration tests with Vitest
- **Component Testing**: React Testing Library for UI components
- **Mocking Support**: Complete mocking setup for external dependencies
- **Coverage Reports**: Detailed test coverage analysis

## 🛠️ Technology Stack

### Frontend Core
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **TypeScript Support**: Type-safe development environment

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Material-UI**: Pre-built React components
- **Recharts**: Beautiful, responsive charts for data visualization

### Real-time Communication
- **Socket.IO Client**: WebSocket client for real-time features
- **Event-driven Architecture**: Reactive state management

### Testing Framework
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **Jest DOM**: Custom DOM matchers
- **MSW (Mock Service Worker)**: API mocking for tests

### State Management
- **React Context API**: Global state management
- **Custom Hooks**: Reusable state logic
- **WebSocket Context**: Real-time event management

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- TaskFlow Backend running on port 5000

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd tasket
   npm install
   # or
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   # Create environment file if needed
   cp .env.example .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Ensure backend is running on http://localhost:5000

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure
```
src/test/
├── setup.js                 # Test environment setup
├── AuthContext.test.jsx     # Authentication tests
├── AppContext.test.jsx      # Application state tests
├── Dashboard.test.jsx       # Dashboard component tests
└── Login.test.jsx          # Login component tests
```

### Testing Features
- **Component Testing**: All major components have comprehensive tests
- **Context Testing**: State management and WebSocket integration tests
- **User Interaction Testing**: Form submissions, button clicks, navigation
- **Mocking**: External APIs, WebSocket connections, and localStorage
- **Coverage Reports**: Detailed coverage analysis with multiple output formats

## 🔧 Build & Deployment

### Development Build
```bash
npm run build
```

### Production Deployment
1. Build the application
2. Deploy dist/ folder to your static hosting service
3. Configure environment variables for production API endpoints

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_BASE_URL=http://localhost:5000

# Feature Flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_NOTIFICATIONS=true
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/                # Authentication components
│   ├── charts/             # Chart components (8 types)
│   ├── departments/        # Department management
│   ├── employees/          # Employee management
│   ├── tasks/              # Task management
│   ├── Dashboard.jsx       # Real-time dashboard
│   ├── RealTimeTaskList.jsx # Live task list
│   ├── NotificationContainer.jsx # Toast notifications
│   └── ConnectionStatus.jsx # WebSocket status
├── context/
│   ├── AuthContext.jsx     # Authentication state
│   ├── AppContext.jsx      # Application state
│   └── WebSocketContext.jsx # Real-time communication
├── lib/
│   └── api.js              # API client configuration
├── test/                   # Test files
└── data/                   # Mock data and constants
```

## 🔄 Real-time Features

### WebSocket Integration
- **Authentication**: JWT-based WebSocket authentication
- **Room Management**: Department and task-specific rooms
- **Event Handling**: Task updates, user presence, typing indicators
- **Reconnection**: Automatic reconnection with exponential backoff

### Real-time Events
- `task_updated`: Live task modifications
- `task_deleted`: Task removal notifications
- `task_assigned`: New task assignments
- `user_presence`: Online/offline status
- `notification`: System notifications

## 🎯 Key Components

### Dashboard
- **Real-time Statistics**: Live task counts and completion rates
- **Interactive Charts**: Dynamic data visualization
- **Live Activity Feed**: Recent task updates and user activity
- **Performance Metrics**: Department and employee analytics

### Task Management
- **Live Updates**: See changes as they happen
- **Collaborative Editing**: Multiple users can work simultaneously
- **Smart Notifications**: Context-aware task alerts
- **Status Tracking**: Visual indicators for task progress

### User Experience
- **Responsive Design**: Works on all device sizes
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful error recovery and user feedback
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Performance

### Optimization Features
- **Code Splitting**: Lazy loading for optimal bundle size
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: Efficient large list rendering
- **Image Optimization**: Responsive images with proper sizing
- **WebSocket Pooling**: Efficient connection management

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure authentication with automatic refresh
- **Protected Routes**: Role-based access control
- **WebSocket Security**: Authenticated real-time connections

### Data Protection
- **Input Validation**: Client-side validation with server verification
- **XSS Prevention**: Sanitized user inputs and outputs
- **CSRF Protection**: Token-based request validation

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Run tests**: `npm test`
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Development Guidelines
- Write tests for all new features
- Follow existing code style and conventions
- Update documentation for significant changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License.
