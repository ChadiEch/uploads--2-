# Use Node.js 18 alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose port (Railway will set PORT environment variable)
EXPOSE $PORT

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "$PORT"]