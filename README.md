# Tasket - Full Stack Task Management System

A comprehensive task management system with real-time updates, department management, and analytics.

## Deployment to Railway

### Prerequisites
- A Railway account (https://railway.app)
- Railway CLI installed (`npm install -g @railway/cli`)

### Deployment Steps

1. Clone this repository:
```bash
git clone <repository-url>
cd tasket-fullstack
```

2. Login to Railway:
```bash
railway login
```

3. Initialize a new Railway project:
```bash
railway init
```

4. Add a PostgreSQL database:
```bash
railway add
```
Select "Database" and then "PostgreSQL"

5. Set the required environment variables:
```bash
railway env set NODE_ENV=production
railway env set JWT_SECRET=your-super-secret-jwt-key-here-at-least-64-characters-long
```

6. Deploy the application:
```bash
railway up
```

7. After deployment is complete, get your application URL:
```bash
railway url
```

8. Update the FRONTEND_URL environment variable with your Railway app URL:
```bash
railway env set FRONTEND_URL=https://your-app.up.railway.app
```

9. Re-deploy to apply the environment variable changes:
```bash
railway up
```

### Environment Variables

The following environment variables are required for production deployment:

- `JWT_SECRET` - A cryptographically secure random string (at least 64 characters)
- `NODE_ENV` - Set to "production"
- `FRONTEND_URL` - Your Railway app URL

Railway automatically provides the `DATABASE_URL` environment variable when you add a PostgreSQL database.

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