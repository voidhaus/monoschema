'use client';

import React, { useState, useCallback } from 'react';
import type { ContentPage, ContentBlock, BlockTypeDefinition } from '@voidhaus/cms-core';
import { BlockRenderer } from './BlockRenderer.js';
import { BlockTypeSelector } from './BlockTypeSelector.js';
import { PageMetadataEditor } from './PageMetadataEditor.js';

export interface BlockEditorProps {
  /** Initial content page */
  content?: ContentPage;
  /** Called when content changes */
  onChange?: (content: ContentPage) => void;
  /** Called when save is requested */
  onSave?: (content: ContentPage) => Promise<void>;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Block type registry with available block types */
  registry: {
    get: (key: string) => BlockTypeDefinition | undefined;
    getAll: () => BlockTypeDefinition[];
    createBlock: (type: string) => ContentBlock | null;
    validateContent: (content: ContentPage) => Promise<{ valid: boolean; blockResults: Map<string, any>; pageErrors: any[] }>;
  };
}

/**
 * Main block-based content editor component
 */
export function BlockEditor({
  content,
  onChange,
  onSave,
  readOnly = false,
  registry
}: BlockEditorProps) {
  const [currentContent, setCurrentContent] = useState<ContentPage>(
    content || {
      id: `page_${Date.now()}`,
      path: '/untitled',
      title: 'Untitled Page',
      description: 'Untitled page description',
      updatedAt: new Date(),
      author: { 
        name: 'Unknown', 
        email: 'unknown@example.com', 
        githubId: 'unknown' 
      },
      blocks: [],
      metadata: {
        slug: 'untitled',
        tags: [],
        category: 'General',
        featured: false,
        schemaVersion: '1.0.0'
      }
    }
  );

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Update content when it changes
  const handleContentChange = useCallback((newContent: ContentPage) => {
    setCurrentContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  // Handle page metadata changes
  const handleMetadataChange = useCallback((metadata: Partial<ContentPage>) => {
    const updatedContent = {
      ...currentContent,
      ...metadata,
      updatedAt: new Date()
    };
    handleContentChange(updatedContent);
  }, [currentContent, handleContentChange]);

  // Handle block changes
  const handleBlockChange = useCallback((blockId: string, updatedBlock: ContentBlock) => {
    const updatedBlocks = currentContent.blocks.map(block =>
      block.id === blockId ? updatedBlock : block
    );
    
    const updatedContent = {
      ...currentContent,
      blocks: updatedBlocks,
      updatedAt: new Date()
    };
    
    handleContentChange(updatedContent);
  }, [currentContent, handleContentChange]);

  // Add new block
  const handleAddBlock = useCallback((blockType: string, afterBlockId?: string) => {
    const blockDefinition = registry.get(blockType);
    if (!blockDefinition) {
      console.error(`Unknown block type: ${blockType}`);
      return;
    }

    const newBlock = registry.createBlock(blockType);
    if (!newBlock) {
      console.error(`Failed to create block of type: ${blockType}`);
      return;
    }

    const updatedBlocks = [...currentContent.blocks];
    
    if (afterBlockId) {
      const afterIndex = updatedBlocks.findIndex(b => b.id === afterBlockId);
      if (afterIndex >= 0) {
        updatedBlocks.splice(afterIndex + 1, 0, newBlock);
      } else {
        updatedBlocks.push(newBlock);
      }
    } else {
      updatedBlocks.push(newBlock);
    }

    const updatedContent = {
      ...currentContent,
      blocks: updatedBlocks,
      updatedAt: new Date()
    };
    
    handleContentChange(updatedContent);
    setSelectedBlockId(newBlock.id);
  }, [currentContent, registry, handleContentChange]);

  // Remove block
  const handleRemoveBlock = useCallback((blockId: string) => {
    const updatedBlocks = currentContent.blocks.filter(block => block.id !== blockId);
    
    const updatedContent = {
      ...currentContent,
      blocks: updatedBlocks,
      updatedAt: new Date()
    };
    
    handleContentChange(updatedContent);
    
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [currentContent, selectedBlockId, handleContentChange]);

  // Move block up/down
  const handleMoveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const blocks = [...currentContent.blocks];
    const index = blocks.findIndex(b => b.id === blockId);
    
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    // Swap blocks safely
    const blockToMove = blocks[index];
    const blockToSwapWith = blocks[newIndex];
    if (blockToMove && blockToSwapWith) {
      blocks[index] = blockToSwapWith;
      blocks[newIndex] = blockToMove;
    }
    
    const updatedContent = {
      ...currentContent,
      blocks,
      updatedAt: new Date()
    };
    
    handleContentChange(updatedContent);
  }, [currentContent, handleContentChange]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave || saving) return;
    
    setSaving(true);
    try {
      await onSave(currentContent);
    } catch (error) {
      console.error('Failed to save content:', error);
      // You might want to show an error message to the user
    } finally {
      setSaving(false);
    }
  }, [onSave, currentContent, saving]);

  // Get available block types
  const availableBlockTypes = registry.getAll().filter((type: BlockTypeDefinition) => !type.isBuiltIn || type.isBuiltIn !== true);

  return (
    <div className="block-editor">
      {/* Editor Header */}
      <div className="editor-header">
        <h1>Content Editor</h1>
        {!readOnly && (
          <div className="editor-actions">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Page Metadata Editor */}
      <div className="page-metadata">
        <PageMetadataEditor
          metadata={{
            title: currentContent.title,
            description: currentContent.description || '',
            slug: currentContent.metadata?.slug || currentContent.path?.replace(/^\//, '').replace(/\.[^.]*$/, ''),
            tags: currentContent.metadata?.tags || [],
            category: currentContent.metadata?.category || 'General'
          }}
          onChange={handleMetadataChange}
          readOnly={readOnly}
        />
      </div>

      {/* Block List */}
      <div className="blocks-container">
        {currentContent.blocks.length === 0 ? (
          <div className="empty-content">
            <p>No blocks yet. Add your first block below.</p>
          </div>
        ) : (
          currentContent.blocks.map((block, index) => (
            <div key={block.id} className="block-wrapper">
              <BlockRenderer
                block={block}
                blockDefinition={registry.get(block.type)}
                isSelected={selectedBlockId === block.id}
                readOnly={readOnly}
                onSelect={() => setSelectedBlockId(block.id)}
                onChange={(updatedBlock: ContentBlock) => handleBlockChange(block.id, updatedBlock)}
                onRemove={() => handleRemoveBlock(block.id)}
                onMoveUp={index > 0 ? () => handleMoveBlock(block.id, 'up') : undefined}
                onMoveDown={index < currentContent.blocks.length - 1 ? () => handleMoveBlock(block.id, 'down') : undefined}
              />
              
              {/* Add Block Button (between blocks) */}
              {!readOnly && (
                <div className="add-block-between">
                  <BlockTypeSelector
                    blockTypes={availableBlockTypes}
                    onSelect={(blockType: string) => handleAddBlock(blockType, block.id)}
                    trigger={<button className="add-block-button">+ Add Block</button>}
                  />
                </div>
              )}
            </div>
          ))
        )}

        {/* Add First Block */}
        {!readOnly && currentContent.blocks.length === 0 && (
          <div className="add-first-block">
            <BlockTypeSelector
              blockTypes={availableBlockTypes}
              onSelect={(blockType: string) => handleAddBlock(blockType)}
              trigger={<button className="add-first-block-button">+ Add Your First Block</button>}
            />
          </div>
        )}
      </div>
    </div>
  );
}
