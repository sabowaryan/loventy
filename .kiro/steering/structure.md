# Project Structure & Organization

## Root Directory

```
├── public/           # Static assets (images, icons, manifest, etc.)
├── src/             # Source code
├── supabase/        # Database migrations and config
├── .kiro/           # Kiro AI assistant configuration
└── package.json     # Dependencies and scripts
```

## Source Code Organization (`src/`)

### Core Application Files
- `main.tsx` - Application entry point with providers
- `App.tsx` - Main routing and layout configuration
- `index.css` - Global styles and Tailwind imports

### Directory Structure

```
src/
├── components/      # Reusable UI components
│   ├── layouts/     # Layout components (Public, Dashboard)
│   ├── editor/      # Invitation editor components
│   ├── events/      # Event management components
│   ├── guests/      # Guest management components
│   ├── invitation/  # Invitation display components
│   └── settings/    # Settings page components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/            # External service integrations
├── pages/          # Page components
│   ├── auth/       # Authentication pages
│   ├── dashboard/  # Dashboard pages
│   ├── invitation/ # Invitation view pages
│   └── myspace/    # Special access pages
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── data/           # Static data and constants
```

## Component Organization Patterns

### Naming Conventions
- **Components**: PascalCase (e.g., `UserWelcome.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useInvitation.ts`)
- **Types**: PascalCase interfaces (e.g., `User`, `Invitation`)
- **Utilities**: camelCase (e.g., `debounce.ts`)

### Component Categories
- **Layout Components**: Page structure and navigation
- **Feature Components**: Domain-specific functionality
- **UI Components**: Reusable interface elements
- **Route Guards**: Authentication and authorization wrappers

## Key Architectural Decisions

### Route Organization
- **Public Routes**: Marketing pages, legal pages
- **Auth Routes**: Login, register, password reset
- **Protected Routes**: Dashboard, editor, settings
- **Special Routes**: Invitation views, admin panels

### State Management
- **Global State**: AuthContext for user authentication
- **Local State**: Component-level useState and useReducer
- **Server State**: Custom hooks for API calls

### File Naming Patterns
- Pages: Descriptive names (e.g., `Dashboard.tsx`, `Pricing.tsx`)
- Components: Feature-based grouping in subdirectories
- Hooks: Functionality-based naming (e.g., `useEvents.ts`)
- Types: Domain-based organization (e.g., `database.ts`, `auth.ts`)

## Integration Points

- **Supabase**: Database client in `lib/supabase.ts`
- **Stripe**: Payment integration in `lib/stripe.ts`
- **Database**: Custom database utilities in `lib/database.ts`
- **Assets**: Static files organized by type in `public/`