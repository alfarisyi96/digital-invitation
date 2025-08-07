# Invitation Platform Web Monorepo

This monorepo contains all web applications for the invitation platform.

## Applications

- **`apps/landing-page`** - Public marketing website
- **`apps/user-dashboard`** - Invitation builder for users
- **`apps/admin-dashboard`** - Admin management panel

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

```bash
# Install dependencies for all apps
npm install

# Install turbo globally (optional)
npm install -g turbo
```

### Development

```bash
# Start all applications in development mode
npm run dev

# Start specific applications
npm run dev:landing     # Landing page only
npm run dev:user        # User dashboard only
npm run dev:admin       # Admin dashboard only
```

### Building

```bash
# Build all applications
npm run build

# Build specific applications
npm run build:landing
npm run build:user
npm run build:admin
```

### Port Configuration

- **Landing Page**: http://localhost:3000
- **User Dashboard**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002

## Architecture

This is a Turborepo monorepo using:

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Turbo** - Build system and task runner

## Backend Integration

All applications connect to the Node.js backend at `http://localhost:5000` (configurable via environment variables).

## Environment Variables

Each app has its own `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```
