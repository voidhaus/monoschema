'use client';

import { AdminLogin } from '@voidhaus/cms-nextjs/client';

// Prevent static generation for admin pages  
export const dynamic = 'force-dynamic';

export default function NewAdminLogin() {
  return (
    <AdminLogin
      basePath="/admin"
      loginEndpoint="/api/auth/login"
      organizationName="Voidhaus"
    />
  );
}
