'use client';

import React, { useState } from 'react';
import type { BlockTypeDefinition } from '@voidhaus/cms-core';

export interface BlockTypeSelectorProps {
  /** Available block types to choose from */
  blockTypes: BlockTypeDefinition[];
  /** Called when a block type is selected */
  onSelect: (blockType: string) => void;
  /** Custom trigger element (defaults to a button) */
  trigger?: React.ReactElement;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Component for selecting a block type to add
 */
export function BlockTypeSelector({
  blockTypes,
  onSelect,
  trigger,
  disabled = false
}: BlockTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group block types by category
  const groupedBlockTypes = blockTypes.reduce((groups, blockType) => {
    const category = blockType.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(blockType);
    return groups;
  }, {} as Record<string, BlockTypeDefinition[]>);

  const categories = Object.keys(groupedBlockTypes).sort();

  const handleSelect = (blockType: string) => {
    onSelect(blockType);
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Default trigger if none provided
  const defaultTrigger = (
    <button 
      className="block-selector-trigger"
      disabled={disabled}
    >
      + Add Block
    </button>
  );

  const triggerElement = trigger ? React.cloneElement(trigger as React.ReactElement<any>, {
    onClick: handleToggle,
    disabled
  }) : defaultTrigger;

  return (
    <div className="block-type-selector">
      {React.cloneElement(triggerElement, { onClick: handleToggle })}
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="selector-backdrop"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="selector-dropdown">
            <div className="selector-header">
              <h3>Select Block Type</h3>
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="selector-content">
              {categories.map(category => (
                <div key={category} className="block-category">
                  <h4 className="category-title">{category}</h4>
                  <div className="block-type-grid">
                    {(groupedBlockTypes[category] || []).map(blockType => (
                      <BlockTypeCard
                        key={blockType.key}
                        blockType={blockType}
                        onSelect={() => handleSelect(blockType.key)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface BlockTypeCardProps {
  blockType: BlockTypeDefinition;
  onSelect: () => void;
}

function BlockTypeCard({ blockType, onSelect }: BlockTypeCardProps) {
  // Get icon based on block type
  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'code':
        return '💻';
      case 'callout':
        return '💡';
      case 'list':
        return '📋';
      case 'quote':
        return '💬';
      case 'divider':
        return '➖';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'embed':
        return '🔗';
      default:
        return '📦';
    }
  };

  return (
    <button
      className="block-type-card"
      onClick={onSelect}
      title={blockType.description}
    >
      <div className="block-icon">
        {getBlockIcon(blockType.key)}
      </div>
      <div className="block-info">
        <div className="block-name">{blockType.name}</div>
        {blockType.description && (
          <div className="block-description">{blockType.description}</div>
        )}
      </div>
    </button>
  );
}
