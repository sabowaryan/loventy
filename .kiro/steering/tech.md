# Tech Stack & Development Guide

## Core Technologies

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4 with Typography plugin
- **Routing**: React Router DOM 6
- **Backend**: Supabase (Auth, Database, RLS)
- **Payments**: Stripe integration
- **State Management**: React Context API

## Key Libraries

- **UI/UX**: Lucide React (icons), React Helmet Async (SEO)
- **File Processing**: JSZip, PapaParse (CSV), html2canvas
- **Database**: SQL.js, Supabase client
- **Utilities**: js-cookie, uuid, react-markdown, remark-gfm
- **Image Processing**: react-image-crop

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Generate sitemap
npm run generate-sitemap
```

## Code Quality & Standards

- **Linting**: ESLint with TypeScript, React Hooks, and React Refresh plugins
- **Type Safety**: Strict TypeScript configuration
- **Code Style**: Modern ES modules, functional components with hooks
- **Error Handling**: Global error boundaries and connection error management

## Architecture Patterns

- **Authentication**: Supabase Auth with Row-Level Security (RLS)
- **Data Access**: Custom hooks for database operations
- **Route Protection**: Role-based and permission-based route guards
- **State Management**: Context providers for global state
- **Error Handling**: Centralized error boundaries and fallback components

## Security Considerations

- Row-Level Security (RLS) policies in Supabase
- Temporary access tokens for guest invitations
- Protected routes with role/permission checks
- Secure payment processing via Stripe
- Cookie consent management for GDPR compliance