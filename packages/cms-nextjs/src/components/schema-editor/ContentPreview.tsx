'use client';

import React from 'react';
import type { ContentPage, ContentBlock } from '@voidhaus/cms-core';

export interface ContentPreviewProps {
  /** Content page to preview */
  content: ContentPage;
  /** Custom class name for the preview container */
  className?: string;
  /** Whether to show page metadata */
  showMetadata?: boolean;
  /** Custom renderers for specific block types */
  customRenderers?: Record<string, React.ComponentType<{ block: ContentBlock }>>;
}

/**
 * Component for previewing schema-based content in a read-only format
 */
export function ContentPreview({
  content,
  className = '',
  showMetadata = false,
  customRenderers = {}
}: ContentPreviewProps) {
  return (
    <div className={`content-preview ${className}`}>
      {/* Page Metadata */}
      {showMetadata && (
        <div className="content-metadata">
          <h1 className="content-title">{content.title}</h1>
          {content.description && (
            <p className="content-description">{content.description}</p>
          )}
          {content.metadata?.tags && content.metadata.tags.length > 0 && (
            <div className="content-tags">
              {content.metadata.tags.map(tag => (
                <span key={tag} className="content-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Blocks */}
      <div className="content-blocks">
        {content.blocks.map(block => (
          <div key={block.id} className={`content-block ${block.type}-block`}>
            <BlockPreview
              block={block}
              customRenderer={customRenderers[block.type]}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {content.blocks.length === 0 && (
        <div className="content-empty">
          <p>This page has no content blocks.</p>
        </div>
      )}
    </div>
  );
}

interface BlockPreviewProps {
  block: ContentBlock;
  customRenderer?: React.ComponentType<{ block: ContentBlock }>;
}

function BlockPreview({ block, customRenderer }: BlockPreviewProps) {
  // Use custom renderer if provided
  if (customRenderer) {
    const CustomRenderer = customRenderer;
    return <CustomRenderer block={block} />;
  }

  // Default renderers for built-in block types
  switch (block.type) {
    case 'text':
      return <TextBlockPreview block={block} />;
    case 'image':
      return <ImageBlockPreview block={block} />;
    case 'code':
      return <CodeBlockPreview block={block} />;
    case 'callout':
      return <CalloutBlockPreview block={block} />;
    default:
      return <GenericBlockPreview block={block} />;
  }
}

// Individual block preview components

function TextBlockPreview({ block }: { block: ContentBlock }) {
  const { content, format } = block.properties;
  
  if (!content) {
    return null;
  }

  const className = `text-preview ${format || 'paragraph'}`;
  
  switch (format) {
    case 'heading-1':
      return <h1 className={className}>{content}</h1>;
    case 'heading-2':
      return <h2 className={className}>{content}</h2>;
    case 'heading-3':
      return <h3 className={className}>{content}</h3>;
    case 'heading-4':
      return <h4 className={className}>{content}</h4>;
    case 'heading-5':
      return <h5 className={className}>{content}</h5>;
    case 'heading-6':
      return <h6 className={className}>{content}</h6>;
    default:
      return <p className={className}>{content}</p>;
  }
}

function ImageBlockPreview({ block }: { block: ContentBlock }) {
  const { src, alt, caption, alignment, width, height } = block.properties;
  
  if (!src) {
    return null;
  }

  const containerClass = `image-preview ${alignment || 'center'}`;
  const imageStyle: React.CSSProperties = {};
  
  if (width) imageStyle.width = width;
  if (height) imageStyle.height = height;

  return (
    <figure className={containerClass}>
      <img 
        src={src} 
        alt={alt || ''} 
        style={imageStyle}
        className="image-preview-img"
      />
      {caption && (
        <figcaption className="image-preview-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CodeBlockPreview({ block }: { block: ContentBlock }) {
  const { code, language, showLineNumbers, title } = block.properties;
  
  if (!code) {
    return null;
  }

  return (
    <div className="code-preview">
      {title && (
        <div className="code-preview-title">{title}</div>
      )}
      <div className="code-preview-header">
        <span className="code-preview-language">
          {language || 'text'}
        </span>
      </div>
      <pre className={`code-preview-content ${showLineNumbers ? 'line-numbers' : ''}`}>
        <code className={`language-${language || 'text'}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function CalloutBlockPreview({ block }: { block: ContentBlock }) {
  const { content, type, title } = block.properties;
  
  if (!content) {
    return null;
  }

  const calloutClass = `callout-preview ${type || 'info'}`;
  
  const typeIcons = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    tip: '🔍'
  };
  
  const icon = typeIcons[type as keyof typeof typeIcons] || typeIcons.info;

  return (
    <div className={calloutClass}>
      <div className="callout-preview-header">
        <span className="callout-preview-icon">{icon}</span>
        {title && (
          <span className="callout-preview-title">{title}</span>
        )}
      </div>
      <div className="callout-preview-content">
        {content}
      </div>
    </div>
  );
}

function GenericBlockPreview({ block }: { block: ContentBlock }) {
  return (
    <div className="generic-preview">
      <div className="generic-preview-type">
        {block.type} Block
      </div>
      <div className="generic-preview-content">
        {Object.entries(block.properties).map(([key, value]) => (
          <div key={key} className="generic-preview-property">
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
}
