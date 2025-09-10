# Railway Deployment - Quick Start

This guide provides a quick way to deploy the Tasket application to Railway using Docker images.

## Option 1: Deploy Full Stack with Docker Compose (Recommended)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will automatically detect the `railway.toml` file and deploy using Docker Compose
4. Add the required environment variables:
   - `JWT_SECRET` - A secure random string
   - `POSTGRES_DB` - Database name (optional, defaults to "tasket")
   - `POSTGRES_USER` - Database user (optional, defaults to "postgres")
   - `POSTGRES_PASSWORD` - Database password (optional, defaults to "postgres")

## Option 2: Deploy Services Separately

### Deploy Backend API

1. Create a new service on Railway
2. Choose "Deploy from GitHub" and select your repository
3. In the service settings, set the root directory to `tasket-backend`
4. Railway will use the `tasket-backend/railway.toml` configuration
5. Add a PostgreSQL database plugin
6. Set environment variables:
   - `DATABASE_URL` - Provided by Railway PostgreSQL plugin
   - `JWT_SECRET` - A secure random string
   - `NODE_ENV` - "production"

### Deploy Frontend

1. Create another service on Railway
2. Choose "Deploy from GitHub" and select your repository
3. In the service settings, set the root directory to `tasket`
4. Railway will use the `tasket/railway.toml` configuration
5. Set environment variables:
   - `PORT` - Railway will set this automatically

## Environment Variables

### Backend Required Variables
- `JWT_SECRET` - Cryptographically secure random string
- `DATABASE_URL` - PostgreSQL connection URL (provided by Railway)
- `NODE_ENV` - Should be set to "production"

### Frontend Required Variables
- `VITE_API_BASE_URL` - URL of your backend API (e.g., https://your-backend-service.up.railway.app/api)
- `VITE_WS_BASE_URL` - WebSocket URL of your backend (e.g., https://your-backend-service.up.railway.app)

## Health Checks

Both services include health check endpoints:
- Backend: `/health`
- Frontend: Railway will automatically check if the service responds

## Notes

- The Docker images are optimized for Railway deployment
- PostgreSQL data will persist as long as the volume exists
- Uploaded files are stored in the backend container's `uploads` directory
- Make sure to set proper CORS origins in your backend for the frontend URL