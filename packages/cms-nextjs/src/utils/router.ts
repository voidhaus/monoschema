import { NextRequest, NextResponse } from 'next/server';
import { createAuthHandlers, createCMSHandlers } from '../index.js';
import { CMSConfig } from '../types.js';

export interface CMSRouterOptions {
  config: CMSConfig;
  basePath?: string;
}

/**
 * Creates a catch-all handler for CMS API routes
 * Usage in Next.js app router: app/api/[...cms]/route.ts
 * 
 * Handles these routes:
 * - GET/POST /api/auth/login
 * - GET /api/auth/callback  
 * - POST /api/auth/logout
 * - GET /api/cms/status
 * - GET/POST /api/cms/content
 * - POST /api/cms/publish
 */
export function createCMSRouter({ config, basePath = '/admin' }: CMSRouterOptions) {
  const authHandlers = createAuthHandlers(config);
  const cmsHandlers = createCMSHandlers(config);

  return {
    async GET(request: NextRequest, { params }: { params: Promise<{ cms: string[] }> }) {
      const resolvedParams = await params;
      const path = resolvedParams.cms.join('/');

      switch (path) {
        case 'auth/login':
          return authHandlers.login(request);
        
        case 'auth/callback':
          return authHandlers.callback(request);
          
        case 'cms/status':
          return cmsHandlers.status(request);
          
        case 'cms/content':
          return cmsHandlers.content.get(request);
          
        default:
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    },

    async POST(request: NextRequest, { params }: { params: Promise<{ cms: string[] }> }) {
      const resolvedParams = await params;
      const path = resolvedParams.cms.join('/');

      switch (path) {
        case 'auth/logout':
          return authHandlers.logout(request);
          
        case 'cms/content':
          return cmsHandlers.content.post(request);
          
        case 'cms/publish':
          return cmsHandlers.publish(request);
          
        default:
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    },
  };
}

/**
 * Creates individual API route handlers for more granular control
 */
export function createCMSAPIRoutes({ config }: { config: CMSConfig }) {
  const authHandlers = createAuthHandlers(config);
  const cmsHandlers = createCMSHandlers(config);

  return {
    auth: {
      login: {
        async GET(request: NextRequest) {
          return authHandlers.login(request);
        }
      },
      callback: {
        async GET(request: NextRequest) {
          return authHandlers.callback(request);
        }
      },
      logout: {
        async POST(request: NextRequest) {
          return authHandlers.logout(request);
        }
      }
    },
    cms: {
      status: {
        async GET(request: NextRequest) {
          return cmsHandlers.status(request);
        }
      },
      content: {
        async GET(request: NextRequest) {
          return cmsHandlers.content.get(request);
        },
        async POST(request: NextRequest) {
          return cmsHandlers.content.post(request);
        }
      },
      publish: {
        async POST(request: NextRequest) {
          return cmsHandlers.publish(request);
        }
      }
    }
  };
}
