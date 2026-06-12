# Stage 1: Build the static site
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from flurbix-app
COPY flurbix-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY flurbix-app/ ./

# Build the project (Vite bakes in VITE_* env variables at build time)
RUN npm run build

# Stage 2: Serve the static site using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration to listen on port 5173
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
