import type { 
  ContentPage, 
  ContentBlock, 
  ContentValidationResult,
  BlockValidationResult 
} from '../blocks/types.js';
import { BlockTypeRegistry } from '../blocks/registry.js';

/**
 * Validation rules for content
 */
export interface ValidationRules {
  /** Maximum number of blocks per page */
  maxBlocksPerPage?: number;
  /** Maximum nesting depth for blocks */
  maxNestingDepth?: number;
  /** Required metadata fields */
  requiredMetadata?: string[];
  /** Allowed block types (if restricted) */
  allowedBlockTypes?: string[];
  /** Custom validation functions */
  customValidators?: Array<(content: ContentPage) => Promise<string[]>>;
}

/**
 * Content validator with configurable rules
 */
export class ContentValidator {
  constructor(
    private registry: BlockTypeRegistry,
    private rules: ValidationRules = {}
  ) {}

  /**
   * Validate content with comprehensive checks
   */
  async validateContent(content: ContentPage): Promise<ContentValidationResult> {
    // Start with registry validation
    const baseResult = await this.registry.validateContent(content);
    
    // Add additional validation rules
    const additionalErrors = await this.validateRules(content);
    
    return {
      valid: baseResult.valid && additionalErrors.length === 0,
      blockResults: baseResult.blockResults,
      pageErrors: [...baseResult.pageErrors, ...additionalErrors.map(msg => ({ message: msg }))]
    };
  }

  /**
   * Validate individual block with enhanced checks
   */
  async validateBlock(block: ContentBlock, context?: { parentType?: string; depth?: number }): Promise<BlockValidationResult> {
    // Basic schema validation
    const baseResult = await this.registry.validateBlock(block);
    
    if (!baseResult.valid) {
      return baseResult;
    }

    // Additional validation based on context
    const contextErrors = this.validateBlockContext(block, context);
    
    if (contextErrors.length > 0) {
      return {
        valid: false,
        errors: [...baseResult.errors, ...contextErrors],
        data: baseResult.data
      };
    }

    return baseResult;
  }

  /**
   * Check if content can be safely migrated to a new schema version
   */
  async validateMigration(
    content: ContentPage, 
    targetSchemaVersion: string
  ): Promise<{ canMigrate: boolean; issues: string[] }> {
    const issues: string[] = [];
    let canMigrate = true;

    // Check if all block types exist in target version
    const checkBlock = (block: ContentBlock): void => {
      const blockType = this.registry.get(block.type);
      if (!blockType) {
        issues.push(`Block type '${block.type}' not found in registry`);
        canMigrate = false;
        return;
      }

      // Here you could add version-specific migration checks
      // For now, we assume all registered types are compatible
      
      if (block.children) {
        block.children.forEach(checkBlock);
      }
    };

    content.blocks.forEach(checkBlock);

    return { canMigrate, issues };
  }

  /**
   * Sanitize content to remove potentially harmful data
   */
  sanitizeContent(content: ContentPage): ContentPage {
    const sanitizeBlock = (block: ContentBlock): ContentBlock => {
      const sanitized: ContentBlock = {
        id: this.sanitizeString(block.id),
        type: this.sanitizeString(block.type),
        properties: this.sanitizeProperties(block.properties, block.type),
        children: block.children?.map(sanitizeBlock),
        metadata: block.metadata
      };

      return sanitized;
    };

    return {
      ...content,
      id: this.sanitizeString(content.id),
      title: this.sanitizeString(content.title),
      description: content.description ? this.sanitizeString(content.description) : undefined,
      blocks: content.blocks.map(sanitizeBlock),
      metadata: {
        ...content.metadata,
        slug: this.sanitizeString(content.metadata.slug),
        tags: content.metadata.tags.map(tag => this.sanitizeString(tag))
      }
    };
  }

  /**
   * Validate additional rules
   */
  private async validateRules(content: ContentPage): Promise<string[]> {
    const errors: string[] = [];

    // Check maximum blocks per page
    if (this.rules.maxBlocksPerPage && content.blocks.length > this.rules.maxBlocksPerPage) {
      errors.push(`Too many blocks: ${content.blocks.length} (max: ${this.rules.maxBlocksPerPage})`);
    }

    // Check nesting depth
    if (this.rules.maxNestingDepth) {
      const maxDepth = this.calculateMaxDepth(content.blocks);
      if (maxDepth > this.rules.maxNestingDepth) {
        errors.push(`Nesting too deep: ${maxDepth} levels (max: ${this.rules.maxNestingDepth})`);
      }
    }

    // Check required metadata
    if (this.rules.requiredMetadata) {
      for (const field of this.rules.requiredMetadata) {
        if (!(field in content.metadata) || !content.metadata[field as keyof typeof content.metadata]) {
          errors.push(`Required metadata field missing: ${field}`);
        }
      }
    }

    // Check allowed block types
    if (this.rules.allowedBlockTypes) {
      const usedTypes = this.extractAllBlockTypes(content.blocks);
      const disallowedTypes = usedTypes.filter(type => !this.rules.allowedBlockTypes!.includes(type));
      if (disallowedTypes.length > 0) {
        errors.push(`Disallowed block types used: ${disallowedTypes.join(', ')}`);
      }
    }

    // Run custom validators
    if (this.rules.customValidators) {
      for (const validator of this.rules.customValidators) {
        const customErrors = await validator(content);
        errors.push(...customErrors);
      }
    }

    return errors;
  }

  /**
   * Validate block in context
   */
  private validateBlockContext(
    block: ContentBlock, 
    context?: { parentType?: string; depth?: number }
  ): Array<{ path: string; message: string; expected: string; received: string; value: unknown }> {
    const errors: Array<{ path: string; message: string; expected: string; received: string; value: unknown }> = [];

    // Check nesting depth
    if (context?.depth && this.rules.maxNestingDepth && context.depth > this.rules.maxNestingDepth) {
      errors.push({
        path: 'depth',
        message: `Block nested too deeply: ${context.depth} levels`,
        expected: `<= ${this.rules.maxNestingDepth}`,
        received: context.depth.toString(),
        value: context.depth
      });
    }

    // Add more context-specific validations here as needed

    return errors;
  }

  /**
   * Calculate maximum nesting depth
   */
  private calculateMaxDepth(blocks: ContentBlock[], currentDepth: number = 1): number {
    let maxDepth = currentDepth;

    for (const block of blocks) {
      if (block.children && block.children.length > 0) {
        const childDepth = this.calculateMaxDepth(block.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }

    return maxDepth;
  }

  /**
   * Extract all block types used in content
   */
  private extractAllBlockTypes(blocks: ContentBlock[]): string[] {
    const types = new Set<string>();

    const addTypes = (blocks: ContentBlock[]): void => {
      for (const block of blocks) {
        types.add(block.type);
        if (block.children) {
          addTypes(block.children);
        }
      }
    };

    addTypes(blocks);
    return Array.from(types);
  }

  /**
   * Sanitize string values
   */
  private sanitizeString(value: string): string {
    // Basic XSS prevention - remove script tags and javascript: URLs
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  /**
   * Sanitize properties based on block type schema
   */
  private sanitizeProperties(properties: Record<string, any>, blockType: string): Record<string, any> {
    const blockTypeDef = this.registry.get(blockType);
    if (!blockTypeDef) {
      return properties;
    }

    const sanitized: Record<string, any> = {};

    // Only keep properties that are defined in the schema
    if (blockTypeDef.schema.$properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (key in blockTypeDef.schema.$properties) {
          // Apply type-specific sanitization
          const propSchema = (blockTypeDef.schema.$properties as any)[key];
          if (propSchema.$type === String && typeof value === 'string') {
            sanitized[key] = this.sanitizeString(value);
          } else {
            sanitized[key] = value;
          }
        }
      }
    }

    return sanitized;
  }
}
