'use client';

import { useState, useEffect } from 'react';
import { CMSStatus } from '../types.js';

export interface ContentBrowserProps {
  basePath?: string;
  statusEndpoint?: string;
}

export function ContentBrowser({ 
  basePath = '/admin',
  statusEndpoint = '/api/cms/status'
}: ContentBrowserProps) {
  const [status, setStatus] = useState<CMSStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(statusEndpoint);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Management</h1>
            <p className="text-lg text-gray-600">
              Manage your documentation content with Git-based version control
            </p>
          </div>

          {/* Status Overview */}
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Repository Status</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Current Branch:</span> {status.currentBranch}</p>
                  <p><span className="font-medium">User:</span> {status.user}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      !status.hasUncommittedChanges 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {!status.hasUncommittedChanges ? 'Clean' : 'Has Changes'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Active Branches</h3>
                <div className="space-y-1">
                  {status.branches.length > 0 ? (
                    status.branches.map((branch: string) => (
                      <div key={branch} className="text-sm">
                        <span className={branch === 'main' ? 'font-medium' : 'text-gray-600'}>
                          {branch}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No active branches</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Repository Info</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">URL:</span></p>
                  <p className="text-xs text-gray-600 break-all">{status.repositoryUrl}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <a 
              href={`${basePath}/editor`}
              className="bg-blue-500 text-white p-6 rounded-lg shadow hover:bg-blue-600 transition-colors block text-center"
            >
              <h3 className="text-xl font-semibold mb-2">Content Editor</h3>
              <p className="text-blue-100">Edit documentation files</p>
            </a>

            <button className="bg-green-500 text-white p-6 rounded-lg shadow hover:bg-green-600 transition-colors">
              <h3 className="text-xl font-semibold mb-2">New Page</h3>
              <p className="text-green-100">Create new documentation</p>
            </button>

            <button className="bg-purple-500 text-white p-6 rounded-lg shadow hover:bg-purple-600 transition-colors">
              <h3 className="text-xl font-semibold mb-2">Media Library</h3>
              <p className="text-purple-100">Manage images and assets</p>
            </button>

            <button 
              onClick={fetchStatus}
              className="bg-gray-500 text-white p-6 rounded-lg shadow hover:bg-gray-600 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Refresh Status</h3>
              <p className="text-gray-100">Update repository status</p>
            </button>
          </div>

          {/* Quick Access to Common Files */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'README.md', path: 'docs/README.md', description: 'Main documentation' },
                { name: 'Getting Started', path: 'docs/getting-started.md', description: 'Introduction guide' },
                { name: 'API Reference', path: 'docs/api/index.md', description: 'API documentation' },
                { name: 'MonoSchema Docs', path: 'docs/monoschema/index.md', description: 'MonoSchema library docs' },
                { name: 'RPC Docs', path: 'docs/rpc/index.md', description: 'RPC library docs' },
                { name: 'Examples', path: 'docs/examples/index.md', description: 'Code examples' },
              ].map((file) => (
                <a
                  key={file.path}
                  href={`${basePath}/editor?file=${encodeURIComponent(file.path)}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all block"
                >
                  <h3 className="font-semibold text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{file.path}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
