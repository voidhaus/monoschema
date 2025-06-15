import type { 
  ContentPage, 
  ContentBlock, 
  ContentValidationResult 
} from '../blocks/types.js';
import { BlockTypeRegistry } from '../blocks/registry.js';

/**
 * Content processing engine for schema-based content operations
 */
export class ContentProcessor {
  constructor(private registry: BlockTypeRegistry) {}

  /**
   * Serialize content page to JSON for storage
   */
  async serializeContent(content: ContentPage): Promise<string> {
    // Validate content before serialization
    const validation = await this.registry.validateContent(content);
    
    if (!validation.valid) {
      const errors = Array.from(validation.blockResults.entries())
        .filter(([_, result]) => !result.valid)
        .map(([blockId, result]) => `Block ${blockId}: ${result.errors.map(e => e.message).join(', ')}`)
        .concat(validation.pageErrors.map(e => e.message));
      
      throw new Error(`Content validation failed: ${errors.join('; ')}`);
    }

    // Create serializable version (remove functions, etc.)
    const serializable = {
      ...content,
      updatedAt: content.updatedAt.toISOString(),
      publishedAt: content.publishedAt?.toISOString(),
      blocks: this.serializeBlocks(content.blocks)
    };

    return JSON.stringify(serializable, null, 2);
  }

  /**
   * Deserialize content page from JSON
   */
  async deserializeContent(json: string): Promise<ContentPage> {
    try {
      const parsed = JSON.parse(json);
      
      // Convert date strings back to Date objects
      return {
        ...parsed,
        updatedAt: new Date(parsed.updatedAt),
        publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : undefined,
        blocks: this.deserializeBlocks(parsed.blocks)
      };
    } catch (error) {
      throw new Error(`Failed to deserialize content: ${error}`);
    }
  }

  /**
   * Transform content blocks for rendering
   */
  async transformForRendering(content: ContentPage): Promise<ContentPage> {
    // Validate content first
    const validation = await this.registry.validateContent(content);
    
    if (!validation.valid) {
      throw new Error('Cannot transform invalid content for rendering');
    }

    // Apply any transformations needed for rendering
    const transformedBlocks = await this.transformBlocks(content.blocks);

    return {
      ...content,
      blocks: transformedBlocks
    };
  }

  /**
   * Extract text content from all blocks for search indexing
   */
  extractTextContent(content: ContentPage): string {
    const textParts: string[] = [content.title];
    
    if (content.description) {
      textParts.push(content.description);
    }

    const extractFromBlock = (block: ContentBlock): void => {
      const blockType = this.registry.get(block.type);
      if (!blockType) return;

      // Extract text based on block type
      switch (block.type) {
        case 'text':
          if (block.properties.content) {
            textParts.push(block.properties.content);
          }
          break;
        case 'code':
          if (block.properties.code) {
            textParts.push(block.properties.code);
          }
          if (block.properties.filename) {
            textParts.push(block.properties.filename);
          }
          break;
        case 'callout':
          if (block.properties.content) {
            textParts.push(block.properties.content);
          }
          if (block.properties.title) {
            textParts.push(block.properties.title);
          }
          break;
        case 'image':
          if (block.properties.alt) {
            textParts.push(block.properties.alt);
          }
          if (block.properties.caption) {
            textParts.push(block.properties.caption);
          }
          break;
      }

      // Recursively extract from children
      if (block.children) {
        block.children.forEach(extractFromBlock);
      }
    };

    content.blocks.forEach(extractFromBlock);
    
    return textParts.join(' ').trim();
  }

  /**
   * Generate content summary/excerpt
   */
  generateSummary(content: ContentPage, maxLength: number = 200): string {
    const textContent = this.extractTextContent(content);
    
    if (textContent.length <= maxLength) {
      return textContent;
    }

    // Find the last complete sentence within the limit
    const truncated = textContent.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }

    // Fallback to word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Clone content with new IDs (for duplication)
   */
  cloneContent(content: ContentPage, newId?: string): ContentPage {
    const cloneBlock = (block: ContentBlock): ContentBlock => ({
      ...block,
      id: this.generateId(),
      children: block.children?.map(cloneBlock),
      metadata: {
        ...block.metadata,
        createdAt: new Date()
      }
    });

    return {
      ...content,
      id: newId || this.generateId(),
      blocks: content.blocks.map(cloneBlock),
      updatedAt: new Date(),
      publishedAt: undefined // Reset publication date
    };
  }

  /**
   * Serialize blocks recursively
   */
  private serializeBlocks(blocks: ContentBlock[]): any[] {
    return blocks.map(block => ({
      ...block,
      children: block.children ? this.serializeBlocks(block.children) : undefined,
      metadata: {
        ...block.metadata,
        createdAt: block.metadata?.createdAt?.toISOString(),
        updatedAt: block.metadata?.updatedAt?.toISOString()
      }
    }));
  }

  /**
   * Deserialize blocks recursively
   */
  private deserializeBlocks(blocks: any[]): ContentBlock[] {
    return blocks.map(block => ({
      ...block,
      children: block.children ? this.deserializeBlocks(block.children) : undefined,
      metadata: {
        ...block.metadata,
        createdAt: block.metadata?.createdAt ? new Date(block.metadata.createdAt) : undefined,
        updatedAt: block.metadata?.updatedAt ? new Date(block.metadata.updatedAt) : undefined
      }
    }));
  }

  /**
   * Transform blocks for rendering (can be extended for specific transformations)
   */
  private async transformBlocks(blocks: ContentBlock[]): Promise<ContentBlock[]> {
    return Promise.all(blocks.map(async block => {
      // Apply block-specific transformations here if needed
      const transformedBlock = { ...block };

      // Recursively transform children
      if (block.children) {
        transformedBlock.children = await this.transformBlocks(block.children);
      }

      return transformedBlock;
    }));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
