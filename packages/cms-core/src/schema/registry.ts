import { configureMonoSchema, type Plugin, type MonoSchemaInstance } from '@voidhaus/monoschema';
import { BlockTypeRegistry } from '../blocks/registry.js';
import { builtInBlockTypes } from '../blocks/schemas/built-in.js';

/**
 * CMS-specific MonoSchema plugin with custom types and validators
 */
export const CMSPlugin: Plugin = {
  name: "CMSPlugin",
  description: "MonoSchema plugin for CMS block types and validation",
  version: "1.0.0",
  types: [
    // Add CMS-specific types here as they're developed
    // ContentKeyObject, MediaObject, LinkObject, etc.
  ],
  prevalidate: [
    // Add pre-validation functions for CMS-specific needs
    // Content key validation, media file existence checks, etc.
  ]
};

/**
 * Schema registry for the CMS with built-in types
 */
export class SchemaRegistry {
  private monoSchema: MonoSchemaInstance;
  private blockRegistry: BlockTypeRegistry;

  constructor(plugins: Plugin[] = [CMSPlugin]) {
    this.monoSchema = configureMonoSchema({
      plugins,
      stripUnknownProperties: false, // Keep unknown props for flexibility
      errorUnknownProperties: false  // But don't error on them
    });

    this.blockRegistry = new BlockTypeRegistry({
      plugins
    });

    // Register built-in block types
    this.registerBuiltInTypes();
  }

  /**
   * Get the MonoSchema instance
   */
  getMonoSchema(): MonoSchemaInstance {
    return this.monoSchema;
  }

  /**
   * Get the block type registry
   */
  getBlockRegistry(): BlockTypeRegistry {
    return this.blockRegistry;
  }

  /**
   * Register a custom MonoSchema plugin
   */
  registerPlugin(plugin: Plugin): void {
    // Note: This would require reconstructing the MonoSchema instance
    // For now, plugins should be provided during construction
    throw new Error('Dynamic plugin registration not yet supported. Provide plugins during construction.');
  }

  /**
   * Validate any data against a schema
   */
  async validate(schema: any, data: unknown): Promise<any> {
    const validator = this.monoSchema.validate(schema);
    return await validator(data);
  }

  /**
   * Register built-in block types
   */
  private registerBuiltInTypes(): void {
    for (const blockType of builtInBlockTypes) {
      try {
        this.blockRegistry.register(blockType);
      } catch (error) {
        console.warn(`Failed to register built-in block type '${blockType.key}':`, error);
      }
    }
  }
}

/**
 * Default schema registry instance
 */
export const defaultSchemaRegistry = new SchemaRegistry();
