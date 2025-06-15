'use client';

import React, { useState, useCallback } from 'react';
import type { ContentPage } from '@voidhaus/cms-core';
import { BlockEditor, ContentPreview } from './index.js';

export interface SchemaEditorDemoProps {
  /** Initial content to load */
  initialContent?: ContentPage;
  /** Whether to show the demo in split-screen mode */
  splitScreen?: boolean;
  /** Block type registry */
  registry: {
    get: (key: string) => any;
    getAll: () => any[];
    createBlock: (type: string) => any;
    validateContent: (content: ContentPage) => Promise<any>;
  };
  /** Content processor for serialization */
  processor?: {
    serializeContent: (content: ContentPage) => Promise<string>;
  };
}

/**
 * Demo component that showcases the schema-based editor functionality
 */
export function SchemaEditorDemo({ 
  initialContent,
  splitScreen = true,
  registry,
  processor
}: SchemaEditorDemoProps) {
  const [currentContent, setCurrentContent] = useState<ContentPage>(
    initialContent || createSampleContent()
  );
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [jsonView, setJsonView] = useState(false);

  const handleContentChange = useCallback((content: ContentPage) => {
    setCurrentContent(content);
  }, []);

  const handleSave = useCallback(async (content: ContentPage) => {
    console.log('Saving content:', content);
    
    try {
      // Serialize the content for storage
      if (processor) {
        const serialized = await processor.serializeContent(content);
        console.log('Serialized content:', serialized);
      }
      
      // Here you would typically send this to your API
      // await fetch('/api/cms/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: serialized
      // });
      
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content: ' + (error as Error).message);
    }
  }, [processor]);

  const exportContent = useCallback(async () => {
    try {
      let serialized: string;
      if (processor) {
        serialized = await processor.serializeContent(currentContent);
      } else {
        serialized = JSON.stringify(currentContent, null, 2);
      }
      const blob = new Blob([serialized], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentContent.path?.replace(/^\//, '').replace(/\//g, '-') || 'content'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export content: ' + (error as Error).message);
    }
  }, [currentContent, processor]);

  return (
    <div className="schema-editor-demo">
      {/* Demo Header */}
      <div className="demo-header">
        <div className="demo-title">
          <h1>Schema-Based CMS Editor</h1>
          <p>Interactive demo of the MonoSchema-powered block editor</p>
        </div>
        
        <div className="demo-controls">
          <div className="view-controls">
            <button
              onClick={() => setViewMode('edit')}
              className={viewMode === 'edit' ? 'active' : ''}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={viewMode === 'preview' ? 'active' : ''}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={viewMode === 'split' ? 'active' : ''}
            >
              Split
            </button>
          </div>
          
          <div className="action-controls">
            <button onClick={() => setJsonView(!jsonView)} className="json-toggle">
              {jsonView ? 'Hide JSON' : 'Show JSON'}
            </button>
            <button onClick={exportContent} className="export-button">
              Export JSON
            </button>
            <button 
              onClick={() => setCurrentContent(createSampleContent())}
              className="reset-button"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`demo-content ${viewMode}`}>
        {/* Editor Panel */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-panel">
            <BlockEditor
              content={currentContent}
              onChange={handleContentChange}
              onSave={handleSave}
              registry={registry}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-panel">
            <div className="preview-header">
              <h2>Preview</h2>
            </div>
            <div className="preview-content">
              <ContentPreview
                content={currentContent}
                showMetadata={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* JSON View */}
      {jsonView && (
        <div className="json-view">
          <div className="json-header">
            <h3>Content JSON</h3>
            <button onClick={() => setJsonView(false)} className="close-json">
              ×
            </button>
          </div>
          <pre className="json-content">
            {JSON.stringify(currentContent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Helper function to create sample content
function createSampleContent(): ContentPage {
  return {
    id: 'demo-page',
    path: '/demo/schema-editor',
    title: 'Schema Editor Demo',
    description: 'A demonstration of the MonoSchema-powered block editor system',
    updatedAt: new Date(),
    author: { 
      name: 'Demo User', 
      email: 'demo@example.com', 
      githubId: 'demo-user' 
    },
    metadata: {
      slug: 'schema-editor-demo',
      tags: ['demo', 'schema', 'editor'],
      category: 'Documentation',
      featured: false,
      schemaVersion: '1.0.0'
    },
    blocks: [
      {
        id: 'intro-heading',
        type: 'text',
        properties: {
          content: 'Welcome to the Schema Editor',
          format: 'heading-1'
        }
      },
      {
        id: 'intro-text',
        type: 'text',
        properties: {
          content: 'This demo showcases the power of MonoSchema-based content blocks. Each block is validated against its schema definition, ensuring type safety and consistent data structure.',
          format: 'paragraph'
        }
      },
      {
        id: 'feature-callout',
        type: 'callout',
        properties: {
          type: 'tip',
          title: 'Key Features',
          content: 'Schema validation, type safety, extensible block system, real-time preview, and seamless serialization.'
        }
      },
      {
        id: 'code-example',
        type: 'code',
        properties: {
          language: 'typescript',
          code: `// Example of creating a new block type
const customBlock = registry.createBlock('text');
customBlock.properties.content = 'Hello, Schema Editor!';`,
          showLineNumbers: true
        }
      }
    ]
  };
}
