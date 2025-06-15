'use client';

import { useState, useEffect } from 'react';
import { CMSStatus } from '../types.js';

interface ContentFile {
  path: string;
  content: string;
  branch: string;
}

export interface ContentEditorProps {
  basePath?: string;
  statusEndpoint?: string;
  contentEndpoint?: string;
  publishEndpoint?: string;
}

export function ContentEditor({ 
  basePath = '/admin',
  statusEndpoint = '/api/cms/status',
  contentEndpoint = '/api/cms/content',
  publishEndpoint = '/api/cms/publish'
}: ContentEditorProps) {
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ContentFile | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<CMSStatus | null>(null);

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
    }
  };

  const loadFile = async (filePath: string, branch = 'main') => {
    try {
      const response = await fetch(`${contentEndpoint}?path=${encodeURIComponent(filePath)}&branch=${branch}`);
      const data = await response.json();
      
      if (response.ok) {
        const file: ContentFile = {
          path: filePath,
          content: data.content,
          branch: data.branch,
        };
        setSelectedFile(file);
        setContent(data.content);
      } else {
        console.error('Failed to load file:', data.error);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      const response = await fetch(contentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile.path,
          content,
          message: `Update ${selectedFile.path} via CMS`,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('File saved successfully:', data);
        // Update the selected file with new branch info
        setSelectedFile({
          ...selectedFile,
          branch: data.branchName,
        });
        // Refresh status
        fetchStatus();
      } else {
        console.error('Failed to save file:', data.error);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setSaving(false);
    }
  };

  const publishChanges = async (branchName: string) => {
    try {
      const response = await fetch(publishEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchName,
          createPullRequest: true,
          autoMerge: false,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Changes published successfully:', data);
        if (data.pullRequestUrl) {
          window.open(data.pullRequestUrl, '_blank');
        }
        fetchStatus();
      } else {
        console.error('Failed to publish changes:', data.error);
      }
    } catch (error) {
      console.error('Failed to publish changes:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Content Files</h2>
        
        {/* Status Info */}
        {status && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="font-medium text-sm mb-2">Status</h3>
            <p className="text-xs text-gray-600">Current Branch: {status.currentBranch}</p>
            <p className="text-xs text-gray-600">User: {status.user}</p>
          </div>
        )}

        {/* Quick file access */}
        <div className="space-y-2">
          <button
            onClick={() => loadFile('docs/README.md')}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
          >
            📄 docs/README.md
          </button>
          <button
            onClick={() => loadFile('docs/getting-started.md')}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
          >
            📄 docs/getting-started.md
          </button>
          <button
            onClick={() => loadFile('docs/api/index.md')}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
          >
            📄 docs/api/index.md
          </button>
        </div>

        {/* Branches */}
        {status?.branches && status.branches.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-2">Active Branches</h3>
            <div className="space-y-1">
              {status.branches.map((branch: string) => (
                <div key={branch} className="flex items-center justify-between text-xs">
                  <span className={branch === 'main' ? 'font-medium' : 'text-gray-600'}>
                    {branch}
                  </span>
                  {branch.startsWith('cms/') && (
                    <button
                      onClick={() => publishChanges(branch)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Publish
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedFile ? (
                <div>
                  <h1 className="text-xl font-semibold">{selectedFile.path}</h1>
                  <p className="text-sm text-gray-600">Branch: {selectedFile.branch}</p>
                </div>
              ) : (
                <h1 className="text-xl font-semibold">Select a file to edit</h1>
              )}
            </div>
            {selectedFile && (
              <button
                onClick={saveFile}
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          {selectedFile ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none"
              placeholder="Edit your content here..."
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No file selected</p>
                <p className="text-sm">Choose a file from the sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
