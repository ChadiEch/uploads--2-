# Railway Deployment Guide

This guide will help you deploy the Tasket application to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. This project repository

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to https://railway.app and sign in to your account
2. Click "New Project"
3. Select "Deploy from GitHub" or "Deploy from CLI"

### 2. Provision a PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will automatically generate a `DATABASE_URL` environment variable

### 3. Configure Environment Variables

Set the following environment variables in your Railway project:

- `JWT_SECRET` - A cryptographically secure random string (at least 64 characters)
- `NODE_ENV` - Set to "production"
- `FRONTEND_URL` - Your Railway app URL (e.g., https://your-app-name.up.railway.app)

### 4. Deploy the Application

Railway will automatically detect this is a Node.js application and deploy it using the root package.json.

The deployment process will:
1. Run `postinstall` script to install dependencies for both frontend and backend
2. Run `build` script to build the React frontend
3. Run `start` script to start the Node.js backend server

### 5. Update Frontend URL (After Deployment)

After your app is deployed, update the `FRONTEND_URL` environment variable with your actual Railway app URL.

## How It Works

- The backend server (Express.js) serves both the API endpoints and the built frontend files
- In production mode, requests to `/api` and `/uploads` are handled by the backend API
- All other requests are served the React frontend application (enabling React Router)
- The frontend makes API calls to the same domain (relative paths) in production

## Troubleshooting

1. **Database Connection Issues**: Ensure your PostgreSQL database is provisioned and the `DATABASE_URL` is correctly set
2. **Environment Variables**: Check that all required environment variables are set
3. **Build Failures**: Check the build logs in Railway for any dependency or build errors