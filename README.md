# Tasket - Full Stack Task Management System

A comprehensive task management system with real-time updates, department management, and analytics.

## Deployment to Railway

1. Create a new Railway project
2. Add a PostgreSQL database to your project
3. Connect your GitHub repository to Railway
4. Set the following environment variables:
   - `JWT_SECRET` - A cryptographically secure random string (at least 64 characters)
   - `NODE_ENV` - Set to "production"
   - `FRONTEND_URL` - Your Railway app URL (e.g., https://your-app.up.railway.app)

Railway will automatically use the DATABASE_URL provided by the PostgreSQL service.

## Local Development

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL (or use Docker)

### Using Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `tasket-backend/.env`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tasket
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-at-least-64-bytes-long
```

3. Start the development server:
```bash
npm run dev
```

## Seeding Initial Data

To seed the database with initial data:
```bash
npm run seed
```

This will create a default admin user (admin@example.com / admin123) and a General department.
