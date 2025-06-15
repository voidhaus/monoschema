'use client';

import React, { useState, useCallback } from 'react';

export interface PageMetadata {
  title: string;
  description: string;
  slug?: string;
  tags?: string[];
  category?: string;
  [key: string]: any;
}

export interface PageMetadataEditorProps {
  /** Current metadata values */
  metadata: PageMetadata;
  /** Called when metadata changes */
  onChange: (metadata: Partial<PageMetadata>) => void;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Additional metadata fields to show */
  additionalFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'tags';
    options?: string[];
  }>;
}

/**
 * Component for editing page metadata
 */
export function PageMetadataEditor({
  metadata,
  onChange,
  readOnly = false,
  additionalFields = []
}: PageMetadataEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = useCallback((field: string, value: any) => {
    onChange({ [field]: value });
  }, [onChange]);

  const handleTagsChange = useCallback((field: string, tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    handleChange(field, tags);
  }, [handleChange]);

  return (
    <div className="page-metadata-editor">
      {/* Always visible fields */}
      <div className="metadata-main">
        <div className="field-group">
          <label htmlFor="page-title">Page Title *</label>
          <input
            id="page-title"
            type="text"
            value={metadata.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter page title..."
            disabled={readOnly}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="page-description">Description</label>
          <textarea
            id="page-description"
            value={metadata.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of this page..."
            rows={2}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Expandable section for additional metadata */}
      <div className="metadata-toggle">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="toggle-button"
          disabled={readOnly}
        >
          {isExpanded ? '− Hide' : '+ Show'} Page Settings
        </button>
      </div>

      {isExpanded && (
        <div className="metadata-expanded">
          {/* URL Slug */}
          <div className="field-group">
            <label htmlFor="page-slug">URL Slug</label>
            <div className="slug-field">
              <span className="slug-prefix">/</span>
              <input
                id="page-slug"
                type="text"
                value={metadata.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="url-friendly-name"
                disabled={readOnly}
              />
            </div>
            <small className="field-help">
              Leave empty to generate from title
            </small>
          </div>

          {/* Tags */}
          <div className="field-group">
            <label htmlFor="page-tags">Tags</label>
            <input
              id="page-tags"
              type="text"
              value={metadata.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
              disabled={readOnly}
            />
            <small className="field-help">
              Separate tags with commas
            </small>
          </div>

          {/* Category */}
          <div className="field-group">
            <label htmlFor="page-category">Category</label>
            <input
              id="page-category"
              type="text"
              value={metadata.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="General"
              disabled={readOnly}
            />
          </div>

          {/* Additional custom fields */}
          {additionalFields.map(field => (
            <div key={field.key} className="field-group">
              <label htmlFor={`page-${field.key}`}>{field.label}</label>
              
              {field.type === 'text' && (
                <input
                  id={`page-${field.key}`}
                  type="text"
                  value={metadata[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={readOnly}
                />
              )}
              
              {field.type === 'textarea' && (
                <textarea
                  id={`page-${field.key}`}
                  value={metadata[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={3}
                  disabled={readOnly}
                />
              )}
              
              {field.type === 'select' && field.options && (
                <select
                  id={`page-${field.key}`}
                  value={metadata[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={readOnly}
                >
                  <option value="">Select...</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'tags' && (
                <input
                  id={`page-${field.key}`}
                  type="text"
                  value={Array.isArray(metadata[field.key]) ? metadata[field.key].join(', ') : ''}
                  onChange={(e) => handleTagsChange(field.key, e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  disabled={readOnly}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
