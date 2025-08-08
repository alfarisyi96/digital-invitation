# Multi-stage build for frontend apps
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/landing-page/package*.json ./apps/landing-page/
COPY apps/user-dashboard/package*.json ./apps/user-dashboard/
COPY apps/admin-dashboard/package*.json ./apps/admin-dashboard/

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build all apps
RUN npm run build

# Production stage - Multi-app serving with nginx
FROM nginx:alpine AS production

# Copy built apps
COPY --from=builder /app/apps/landing-page/out /usr/share/nginx/html/
COPY --from=builder /app/apps/user-dashboard/out /usr/share/nginx/html/dashboard/
COPY --from=builder /app/apps/admin-dashboard/out /usr/share/nginx/html/admin/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of nginx files
RUN chown -R nextjs:nodejs /usr/share/nginx/html
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextjs:nodejs /var/run/nginx.pid

USER nextjs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
