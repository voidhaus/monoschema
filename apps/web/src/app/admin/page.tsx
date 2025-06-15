'use client';

import { AdminDashboard } from '@voidhaus/cms-nextjs/client';

// Prevent static generation for admin pages
export const dynamic = 'force-dynamic';

export default function NewAdminDashboard() {
  return (
    <AdminDashboard
      basePath="/admin"
      organizationName="Voidhaus"
    />
  );
}
