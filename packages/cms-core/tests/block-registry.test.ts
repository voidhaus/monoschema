import { describe, it, expect, beforeEach } from 'vitest';
import { 
  BlockTypeRegistry, 
  globalBlockRegistry, 
  builtInBlockTypes,
  textBlockType,
  imageBlockType,
  codeBlockType,
  calloutBlockType,
  type ContentBlock,
  type ContentPage
} from '../src/index.js';

describe('BlockTypeRegistry', () => {
  let registry: BlockTypeRegistry;

  beforeEach(() => {
    registry = new BlockTypeRegistry();
  });

  describe('Block Type Registration', () => {
    it('should register a block type successfully', () => {
      registry.register(textBlockType);
      
      expect(registry.has('text')).toBe(true);
      expect(registry.get('text')).toEqual(textBlockType);
    });

    it('should throw error when registering duplicate block type', () => {
      registry.register(textBlockType);
      
      expect(() => registry.register(textBlockType)).toThrow(
        "Block type 'text' is already registered"
      );
    });

    it('should get all registered block types', () => {
      registry.register(textBlockType);
      registry.register(imageBlockType);
      
      const allTypes = registry.getAll();
      expect(allTypes).toHaveLength(2);
      expect(allTypes.map(t => t.key)).toContain('text');
      expect(allTypes.map(t => t.key)).toContain('image');
    });

    it('should get block types by category', () => {
      registry.register(textBlockType); // content category
      registry.register(imageBlockType); // media category
      registry.register(codeBlockType); // content category
      
      const contentTypes = registry.getByCategory('content');
      expect(contentTypes).toHaveLength(2);
      expect(contentTypes.map(t => t.key)).toEqual(['text', 'code']);
      
      const mediaTypes = registry.getByCategory('media');
      expect(mediaTypes).toHaveLength(1);
      expect(mediaTypes[0].key).toBe('image');
    });

    it('should get all categories', () => {
      registry.register(textBlockType); // content
      registry.register(imageBlockType); // media
      
      const categories = registry.getCategories();
      expect(categories).toEqual(['content', 'media']);
    });
  });

  describe('Block Creation', () => {
    beforeEach(() => {
      registry.register(textBlockType);
    });

    it('should create a block with default properties', () => {
      const block = registry.createBlock('text', 'test-id');
      
      expect(block).toBeDefined();
      expect(block!.id).toBe('test-id');
      expect(block!.type).toBe('text');
      expect(block!.properties).toEqual({
        content: '', // Default for required String property
      });
      expect(block!.metadata?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for unknown block type', () => {
      const block = registry.createBlock('unknown');
      expect(block).toBeNull();
    });

    it('should generate unique IDs when not provided', () => {
      const block1 = registry.createBlock('text');
      const block2 = registry.createBlock('text');
      
      expect(block1!.id).not.toBe(block2!.id);
    });
  });

  describe('Block Validation', () => {
    beforeEach(() => {
      builtInBlockTypes.forEach(type => registry.register(type));
    });

    it('should validate a valid text block', async () => {
      const block: ContentBlock = {
        id: 'test-1',
        type: 'text',
        properties: {
          content: 'Hello, World!',
          format: 'heading-1',
          alignment: 'center'
        }
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate and fail for invalid text block properties', async () => {
      const block: ContentBlock = {
        id: 'test-2',
        type: 'text',
        properties: {
          content: '', // Too short (minLength: 1)
          format: 'invalid-format', // Invalid enum value
          alignment: 'invalid-alignment' // Invalid enum value
        }
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for unknown block type', async () => {
      const block: ContentBlock = {
        id: 'test-3',
        type: 'unknown',
        properties: {}
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown block type: unknown');
    });

    it('should validate a valid image block', async () => {
      const block: ContentBlock = {
        id: 'test-4',
        type: 'image',
        properties: {
          src: 'https://example.com/image.jpg',
          alt: 'A test image',
          caption: 'This is a test image',
          width: 800,
          height: 600
        }
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('should validate a valid code block', async () => {
      const block: ContentBlock = {
        id: 'test-5',
        type: 'code',
        properties: {
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          filename: 'example.js',
          showLineNumbers: true
        }
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('should validate a valid callout block', async () => {
      const block: ContentBlock = {
        id: 'test-6',
        type: 'callout',
        properties: {
          content: 'This is an important note!',
          type: 'info',
          title: 'Information'
        }
      };
      
      const result = await registry.validateBlock(block);
      expect(result.valid).toBe(true);
    });
  });

  describe('Content Page Validation', () => {
    beforeEach(() => {
      builtInBlockTypes.forEach(type => registry.register(type));
    });

    it('should validate a complete content page', async () => {
      const content: ContentPage = {
        id: 'test-page',
        path: '/docs/test.json',
        title: 'Test Page',
        description: 'A test page',
        updatedAt: new Date(),
        author: {
          name: 'Test User',
          email: 'test@example.com',
          githubId: 'testuser'
        },
        blocks: [
          {
            id: 'block-1',
            type: 'text',
            properties: {
              content: 'Welcome to our test page!',
              format: 'heading-1'
            }
          },
          {
            id: 'block-2',
            type: 'callout',
            properties: {
              content: 'This is an important note.',
              type: 'info'
            }
          }
        ],
        metadata: {
          slug: 'test-page',
          tags: ['test'],
          category: 'testing',
          featured: false
        }
      };
      
      const result = await registry.validateContent(content);
      expect(result.valid).toBe(true);
      expect(result.pageErrors).toHaveLength(0);
    });

    it('should detect duplicate block IDs', async () => {
      const content: ContentPage = {
        id: 'test-page',
        path: '/docs/test.json',
        title: 'Test Page',
        updatedAt: new Date(),
        author: {
          name: 'Test User',
          email: 'test@example.com',
          githubId: 'testuser'
        },
        blocks: [
          {
            id: 'duplicate-id',
            type: 'text',
            properties: { content: 'First block' }
          },
          {
            id: 'duplicate-id', // Duplicate ID!
            type: 'text',
            properties: { content: 'Second block' }
          }
        ],
        metadata: {
          slug: 'test-page',
          tags: [],
          category: 'testing',
          featured: false
        }
      };
      
      const result = await registry.validateContent(content);
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => e.message.includes('Duplicate block ID'))).toBe(true);
    });
  });
});

describe('Global Block Registry', () => {
  it('should have built-in block types registered', () => {
    expect(globalBlockRegistry.has('text')).toBe(true);
    expect(globalBlockRegistry.has('image')).toBe(true);
    expect(globalBlockRegistry.has('code')).toBe(true);
    expect(globalBlockRegistry.has('callout')).toBe(true);
  });

  it('should return correct built-in block type definitions', () => {
    const textType = globalBlockRegistry.get('text');
    expect(textType?.name).toBe('Text Block');
    expect(textType?.isBuiltIn).toBe(true);
    expect(textType?.category).toBe('content');
  });
});
