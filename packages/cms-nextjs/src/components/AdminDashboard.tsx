'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminDashboardProps {
  basePath?: string;
}

export function AdminDashboard({ basePath = '/admin' }: AdminDashboardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // TODO: Implement actual session validation
        // For now, check if we have a session token
        const token = localStorage.getItem('cms_session');
        if (!token) {
          router.push(`${basePath}/login`);
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(`${basePath}/login`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, basePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Voidhaus CMS
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your documentation content with ease
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Create Content</h3>
              <p className="text-gray-600 mb-4">
                Start writing new documentation pages
              </p>
              <a 
                href={`${basePath}/editor`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
              >
                New Page
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Edit Existing</h3>
              <p className="text-gray-600 mb-4">
                Modify existing documentation content
              </p>
              <a 
                href={`${basePath}/content`}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
              >
                Browse Content
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Manage Drafts</h3>
              <p className="text-gray-600 mb-4">
                Review and publish draft content
              </p>
              <a 
                href={`${basePath}/branches`}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
              >
                View Drafts
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-500">No recent activity to show.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
