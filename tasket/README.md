# Tasket - Employee Task Management System

Tasket is a comprehensive employee task management system built with React, Node.js, and PostgreSQL. It provides features for managing departments, employees, and tasks with real-time updates.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Deployment to Railway](#deployment-to-railway)
  - [Frontend Deployment](#frontend-deployment)
  - [Backend Deployment](#backend-deployment)
  - [Database Setup](#database-setup)
- [Project Details](#project-details)
  - [Authentication](#authentication)
  - [Role-Based Access Control](#role-based-access-control)
  - [Real-Time Features](#real-time-features)
  - [File Uploads](#file-uploads)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (Admin, Manager, Employee roles)
- Department management
- Employee management with photo uploads
- Task management with attachments
- Calendar view for tasks
- Real-time updates using WebSockets
- Role-based access control
- File upload support for task attachments
- Responsive design for mobile and desktop
- Live notifications

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Context API for state management
- Socket.IO Client for real-time communication

### Backend
- Node.js
- Express.js
- PostgreSQL
- Socket.IO for real-time communication
- Multer for file uploads
- JWT for authentication

### Database
- PostgreSQL

### Deployment
- Railway
- Docker

## Project Structure

```
tasket/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn
- Railway account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tasket
```

2. Install frontend dependencies:
```bash
npm install
```

3. Navigate to the backend directory and install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Set up the database:
```sql
CREATE DATABASE tasket;
```

5. Run database migrations (if applicable):
```bash
# Follow your database migration process
```

6. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend (from backend directory):
```bash
cd backend
npm run dev
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5002/api
VITE_WS_BASE_URL=http://localhost:5002
```

### Backend (.env)
```env
PORT=5002
DATABASE_URL=postgresql://username:password@localhost:5432/tasket
JWT_SECRET=your_jwt_secret_here
```

## Docker Setup

This project includes Docker configuration for easy local development and deployment.

### Running with Docker Compose

1. Make sure Docker and Docker Compose are installed
2. Run the following command from the project root:
```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5002
- Frontend on port 3000

### Building Docker Images

Frontend:
```bash
docker build -f Dockerfile.frontend -t tasket-frontend .
```

Backend:
```bash
cd backend
docker build -t tasket-backend .
```

## Deployment to Railway

### Method 1: Deploy with Docker (Recommended)

1. Create a new Railway project
2. Connect your GitHub repository
3. Railway will automatically detect the Dockerfile and build the application

For the frontend:
- Railway will use Dockerfile.frontend
- Set environment variables:
  - `VITE_API_BASE_URL` = `https://your-backend-url.up.railway.app/api`
  - `VITE_WS_BASE_URL` = `https://your-backend-url.up.railway.app`

For the backend:
- Railway will use backend/Dockerfile
- Set environment variables:
  - `PORT` = `5002`
  - `DATABASE_URL` = (Railway PostgreSQL connection string)
  - `JWT_SECRET` = (your secret key)

### Method 2: Deploy without Docker

#### Frontend Deployment

1. Create a new Railway project
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend-url.up.railway.app/api`
   - `VITE_WS_BASE_URL` = `https://your-backend-url.up.railway.app`

#### Backend Deployment

1. Create a new Railway service
2. Connect your GitHub repository
3. Choose "Node.js" service type
4. Add environment variables:
   - `PORT` = `5002`
   - `DATABASE_URL` = (Railway PostgreSQL connection string)
   - `JWT_SECRET` = (your secret key)
5. Configure the start command:
   - Start Command: `node server.js`

### Database Setup

1. Add a PostgreSQL database from Railway services
2. Railway will automatically provide the DATABASE_URL
3. The init.sql file will automatically initialize the database schema
4. If needed, run database migrations:
   ```bash
   npm run migrate
   ```
   (or however you handle database migrations in your project)

## Project Details

### Authentication

The application uses JWT tokens for authentication:
- Users log in with email and password
- Tokens are stored in localStorage
- Tokens are automatically refreshed
- Protected routes require authentication

Default admin user:
- Email: admin@example.com
- Password: admin123

### Role-Based Access Control

There are three user roles:
1. **Admin**: Full access to all features
2. **Manager**: Department-level access
3. **Employee**: Personal task access

### Real-Time Features

- Live task updates using WebSockets
- Real-time notifications
- Concurrent user editing indicators
- Instant UI updates without page refresh

### File Uploads

- Employee photos
- Task attachments (documents, images, links)
- File validation and storage
- Proper URL handling for uploaded files

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  department_id INTEGER REFERENCES departments(id),
  photo VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'planned',
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  department_id INTEGER REFERENCES departments(id),
  estimated_hours DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task attachments table
CREATE TABLE task_attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Running Locally

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
npm run dev
```

### Code Structure

- `/src/components/` - React components organized by feature
- `/src/context/` - React context providers for global state
- `/src/lib/` - Utility functions and API clients
- `/backend/controllers/` - Request handlers
- `/backend/models/` - Database models
- `/backend/routes/` - API route definitions

## Testing

Run frontend tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email] or open an issue in the repository.