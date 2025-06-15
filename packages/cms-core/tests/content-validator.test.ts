import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ContentValidator,
  globalBlockRegistry,
  type ContentPage,
  type ValidationRules
} from '../src/index.js';

describe('ContentValidator', () => {
  let validator: ContentValidator;
  let sampleContent: ContentPage;

  beforeEach(() => {
    sampleContent = {
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
            content: 'Hello World!',
            format: 'heading-1'
          }
        },
        {
          id: 'block-2',
          type: 'callout',
          properties: {
            content: 'Important note',
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
  });

  describe('Basic Validation', () => {
    beforeEach(() => {
      validator = new ContentValidator(globalBlockRegistry);
    });

    it('should validate valid content', async () => {
      const result = await validator.validateContent(sampleContent);
      expect(result.valid).toBe(true);
      expect(result.pageErrors).toHaveLength(0);
    });

    it('should detect invalid blocks', async () => {
      const invalidContent = {
        ...sampleContent,
        blocks: [
          {
            id: 'invalid-block',
            type: 'text',
            properties: {
              content: '', // Invalid: too short
              format: 'invalid-format' // Invalid enum
            }
          }
        ]
      };

      const result = await validator.validateContent(invalidContent);
      expect(result.valid).toBe(false);
      
      const blockResult = result.blockResults.get('invalid-block');
      expect(blockResult?.valid).toBe(false);
      expect(blockResult?.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Rules', () => {
    it('should enforce maximum blocks per page', async () => {
      const rules: ValidationRules = {
        maxBlocksPerPage: 1
      };
      validator = new ContentValidator(globalBlockRegistry, rules);

      const result = await validator.validateContent(sampleContent); // Has 2 blocks
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => 
        e.message.includes('Too many blocks')
      )).toBe(true);
    });

    it('should enforce maximum nesting depth', async () => {
      const rules: ValidationRules = {
        maxNestingDepth: 1
      };
      validator = new ContentValidator(globalBlockRegistry, rules);

      const deeplyNestedContent: ContentPage = {
        ...sampleContent,
        blocks: [
          {
            id: 'level-1',
            type: 'text',
            properties: { content: 'Level 1' },
            children: [
              {
                id: 'level-2',
                type: 'text',
                properties: { content: 'Level 2' },
                children: [
                  {
                    id: 'level-3',
                    type: 'text',
                    properties: { content: 'Level 3' }
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = await validator.validateContent(deeplyNestedContent);
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => 
        e.message.includes('Nesting too deep')
      )).toBe(true);
    });

    it('should enforce required metadata fields', async () => {
      const rules: ValidationRules = {
        requiredMetadata: ['slug', 'category', 'author']
      };
      validator = new ContentValidator(globalBlockRegistry, rules);

      const result = await validator.validateContent(sampleContent);
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => 
        e.message.includes('Required metadata field missing: author')
      )).toBe(true);
    });

    it('should enforce allowed block types', async () => {
      const rules: ValidationRules = {
        allowedBlockTypes: ['text'] // Only allow text blocks
      };
      validator = new ContentValidator(globalBlockRegistry, rules);

      const result = await validator.validateContent(sampleContent); // Has callout block
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => 
        e.message.includes('Disallowed block types used: callout')
      )).toBe(true);
    });

    it('should run custom validators', async () => {
      const rules: ValidationRules = {
        customValidators: [
          async (content) => {
            if (content.title.includes('forbidden')) {
              return ['Title contains forbidden word'];
            }
            return [];
          }
        ]
      };
      validator = new ContentValidator(globalBlockRegistry, rules);

      const forbiddenContent = {
        ...sampleContent,
        title: 'This is a forbidden title'
      };

      const result = await validator.validateContent(forbiddenContent);
      expect(result.valid).toBe(false);
      expect(result.pageErrors.some(e => 
        e.message.includes('Title contains forbidden word')
      )).toBe(true);
    });
  });

  describe('Block Context Validation', () => {
    beforeEach(() => {
      const rules: ValidationRules = {
        maxNestingDepth: 2
      };
      validator = new ContentValidator(globalBlockRegistry, rules);
    });

    it('should validate block context correctly', async () => {
      const block = {
        id: 'test-block',
        type: 'text',
        properties: {
          content: 'Test content'
        }
      };

      const result = await validator.validateBlock(block, { depth: 1 });
      expect(result.valid).toBe(true);
    });

    it('should fail validation for deeply nested block', async () => {
      const block = {
        id: 'deep-block',
        type: 'text',
        properties: {
          content: 'Deep content'
        }
      };

      const result = await validator.validateBlock(block, { depth: 5 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => 
        e.message.includes('Block nested too deeply')
      )).toBe(true);
    });
  });

  describe('Migration Validation', () => {
    beforeEach(() => {
      validator = new ContentValidator(globalBlockRegistry);
    });

    it('should validate successful migration', async () => {
      const result = await validator.validateMigration(sampleContent, '2.0.0');
      expect(result.canMigrate).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect migration issues with unknown block types', async () => {
      const contentWithUnknownType = {
        ...sampleContent,
        blocks: [
          {
            id: 'unknown-block',
            type: 'unknown-type',
            properties: {}
          }
        ]
      };

      const result = await validator.validateMigration(contentWithUnknownType, '2.0.0');
      expect(result.canMigrate).toBe(false);
      expect(result.issues.some(issue => 
        issue.includes("Block type 'unknown-type' not found")
      )).toBe(true);
    });
  });

  describe('Content Sanitization', () => {
    beforeEach(() => {
      validator = new ContentValidator(globalBlockRegistry);
    });

    it('should sanitize potentially harmful content', () => {
      const maliciousContent: ContentPage = {
        ...sampleContent,
        title: 'Test <script>alert("xss")</script> Title',
        blocks: [
          {
            id: 'script-block',
            type: 'text',
            properties: {
              content: 'Hello <script>alert("xss")</script> World!',
              format: 'paragraph'
            }
          }
        ]
      };

      const sanitized = validator.sanitizeContent(maliciousContent);
      
      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.blocks[0].properties.content).not.toContain('<script>');
      expect(sanitized.title).toBe('Test  Title');
      expect(sanitized.blocks[0].properties.content).toBe('Hello  World!');
    });

    it('should remove javascript: URLs', () => {
      const maliciousContent: ContentPage = {
        ...sampleContent,
        title: 'javascript:alert("xss")Test Title',
        description: 'javascript:void(0)Description'
      };

      const sanitized = validator.sanitizeContent(maliciousContent);
      
      expect(sanitized.title).not.toContain('javascript:');
      expect(sanitized.description).not.toContain('javascript:');
    });

    it('should remove unknown properties from block properties', () => {
      const contentWithExtraProps: ContentPage = {
        ...sampleContent,
        blocks: [
          {
            id: 'extra-props-block',
            type: 'text',
            properties: {
              content: 'Valid content',
              format: 'paragraph',
              unknownProp: 'This should be removed',
              anotherUnknown: { nested: 'object' }
            }
          }
        ]
      };

      const sanitized = validator.sanitizeContent(contentWithExtraProps);
      const sanitizedBlock = sanitized.blocks[0];
      
      expect(sanitizedBlock.properties.content).toBe('Valid content');
      expect(sanitizedBlock.properties.format).toBe('paragraph');
      expect('unknownProp' in sanitizedBlock.properties).toBe(false);
      expect('anotherUnknown' in sanitizedBlock.properties).toBe(false);
    });
  });
});
