# Railway Deployment Options

This project provides multiple ways to deploy to Railway:

## 1. Docker Compose Deployment (Recommended for simplicity)

Uses the `railway.toml` and `railway.docker-compose.yml` files at the root of the project.

**Pros:**
- Single deployment for both frontend and backend
- Automatic service linking
- Shared PostgreSQL database

**Cons:**
- Less flexible scaling options
- Both services share the same deployment lifecycle

## 2. Separate Service Deployment

Deploy frontend and backend as separate Railway services.

**Pros:**
- Independent scaling
- Separate deployment lifecycles
- More control over resources

**Cons:**
- More complex setup
- Need to manage CORS between services

## Docker Images

This project includes Docker images optimized for Railway:

### Frontend (`tasket/Dockerfile.frontend`)
- Node.js 18 Alpine
- React application build
- Serves static files with `serve`

### Backend (`tasket-backend/Dockerfile`)
- Node.js 18 Alpine
- Express.js server
- PostgreSQL client
- WebSocket support

## Environment Variables

### For Docker Compose Deployment
Set these in your Railway project variables:
- `JWT_SECRET` - Required for authentication
- `POSTGRES_DB` - Optional (defaults to "tasket")
- `POSTGRES_USER` - Optional (defaults to "postgres")
- `POSTGRES_PASSWORD` - Optional (defaults to "postgres")

### For Separate Deployments
Backend service needs:
- `DATABASE_URL` - PostgreSQL connection URL
- `JWT_SECRET` - Authentication secret
- `NODE_ENV` - Should be "production"

Frontend service needs:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_WS_BASE_URL` - Backend WebSocket URL

## Deployment Commands

Railway will automatically detect and use the appropriate configuration files:
- Root `railway.toml` for Docker Compose deployment
- `tasket-backend/railway.toml` for backend-only deployment
- `tasket/railway.toml` for frontend-only deployment

Refer to `RAILWAY_DEPLOYMENT.md` and `RAILWAY_DEPLOYMENT_QUICK_START.md` for detailed instructions.