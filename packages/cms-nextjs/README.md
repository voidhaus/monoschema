# @voidhaus/cms-nextjs

Next.js integration package for the Voidhaus Git-based CMS. This package provides reusable components, API handlers, and middleware to easily integrate the CMS into any Next.js application.

## Installation

```bash
pnpm add @voidhaus/cms-nextjs @voidhaus/cms-core @voidhaus/cms-git
```

## Features

- **Pre-built React Components**: Admin layout, login, dashboard, content browser, and editor
- **API Route Handlers**: Authentication and CMS operations
- **Middleware**: Session validation and authentication
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Catch-all Router**: Easy integration with minimal setup

## Quick Start

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_ORGANIZATION=your_organization
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Repository
GITHUB_REPOSITORY=owner/repo
GITHUB_TOKEN=your_personal_access_token

# Security
SESSION_SECRET=your_random_secret_key

# Optional
CMS_WORKSPACE_PATH=/tmp/cms-workspace
GITHUB_REPOSITORY_URL=https://github.com/owner/repo
```

### 2. API Routes (Catch-all approach)

Create `app/api/[...cms]/route.ts`:

```typescript
import { createCMSRouter } from '@voidhaus/cms-nextjs';

const cmsRouter = createCMSRouter({
  config: {
    githubClientId: process.env.GITHUB_CLIENT_ID!,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
    githubOrganization: process.env.GITHUB_ORGANIZATION!,
    githubRepository: process.env.GITHUB_REPOSITORY!,
    githubToken: process.env.GITHUB_TOKEN!,
    sessionSecret: process.env.SESSION_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI!,
    workspacePath: process.env.CMS_WORKSPACE_PATH,
    repositoryUrl: process.env.GITHUB_REPOSITORY_URL,
  },
});

export const GET = cmsRouter.GET;
export const POST = cmsRouter.POST;
```

This handles these routes automatically:
- `GET /api/auth/login` - GitHub OAuth login
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/cms/status` - Repository status
- `GET /api/cms/content` - Get file content
- `POST /api/cms/content` - Save file changes
- `POST /api/cms/publish` - Publish changes

### 3. Middleware

Create or update `middleware.ts`:

```typescript
import { NextRequest } from 'next/server';
import { createCMSMiddleware } from '@voidhaus/cms-nextjs';

const cmsMiddleware = createCMSMiddleware({
  config: {
    githubClientId: process.env.GITHUB_CLIENT_ID!,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
    githubOrganization: process.env.GITHUB_ORGANIZATION!,
    githubRepository: process.env.GITHUB_REPOSITORY!,
    githubToken: process.env.GITHUB_TOKEN!,
    sessionSecret: process.env.SESSION_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI!,
  },
  basePath: '/admin',
  publicPaths: ['/login', '/api/auth/login', '/api/auth/callback'],
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return cmsMiddleware(request);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 4. Admin Pages

#### Admin Layout (`app/admin/layout.tsx`)

```typescript
import { AdminLayout } from '@voidhaus/cms-nextjs';

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout
      basePath="/admin"
      logoutEndpoint="/api/auth/logout"
    >
      {children}
    </AdminLayout>
  );
}
```

#### Dashboard (`app/admin/page.tsx`)

```typescript
import { AdminDashboard } from '@voidhaus/cms-nextjs';

export default function Dashboard() {
  return (
    <AdminDashboard
      basePath="/admin"
      organizationName="Your Organization"
    />
  );
}
```

#### Login (`app/admin/login/page.tsx`)

```typescript
import { AdminLogin } from '@voidhaus/cms-nextjs';

export default function Login() {
  return (
    <AdminLogin
      basePath="/admin"
      loginEndpoint="/api/auth/login"
      organizationName="Your Organization"
    />
  );
}
```

#### Content Browser (`app/admin/content/page.tsx`)

```typescript
import { ContentBrowser } from '@voidhaus/cms-nextjs';

export default function Content() {
  return (
    <ContentBrowser
      basePath="/admin"
      statusEndpoint="/api/cms/status"
    />
  );
}
```

#### Content Editor (`app/admin/editor/page.tsx`)

```typescript
import { ContentEditor } from '@voidhaus/cms-nextjs';

export default function Editor() {
  return (
    <ContentEditor
      basePath="/admin"
      statusEndpoint="/api/cms/status"
      contentEndpoint="/api/cms/content"
      publishEndpoint="/api/cms/publish"
    />
  );
}
```

## Alternative: Individual API Routes

If you prefer more granular control, you can create individual API routes:

```typescript
import { createCMSAPIRoutes } from '@voidhaus/cms-nextjs';

const routes = createCMSAPIRoutes({
  config: {
    // ... your config
  },
});

// app/api/auth/login/route.ts
export const GET = routes.auth.login.GET;

// app/api/cms/status/route.ts
export const GET = routes.cms.status.GET;

// etc.
```

## Authentication Helpers

### Get Current User

```typescript
import { getCurrentUser } from '@voidhaus/cms-nextjs';

// In a server component or API route
const user = await getCurrentUser(config);
if (user) {
  console.log(user.login, user.name);
}
```

### Require Authentication

```typescript
import { requireAuth } from '@voidhaus/cms-nextjs';

// In a server component
export default async function ProtectedPage() {
  const session = await requireAuth(config);
  // This will redirect to login if not authenticated
  
  return <div>Hello {session.login}!</div>;
}
```

## Component Props

All components accept optional props for customization:

### AdminLayout
- `basePath?: string` - Base path for admin routes (default: `/admin`)
- `logoutEndpoint?: string` - Logout API endpoint (default: `/api/auth/logout`)

### AdminLogin
- `basePath?: string` - Base path for admin routes
- `loginEndpoint?: string` - Login API endpoint (default: `/api/auth/login`)
- `organizationName?: string` - Organization name to display

### AdminDashboard
- `basePath?: string` - Base path for admin routes
- `organizationName?: string` - Organization name to display

### ContentBrowser
- `basePath?: string` - Base path for admin routes
- `statusEndpoint?: string` - Status API endpoint (default: `/api/cms/status`)

### ContentEditor
- `basePath?: string` - Base path for admin routes
- `statusEndpoint?: string` - Status API endpoint
- `contentEndpoint?: string` - Content API endpoint (default: `/api/cms/content`)
- `publishEndpoint?: string` - Publish API endpoint (default: `/api/cms/publish`)

## Benefits

### For Developers
- **Plug-and-play**: Drop into any Next.js app with minimal configuration
- **Type Safe**: Full TypeScript support with comprehensive interfaces
- **Flexible**: Use individual components or the complete solution
- **Customizable**: All components accept props for customization

### For Projects
- **Reusable**: Share CMS functionality across multiple Next.js projects
- **Maintainable**: Centralized CMS logic in a dedicated package
- **Consistent**: Same interface and behavior across all implementations
- **Scalable**: Easy to extend with additional features

## Migration from Phase 1

If you have an existing Phase 1 implementation, you can gradually migrate:

1. Install the new package
2. Replace individual pages with package components
3. Replace API routes with the catch-all router
4. Update middleware to use the package middleware
5. Remove old implementation files

The new package maintains compatibility with the existing Phase 1 API structure.
