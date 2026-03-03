# Use Node 22 image as base for building
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Use NGINX lightweight image to serve the frontend
FROM nginx:alpine

# Copy built assets from builder phase to NGINX serve folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (includes Tapera API reverse proxy for CORS)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (internal container port)
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
