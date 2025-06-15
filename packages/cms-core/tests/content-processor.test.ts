import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ContentProcessor,
  globalBlockRegistry,
  type ContentPage,
  type ContentBlock
} from '../src/index.js';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;
  let sampleContent: ContentPage;

  beforeEach(() => {
    processor = new ContentProcessor(globalBlockRegistry);
    
    sampleContent = {
      id: 'test-page',
      path: '/docs/test.json',
      title: 'Test Page',
      description: 'A test page for processing',
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      publishedAt: new Date('2024-01-01T09:00:00Z'),
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
            content: 'Welcome to our test page! This is the main heading.',
            format: 'heading-1',
            alignment: 'center'
          }
        },
        {
          id: 'block-2',
          type: 'callout',
          properties: {
            content: 'This is an important note about our testing process.',
            type: 'info',
            title: 'Testing Note'
          }
        },
        {
          id: 'block-3',
          type: 'code',
          properties: {
            code: 'console.log("Hello, CMS!");',
            language: 'javascript',
            filename: 'example.js',
            showLineNumbers: true
          }
        }
      ],
      metadata: {
        slug: 'test-page',
        tags: ['test', 'cms', 'validation'],
        category: 'testing',
        featured: false
      }
    };
  });

  describe('Serialization and Deserialization', () => {
    it('should serialize valid content to JSON', async () => {
      const serialized = await processor.serializeContent(sampleContent);
      
      expect(typeof serialized).toBe('string');
      expect(serialized.length).toBeGreaterThan(0);
      
      // Should be valid JSON
      const parsed = JSON.parse(serialized);
      expect(parsed.id).toBe('test-page');
      expect(parsed.blocks).toHaveLength(3);
    });

    it('should deserialize JSON back to content', async () => {
      const serialized = await processor.serializeContent(sampleContent);
      const deserialized = await processor.deserializeContent(serialized);
      
      expect(deserialized.id).toBe(sampleContent.id);
      expect(deserialized.title).toBe(sampleContent.title);
      expect(deserialized.blocks).toHaveLength(sampleContent.blocks.length);
      expect(deserialized.updatedAt).toBeInstanceOf(Date);
      expect(deserialized.publishedAt).toBeInstanceOf(Date);
    });

    it('should fail serialization for invalid content', async () => {
      const invalidContent = {
        ...sampleContent,
        blocks: [
          {
            id: 'invalid-block',
            type: 'text',
            properties: {
              content: '', // Invalid: too short
            }
          }
        ]
      };
      
      await expect(processor.serializeContent(invalidContent))
        .rejects.toThrow('Content validation failed');
    });

    it('should fail deserialization for malformed JSON', async () => {
      const malformedJson = '{ invalid json }';
      
      await expect(processor.deserializeContent(malformedJson))
        .rejects.toThrow('Failed to deserialize content');
    });
  });

  describe('Content Transformation', () => {
    it('should transform content for rendering', async () => {
      const transformed = await processor.transformForRendering(sampleContent);
      
      expect(transformed.id).toBe(sampleContent.id);
      expect(transformed.blocks).toHaveLength(sampleContent.blocks.length);
      // Transformation currently passes through, but could add processing here
    });

    it('should fail transformation for invalid content', async () => {
      const invalidContent = {
        ...sampleContent,
        blocks: [
          {
            id: 'invalid-block',
            type: 'unknown-type',
            properties: {}
          }
        ]
      };
      
      await expect(processor.transformForRendering(invalidContent))
        .rejects.toThrow('Cannot transform invalid content for rendering');
    });
  });

  describe('Text Extraction', () => {
    it('should extract text content from all blocks', () => {
      const textContent = processor.extractTextContent(sampleContent);
      
      expect(textContent).toContain('Test Page');
      expect(textContent).toContain('A test page for processing');
      expect(textContent).toContain('Welcome to our test page!');
      expect(textContent).toContain('This is an important note');
      expect(textContent).toContain('Testing Note');
      expect(textContent).toContain('console.log("Hello, CMS!");');
      expect(textContent).toContain('example.js');
    });

    it('should handle content with no extractable text', () => {
      const emptyContent: ContentPage = {
        ...sampleContent,
        description: undefined,
        blocks: []
      };
      
      const textContent = processor.extractTextContent(emptyContent);
      expect(textContent).toBe('Test Page');
    });

    it('should extract text from nested blocks', () => {
      const contentWithNesting: ContentPage = {
        ...sampleContent,
        blocks: [
          {
            id: 'parent-block',
            type: 'text',
            properties: {
              content: 'Parent block content'
            },
            children: [
              {
                id: 'child-block',
                type: 'text',
                properties: {
                  content: 'Child block content'
                }
              }
            ]
          }
        ]
      };
      
      const textContent = processor.extractTextContent(contentWithNesting);
      expect(textContent).toContain('Parent block content');
      expect(textContent).toContain('Child block content');
    });
  });

  describe('Summary Generation', () => {
    it('should generate summary within specified length', () => {
      const summary = processor.generateSummary(sampleContent, 100);
      
      expect(summary.length).toBeLessThanOrEqual(103); // Allow for "..." addition
      expect(summary).toContain('Test Page');
    });

    it('should return full content if shorter than max length', () => {
      const shortContent: ContentPage = {
        ...sampleContent,
        title: 'Short',
        description: 'Brief',
        blocks: []
      };
      
      const summary = processor.generateSummary(shortContent, 100);
      expect(summary).toBe('Short Brief');
    });

    it('should prefer sentence boundaries for truncation', () => {
      const summary = processor.generateSummary(sampleContent, 50);
      
      // Should try to end at a sentence boundary or add "..."
      expect(summary.endsWith('.') || summary.endsWith('...')).toBe(true);
    });
  });

  describe('Content Cloning', () => {
    it('should clone content with new IDs', () => {
      const cloned = processor.cloneContent(sampleContent, 'new-page-id');
      
      expect(cloned.id).toBe('new-page-id');
      expect(cloned.title).toBe(sampleContent.title);
      expect(cloned.blocks).toHaveLength(sampleContent.blocks.length);
      expect(cloned.publishedAt).toBeUndefined(); // Should reset publication date
      
      // All block IDs should be different
      cloned.blocks.forEach((clonedBlock, index) => {
        expect(clonedBlock.id).not.toBe(sampleContent.blocks[index].id);
        expect(clonedBlock.type).toBe(sampleContent.blocks[index].type);
      });
    });

    it('should generate new ID if not provided', () => {
      const cloned = processor.cloneContent(sampleContent);
      
      expect(cloned.id).not.toBe(sampleContent.id);
      expect(cloned.id.length).toBeGreaterThan(0);
    });

    it('should clone nested blocks with new IDs', () => {
      const contentWithNesting: ContentPage = {
        ...sampleContent,
        blocks: [
          {
            id: 'parent-1',
            type: 'text',
            properties: { content: 'Parent' },
            children: [
              {
                id: 'child-1',
                type: 'text',
                properties: { content: 'Child' }
              }
            ]
          }
        ]
      };
      
      const cloned = processor.cloneContent(contentWithNesting);
      
      expect(cloned.blocks[0].id).not.toBe('parent-1');
      expect(cloned.blocks[0].children![0].id).not.toBe('child-1');
      expect(cloned.blocks[0].children![0].properties.content).toBe('Child');
    });
  });
});
