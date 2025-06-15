'use client';

import { useRouter } from 'next/navigation';

export interface AdminLayoutProps {
  children: React.ReactNode;
  basePath?: string;
  logoutEndpoint?: string;
}

export function AdminLayout({ 
  children, 
  basePath = '/admin',
  logoutEndpoint = '/api/auth/logout'
}: AdminLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(logoutEndpoint, { method: 'POST' });
      router.push(`${basePath}/login`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="min-h-screen flex flex-col">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Voidhaus CMS
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <nav className="bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <a
                href={basePath}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href={`${basePath}/content`}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Content
              </a>
              <a
                href={`${basePath}/editor`}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Editor
              </a>
              <a
                href={`${basePath}/branches`}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Branches
              </a>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
