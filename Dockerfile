# Single container: Vite frontend + Express backend
FROM node:20-alpine

WORKDIR /app

# Copy package files from flurbix-app
COPY flurbix-app/package*.json ./

# Install all dependencies (including tsx and backend deps)
RUN npm ci

# Copy all application files
COPY flurbix-app/ ./

# Build Vite frontend into dist/
RUN npx vite build

EXPOSE 5173

# Start Express — serves /api routes + dist/ static files
CMD ["npx", "tsx", "server/server.ts"]
