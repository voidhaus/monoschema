import { AdminLayout } from '@voidhaus/cms-nextjs/client';

export default function NewAdminLayout({
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
