// Built-in MonoSchema block type definitions
import { minLength, maxLength } from '@voidhaus/monoschema/constraints';
import type { BlockTypeDefinition } from '../types.js';

// Custom enum type for text formatting
const TextFormatEnum = Object.assign(
  () => ({
    validate: (value: unknown) => {
      const validFormats = [
        'paragraph', 'heading-1', 'heading-2', 'heading-3', 
        'heading-4', 'heading-5', 'heading-6', 'blockquote'
      ];
      
      if (typeof value !== 'string' || !validFormats.includes(value)) {
        return {
          valid: false,
          errors: [{
            message: `Invalid text format. Expected one of: ${validFormats.join(', ')}`,
            expected: `TextFormat(${validFormats.join(' | ')})`,
            received: typeof value,
            value
          }]
        };
      }
      
      return { valid: true, errors: [] };
    }
  }),
  { tsType: null as unknown as 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6' | 'blockquote' }
);

// Custom enum type for text alignment
const TextAlignmentEnum = Object.assign(
  () => ({
    validate: (value: unknown) => {
      const validAlignments = ['left', 'center', 'right', 'justify'];
      
      if (typeof value !== 'string' || !validAlignments.includes(value)) {
        return {
          valid: false,
          errors: [{
            message: `Invalid text alignment. Expected one of: ${validAlignments.join(', ')}`,
            expected: `TextAlignment(${validAlignments.join(' | ')})`,
            received: typeof value,
            value
          }]
        };
      }
      
      return { valid: true, errors: [] };
    }
  }),
  { tsType: null as unknown as 'left' | 'center' | 'right' | 'justify' }
);

// Custom enum type for callout types
const CalloutTypeEnum = Object.assign(
  () => ({
    validate: (value: unknown) => {
      const validTypes = ['info', 'warning', 'error', 'success', 'note'];
      
      if (typeof value !== 'string' || !validTypes.includes(value)) {
        return {
          valid: false,
          errors: [{
            message: `Invalid callout type. Expected one of: ${validTypes.join(', ')}`,
            expected: `CalloutType(${validTypes.join(' | ')})`,
            received: typeof value,
            value
          }]
        };
      }
      
      return { valid: true, errors: [] };
    }
  }),
  { tsType: null as unknown as 'info' | 'warning' | 'error' | 'success' | 'note' }
);

/**
 * Text Block - Rich text content with formatting
 */
export const TextBlockSchema = {
  $type: Object,
  $properties: {
    content: {
      $type: String,
      $description: "The text content",
      $constraints: [minLength(1), maxLength(50000)]
    },
    format: {
      $type: TextFormatEnum,
      $description: "Text formatting style (paragraph, heading-1, etc.)",
      $optional: true
    },
    alignment: {
      $type: TextAlignmentEnum,
      $description: "Text alignment",
      $optional: true
    }
  }
} as const;

export const textBlockType: BlockTypeDefinition = {
  key: 'text',
  name: 'Text Block',
  description: 'Rich text content with formatting options',
  schema: TextBlockSchema,
  category: 'content',
  icon: 'text',
  isBuiltIn: true,
  version: '1.0.0'
};

/**
 * Image Block - Images with metadata
 */
export const ImageBlockSchema = {
  $type: Object,
  $properties: {
    src: {
      $type: String,
      $description: "Image source URL or path",
      $constraints: [minLength(1), maxLength(2000)]
    },
    alt: {
      $type: String,
      $description: "Alternative text for accessibility",
      $constraints: [minLength(1), maxLength(200)]
    },
    caption: {
      $type: String,
      $description: "Image caption",
      $optional: true,
      $constraints: [maxLength(500)]
    },
    width: {
      $type: Number,
      $description: "Image width in pixels",
      $optional: true
    },
    height: {
      $type: Number,
      $description: "Image height in pixels",
      $optional: true
    }
  }
} as const;

export const imageBlockType: BlockTypeDefinition = {
  key: 'image',
  name: 'Image Block',
  description: 'Images with alt text, captions, and sizing options',
  schema: ImageBlockSchema,
  category: 'media',
  icon: 'image',
  isBuiltIn: true,
  version: '1.0.0'
};

/**
 * Code Block - Syntax highlighted code
 */
export const CodeBlockSchema = {
  $type: Object,
  $properties: {
    code: {
      $type: String,
      $description: "The code content",
      $constraints: [minLength(1), maxLength(100000)]
    },
    language: {
      $type: String,
      $description: "Programming language for syntax highlighting",
      $optional: true,
      $constraints: [maxLength(50)]
    },
    filename: {
      $type: String,
      $description: "Optional filename to display",
      $optional: true,
      $constraints: [maxLength(200)]
    },
    showLineNumbers: {
      $type: Boolean,
      $description: "Whether to show line numbers",
      $optional: true
    }
  }
} as const;

export const codeBlockType: BlockTypeDefinition = {
  key: 'code',
  name: 'Code Block',
  description: 'Syntax-highlighted code snippets with language support',
  schema: CodeBlockSchema,
  category: 'content',
  icon: 'code',
  isBuiltIn: true,
  version: '1.0.0'
};

/**
 * Callout Block - Highlighted information boxes
 */
export const CalloutBlockSchema = {
  $type: Object,
  $properties: {
    content: {
      $type: String,
      $description: "The callout content",
      $constraints: [minLength(1), maxLength(10000)]
    },
    type: {
      $type: CalloutTypeEnum,
      $description: "Type of callout (info, warning, error, success, note)",
      $optional: true
    },
    title: {
      $type: String,
      $description: "Optional title for the callout",
      $optional: true,
      $constraints: [maxLength(200)]
    }
  }
} as const;

export const calloutBlockType: BlockTypeDefinition = {
  key: 'callout',
  name: 'Callout Block',
  description: 'Highlighted information boxes for warnings, tips, and notes',
  schema: CalloutBlockSchema,
  category: 'content',
  icon: 'alert-circle',
  isBuiltIn: true,
  version: '1.0.0'
};

/**
 * All built-in block types
 */
export const builtInBlockTypes: BlockTypeDefinition[] = [
  textBlockType,
  imageBlockType,
  codeBlockType,
  calloutBlockType
];
