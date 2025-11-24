# MR3X Frontend - Next.js

Frontend for the MR3X Rental Management System built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Features

- Server-Side Rendering (SSR)
- Client-Side Rendering (CSR) for interactive components
- Protected routes with middleware
- JWT authentication
- Responsive design with Tailwind CSS
- Beautiful UI components with Shadcn UI
- Form validation with Zod
- API integration with backend

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running on port 8081

### Installation

1. Install dependencies:
```bash
cd frontend-nextjs
npm install
```

2. Configure environment variables:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

3. Run the development server:
```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend-nextjs/
├── src/
│   ├── app/
    │   │   ├── auth/          # Authentication pages
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── dashboard/     # Protected dashboard pages
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── tenants/
│   │   │   ├── contracts/
│   │   │   ├── payments/
│   │   │   ├── chat/
│   │   │   └── notifications/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/            # Shadcn UI components
│   │   └── providers.tsx  # React Query provider
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Utility functions
│   └── middleware.ts      # Route protection
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pages

### Authentication (Public)
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset (planned)

### Dashboard (Protected)
- `/dashboard` - Main dashboard with overview
- `/dashboard/properties` - Property management
- `/dashboard/tenants` - Tenant management
- `/dashboard/contracts` - Contract management
- `/dashboard/payments` - Payment tracking
- `/dashboard/chat` - Messaging system
- `/dashboard/notifications` - Notification settings

## Authentication

The app uses JWT tokens stored in cookies. The middleware automatically:
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages to `/dashboard`

## API Integration

The API client (`src/lib/api.ts`) provides functions for:
- Authentication (login, register)
- Dashboard data
- Properties CRUD
- Contracts management
- Payments tracking
- User/Tenant management
- Chat messaging
- Address lookup

## Styling

The app uses a dark blue-based color scheme to match the existing Vite app. Colors are defined in `src/app/globals.css` and can be customized.

## Key Features

### Server Components
- Used for static content and initial data loading
- Better performance and SEO

### Client Components
- Used for interactive UI elements
- Marked with 'use client' directive

### Route Groups
- `auth` - Public authentication pages
- `dashboard` - Protected dashboard pages
- Allows shared layouts without affecting URLs

### Middleware
- Automatic route protection
- JWT token validation
- Redirect logic

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Migration from React + Vite

This Next.js app is designed to replace the existing React + Vite frontend with:
- Better performance through SSR
- Improved SEO
- Simplified routing with file-based routing
- Built-in optimization features
- Same UI components and functionality

## Next Steps

The following components need to be implemented:
- Properties page (CRUD interface)
- Tenants page (management interface)
- Contracts page (with PDF viewer)
- Payments page (with charts)
- Chat interface
- Notifications interface

All pages should follow the established pattern with:
- TanStack Query for data fetching
- React Hook Form for forms
- Zod for validation
- Shadcn UI components for consistent design

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t mr3x-frontend .
docker run -p 3000:3000 mr3x-frontend
```

### Self-hosted
```bash
npm run build
npm start
```

## License

ISC

