---
inclusion: always
---

# Database Schema & Architecture Guidelines

## Database Technology
- **Primary Database**: Supabase (PostgreSQL)
- **Client Library**: `@supabase/supabase-js`
- **Type Safety**: Generated TypeScript types from Supabase schema
- **Security**: Row-Level Security (RLS) policies for all tables

## Core Database Tables

### Authentication & Users
- `auth.users` - Supabase managed user authentication
- `profiles` - Extended user profile information
- `user_roles` - Role-based access control (admin, host, guest)

### Events & Invitations
- `events` - Wedding events and celebrations
- `invitations` - Digital invitation instances
- `guests` - Guest information and RSVP tracking
- `invitation_guests` - Many-to-many relationship for invitation recipients

### Access Control
- `temporary_access_tokens` - Time-limited guest access
- `qr_codes` - Secure check-in verification codes

## Database Patterns

### Row-Level Security (RLS)
- All tables MUST have RLS enabled
- Policies based on user authentication and role hierarchy
- Guest access through temporary tokens with time constraints
- Admin override capabilities for system management

### Data Access Patterns
- Use custom hooks for database operations (`useEvents`, `useGuests`, etc.)
- Implement optimistic updates for better UX
- Handle connection errors gracefully with retry logic
- Cache frequently accessed data using React Query patterns

### Migration Strategy
- All schema changes through Supabase migrations
- Version-controlled migration files in `supabase/migrations/`
- Test migrations in development before production deployment
- Maintain backward compatibility during schema updates

## Type Safety Requirements
- Generate TypeScript types from Supabase schema: `supabase gen types typescript`
- Import database types from `src/types/database.ts`
- Use strict typing for all database operations
- Validate data at API boundaries

## Performance Guidelines
- Use database indexes for frequently queried columns
- Implement pagination for large result sets
- Use Supabase real-time subscriptions sparingly
- Optimize queries to minimize round trips

## Security Best Practices
- Never expose sensitive data in client-side code
- Use parameterized queries to prevent SQL injection
- Implement proper authentication checks before data access
- Log security-relevant database operations
- Regular security audits of RLS policies