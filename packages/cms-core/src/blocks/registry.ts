import { configureMonoSchema, type MonoSchemaInstance } from '@voidhaus/monoschema';
import type { 
  BlockTypeDefinition, 
  ContentBlock, 
  BlockValidationResult,
  ContentValidationResult,
  ContentPage 
} from './types.js';

/**
 * Registry for managing block types with MonoSchema validation
 */
export class BlockTypeRegistry {
  private blockTypes = new Map<string, BlockTypeDefinition>();
  private monoSchema: MonoSchemaInstance;

  constructor(monoSchemaOptions?: Parameters<typeof configureMonoSchema>[0]) {
    this.monoSchema = configureMonoSchema(monoSchemaOptions || {});
  }

  /**
   * Register a new block type
   */
  register(blockType: BlockTypeDefinition): void {
    if (this.blockTypes.has(blockType.key)) {
      throw new Error(`Block type '${blockType.key}' is already registered`);
    }

    // Validate the schema itself
    try {
      this.monoSchema.validate(blockType.schema);
    } catch (error) {
      throw new Error(`Invalid schema for block type '${blockType.key}': ${error}`);
    }

    this.blockTypes.set(blockType.key, blockType);
  }

  /**
   * Get a registered block type
   */
  get(key: string): BlockTypeDefinition | undefined {
    return this.blockTypes.get(key);
  }

  /**
   * Get all registered block types
   */
  getAll(): BlockTypeDefinition[] {
    return Array.from(this.blockTypes.values());
  }

  /**
   * Get block types by category
   */
  getByCategory(category: string): BlockTypeDefinition[] {
    return this.getAll().filter(blockType => blockType.category === category);
  }

  /**
   * Check if a block type is registered
   */
  has(key: string): boolean {
    return this.blockTypes.has(key);
  }

  /**
   * Unregister a block type (mainly for testing)
   */
  unregister(key: string): boolean {
    return this.blockTypes.delete(key);
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const blockType of this.blockTypes.values()) {
      categories.add(blockType.category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Validate a single content block against its schema
   */
  async validateBlock(block: ContentBlock): Promise<BlockValidationResult> {
    const blockType = this.get(block.type);
    
    if (!blockType) {
      return {
        valid: false,
        errors: [{
          path: 'type',
          message: `Unknown block type: ${block.type}`,
          expected: 'registered block type',
          received: block.type,
          value: block.type
        }]
      };
    }

    try {
      const validator = this.monoSchema.validate(blockType.schema);
      const result = await validator(block.properties);
      
      return {
        valid: result.valid,
        errors: result.errors,
        data: result.data
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          path: 'properties',
          message: `Validation error: ${error}`,
          expected: 'valid properties',
          received: typeof block.properties,
          value: block.properties
        }]
      };
    }
  }

  /**
   * Validate an entire content page
   */
  async validateContent(content: ContentPage): Promise<ContentValidationResult> {
    const blockResults = new Map<string, BlockValidationResult>();
    const pageErrors: Array<{ message: string; blockId?: string }> = [];
    let allValid = true;

    // Validate each block
    for (const block of content.blocks) {
      const result = await this.validateBlock(block);
      blockResults.set(block.id, result);
      
      if (!result.valid) {
        allValid = false;
      }
    }

    // Check for duplicate block IDs
    const blockIds = new Set<string>();
    for (const block of content.blocks) {
      if (blockIds.has(block.id)) {
        pageErrors.push({
          message: `Duplicate block ID: ${block.id}`,
          blockId: block.id
        });
        allValid = false;
      }
      blockIds.add(block.id);
    }

    // Validate nested blocks recursively
    const validateNestedBlocks = async (blocks: ContentBlock[]): Promise<void> => {
      for (const block of blocks) {
        if (block.children && block.children.length > 0) {
          for (const childBlock of block.children) {
            const childResult = await this.validateBlock(childBlock);
            blockResults.set(childBlock.id, childResult);
            
            if (!childResult.valid) {
              allValid = false;
            }
          }
          await validateNestedBlocks(block.children);
        }
      }
    };

    await validateNestedBlocks(content.blocks);

    return {
      valid: allValid && pageErrors.length === 0,
      blockResults,
      pageErrors
    };
  }

  /**
   * Create a new block instance with default properties
   */
  createBlock(blockTypeKey: string, id?: string): ContentBlock | null {
    const blockType = this.get(blockTypeKey);
    if (!blockType) {
      return null;
    }

    // Generate default properties based on schema
    const defaultProperties = this.generateDefaultProperties(blockType.schema);

    return {
      id: id || this.generateBlockId(),
      type: blockTypeKey,
      properties: defaultProperties,
      metadata: {
        createdAt: new Date(),
        version: blockType.version
      }
    };
  }

  /**
   * Generate default properties from a MonoSchema
   */
  private generateDefaultProperties(schema: any): Record<string, any> {
    const defaults: Record<string, any> = {};

    if (schema.$properties) {
      for (const [key, propSchema] of Object.entries(schema.$properties as Record<string, any>)) {
        if (!propSchema.$optional) {
          // Generate basic defaults based on type
          if (propSchema.$type === String) {
            defaults[key] = '';
          } else if (propSchema.$type === Number) {
            defaults[key] = 0;
          } else if (propSchema.$type === Boolean) {
            defaults[key] = false;
          } else if (Array.isArray(propSchema.$type)) {
            defaults[key] = [];
          } else if (propSchema.$type === Object) {
            defaults[key] = this.generateDefaultProperties(propSchema);
          }
        }
      }
    }

    return defaults;
  }

  /**
   * Generate a unique block ID
   */
  private generateBlockId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global registry instance
export const globalBlockRegistry = new BlockTypeRegistry();

// Auto-register built-in block types
import { 
  textBlockType, 
  imageBlockType, 
  codeBlockType, 
  calloutBlockType 
} from './schemas/built-in.js';

// Register all built-in block types
globalBlockRegistry.register(textBlockType);
globalBlockRegistry.register(imageBlockType);
globalBlockRegistry.register(codeBlockType);
globalBlockRegistry.register(calloutBlockType);
