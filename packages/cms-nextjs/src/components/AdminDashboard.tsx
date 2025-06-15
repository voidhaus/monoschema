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

  console.log('AdminDashboard: Component mounted/rendered');
  console.log('AdminDashboard: State:', { isAuthenticated, loading });

  useEffect(() => {
    console.log('AdminDashboard: useEffect triggered');
    
    // Check if user is authenticated by calling the status endpoint
    const checkAuth = async () => {
      try {
        console.log('AdminDashboard: Starting auth check...');
        
        // Use the status endpoint which requires authentication
        const response = await fetch('/api/cms/status');
        
        console.log('AdminDashboard: Status response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('AdminDashboard: Status data:', data);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Unauthorized - redirect to login
          console.warn('AdminDashboard: User is not authenticated, redirecting to login');
          router.push(`${basePath}/login`);
        } else {
          console.error('AdminDashboard: Unexpected response:', response.status);
          router.push(`${basePath}/login`);
        }
      } catch (error) {
        console.error('AdminDashboard: Auth check failed:', error);
        router.push(`${basePath}/login`);
      } finally {
        console.log('AdminDashboard: Setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, basePath]);

  console.log('AdminDashboard: About to render, loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    console.log('AdminDashboard: Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminDashboard: Not authenticated, redirecting...');
    router.push(`${basePath}/login`);
    return null;
  }

  console.log('AdminDashboard: Rendering dashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">CMS Dashboard</h1>
            <p className="text-gray-600">Welcome to the content management system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}