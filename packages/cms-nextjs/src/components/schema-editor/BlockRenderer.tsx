'use client';

import React, { useState, useCallback } from 'react';
import type { ContentBlock, BlockTypeDefinition } from '@voidhaus/cms-core';
import { SchemaFormEditor } from './SchemaFormEditor.js';

export interface BlockRendererProps {
  /** The block to render */
  block: ContentBlock;
  /** Block type definition for validation and rendering */
  blockDefinition?: BlockTypeDefinition;
  /** Whether this block is currently selected */
  isSelected?: boolean;
  /** Whether the block is in read-only mode */
  readOnly?: boolean;
  /** Called when the block is selected */
  onSelect?: () => void;
  /** Called when the block content changes */
  onChange?: (block: ContentBlock) => void;
  /** Called when the block should be removed */
  onRemove?: () => void;
  /** Called to move block up (undefined if can't move up) */
  onMoveUp?: () => void;
  /** Called to move block down (undefined if can't move down) */
  onMoveDown?: () => void;
}

/**
 * Renders a single content block with editing capabilities
 */
export function BlockRenderer({
  block,
  blockDefinition,
  isSelected = false,
  readOnly = false,
  onSelect,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown
}: BlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Handle property changes
  const handlePropertyChange = useCallback((propertyName: string, value: any) => {
    if (!onChange) return;

    const updatedBlock = {
      ...block,
      properties: {
        ...block.properties,
        [propertyName]: value
      }
    };

    onChange(updatedBlock);
  }, [block, onChange]);

  // Handle block selection
  const handleSelect = useCallback(() => {
    onSelect?.();
    if (!readOnly) {
      setIsEditing(true);
    }
  }, [onSelect, readOnly]);

  // Handle edit mode toggle
  const handleToggleEdit = useCallback(() => {
    if (!readOnly) {
      setIsEditing(!isEditing);
    }
  }, [isEditing, readOnly]);

  // Render block content based on type
  const renderBlockContent = () => {
    if (isEditing && !readOnly) {
      return (
        <div className="block-editor-form">
          <SchemaFormEditor
            schema={blockDefinition?.schema}
            values={block.properties}
            onChange={(newProperties) => {
              if (onChange) {
                onChange({
                  ...block,
                  properties: newProperties
                });
              }
            }}
          />
        </div>
      );
    }

    // Render preview based on block type
    switch (block.type) {
      case 'text':
        return <BlockTextPreview block={block} />;
      case 'image':
        return <BlockImagePreview block={block} />;
      case 'code':
        return <BlockCodePreview block={block} />;
      case 'callout':
        return <BlockCalloutPreview block={block} />;
      default:
        return <BlockGenericPreview block={block} />;
    }
  };

  const blockTitle = blockDefinition?.name || `${block.type} Block`;

  return (
    <div 
      className={`block-renderer ${isSelected ? 'selected' : ''} ${block.type}-block`}
      onClick={handleSelect}
    >
      {/* Block Header */}
      <div className="block-header">
        <div className="block-info">
          <span className="block-type">{blockTitle}</span>
          {block.id && (
            <span className="block-id">#{block.id.slice(-8)}</span>
          )}
        </div>
        
        {!readOnly && (
          <div className="block-actions">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleEdit(); }}
              className="edit-button"
              title={isEditing ? 'Preview' : 'Edit'}
            >
              {isEditing ? '👁' : '✏️'}
            </button>
            
            {onMoveUp && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                className="move-button"
                title="Move Up"
              >
                ↑
              </button>
            )}
            
            {onMoveDown && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                className="move-button"
                title="Move Down"
              >
                ↓
              </button>
            )}
            
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="remove-button"
                title="Remove Block"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Block Content */}
      <div className="block-content">
        {renderBlockContent()}
      </div>
    </div>
  );
}

// Block preview components for different types

function BlockTextPreview({ block }: { block: ContentBlock }) {
  const { content, format } = block.properties;
  
  const className = `text-block-preview ${format || 'paragraph'}`;
  
  if (format === 'heading-1') {
    return <h1 className={className}>{content || 'Empty heading'}</h1>;
  }
  if (format === 'heading-2') {
    return <h2 className={className}>{content || 'Empty heading'}</h2>;
  }
  if (format === 'heading-3') {
    return <h3 className={className}>{content || 'Empty heading'}</h3>;
  }
  
  return <p className={className}>{content || 'Empty paragraph'}</p>;
}

function BlockImagePreview({ block }: { block: ContentBlock }) {
  const { src, alt, caption, alignment } = block.properties;
  
  if (!src) {
    return (
      <div className="image-block-preview empty">
        <div className="image-placeholder">
          📷 No image selected
        </div>
      </div>
    );
  }
  
  return (
    <div className={`image-block-preview ${alignment || 'center'}`}>
      <img src={src} alt={alt || 'Image'} />
      {caption && <p className="image-caption">{caption}</p>}
    </div>
  );
}

function BlockCodePreview({ block }: { block: ContentBlock }) {
  const { code, language, showLineNumbers } = block.properties;
  
  return (
    <div className="code-block-preview">
      <div className="code-header">
        <span className="code-language">{language || 'text'}</span>
      </div>
      <pre className={showLineNumbers ? 'line-numbers' : ''}>
        <code>{code || '// Empty code block'}</code>
      </pre>
    </div>
  );
}

function BlockCalloutPreview({ block }: { block: ContentBlock }) {
  const { content, type, title } = block.properties;
  
  const typeEmoji: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    tip: '💡'
  };
  
  const emoji = typeEmoji[type as string] || typeEmoji.info;
  
  return (
    <div className={`callout-block-preview ${type || 'info'}`}>
      <div className="callout-header">
        <span className="callout-icon">{emoji}</span>
        {title && <span className="callout-title">{title}</span>}
      </div>
      <div className="callout-content">
        {content || 'Empty callout'}
      </div>
    </div>
  );
}

function BlockGenericPreview({ block }: { block: ContentBlock }) {
  return (
    <div className="generic-block-preview">
      <div className="block-type-label">
        {block.type} Block
      </div>
      <div className="block-properties">
        <pre>{JSON.stringify(block.properties, null, 2)}</pre>
      </div>
    </div>
  );
}
