// Core block system types using MonoSchema
import type { MonoSchemaProperty, InferTypeFromMonoSchema } from '@voidhaus/monoschema';

/**
 * Block Type Definition - defines the structure and validation for a block type
 */
export interface BlockTypeDefinition {
  /** Unique identifier for the block type */
  key: string;
  /** Human-readable name */
  name: string;
  /** Description of what this block type does */
  description?: string;
  /** MonoSchema definition for validating block properties */
  schema: MonoSchemaProperty;
  /** Category for organizing blocks in the editor */
  category: string;
  /** Icon identifier for the block selector */
  icon?: string;
  /** Preview template or component name */
  preview?: string;
  /** Whether this is a built-in or custom block type */
  isBuiltIn?: boolean;
  /** Version of the block type schema */
  version?: string;
}

/**
 * Content Block - represents a single block instance in content
 */
export interface ContentBlock {
  /** Unique identifier for this block instance */
  id: string;
  /** Block type key that references a BlockTypeDefinition */
  type: string;
  /** Block properties validated against the block type's schema */
  properties: Record<string, any>;
  /** Optional child blocks for container blocks */
  children?: ContentBlock[];
  /** Metadata about the block */
  metadata?: {
    /** When this block was created */
    createdAt?: Date;
    /** When this block was last updated */
    updatedAt?: Date;
    /** Version of the block type schema used */
    version?: string;
  };
}

/**
 * Content Page - represents a complete page/document
 */
export interface ContentPage {
  /** Unique identifier for the page */
  id: string;
  /** File path in the repository */
  path: string;
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** When the page was published */
  publishedAt?: Date;
  /** When the page was last updated */
  updatedAt: Date;
  /** Author information */
  author: {
    name: string;
    email: string;
    githubId: string;
  };
  /** Array of content blocks that make up the page */
  blocks: ContentBlock[];
  /** Page metadata */
  metadata: {
    slug: string;
    tags: string[];
    category: string;
    featured: boolean;
    /** Schema version for migration tracking */
    schemaVersion?: string;
  };
}

/**
 * Block validation result
 */
export interface BlockValidationResult {
  /** Whether the block is valid */
  valid: boolean;
  /** Validation errors if any */
  errors: Array<{
    path: string;
    message: string;
    expected: string;
    received: string;
    value: unknown;
  }>;
  /** Validated and potentially transformed data */
  data?: any;
}

/**
 * Content validation result
 */
export interface ContentValidationResult {
  /** Whether all content is valid */
  valid: boolean;
  /** Block-level validation results */
  blockResults: Map<string, BlockValidationResult>;
  /** Page-level validation errors */
  pageErrors: Array<{
    message: string;
    blockId?: string;
  }>;
}
