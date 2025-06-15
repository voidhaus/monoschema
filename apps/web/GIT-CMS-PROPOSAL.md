# Git-Based CMS Proposal

## Overview

This proposal outlines the design and implementation of a Git-based Content Management System (CMS) for the Voidhaus documentation website. The system will provide a secure, version-controlled approach to content management using GitHub as both authentication provider and storage backend.

## Core Requirements

### Authentication & Authorization
- **GitHub OAuth Integration**: Users must authenticate via GitHub OAuth
- **Organization-based Access Control**: Only members of the repository's organization can access the CMS
- **Role-based Permissions**: Different permission levels for editors, admins, and reviewers

### Content Management
- **Documentation Focus**: Primary target is the `/docs` route content
- **Visual Editor**: GUI-based content editing with WYSIWYG capabilities
- **Custom Block System**: Extensible block-based content architecture
- **Live Preview**: Real-time preview of content changes

### Git Integration
- **Branch-based Workflow**: Content changes are made on feature branches
- **Version Control**: Full Git history for all content changes
- **Publication Workflow**: Merge to main branch for publishing
- **Conflict Resolution**: Handle merge conflicts gracefully

### Reusability
- **Package Architecture**: Core CMS functionality as reusable packages
- **Framework Agnostic**: Designed to work with multiple Next.js projects
- **Plugin System**: Extensible architecture for custom functionality

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Public Site     │     CMS Admin Interface                  │
│  - Docs Renderer │     - Visual Editor                      │
│  - Auth Pages    │     - Content Management                 │
│                  │     - Preview System                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   CMS Backend (Node.js)                    │
├─────────────────────────────────────────────────────────────┤
│  - GitHub API Integration                                   │
│  - Git Operations (clone, branch, commit, push)           │
│  - Content Processing                                      │
│  - Preview Generation                                      │
│  - Authentication Middleware                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Git Repository (GitHub)    │    Temporary Storage          │
│  - Main Branch (published)  │    - Draft Content            │
│  - Feature Branches        │    - Media Files              │
│  - Content History         │    - Cache                    │
└─────────────────────────────────────────────────────────────┘
```

## Package Structure

### 1. `@voidhaus/cms-core`
Core CMS functionality that can be reused across projects.

```typescript
// Features:
- GitOperations: Clone, branch, commit, push operations
- ContentProcessor: Schema-based content processing and validation
- PreviewGenerator: Generate preview content from structured blocks
- AuthProvider: GitHub OAuth integration
- PermissionManager: Organization-based access control
- SchemaRegistry: MonoSchema block type management
- ContentValidator: Type-safe content validation using MonoSchema
```

### 2. `@voidhaus/cms-blocks`
MonoSchema-based block system with extensible architecture.

```typescript
// Block System Architecture:
- BlockRegistry: Registry for MonoSchema-defined block types
- BlockValidator: Validation engine using MonoSchema
- BlockSerializer: Convert blocks to/from storage format
- BlockTypeFactory: Create new block types with MonoSchema schemas

// Built-in Block Types (defined with MonoSchema):
- TextBlock: Rich text with formatting options
- ImageBlock: Image with alt text, caption, and dimensions
- CodeBlock: Code snippets with syntax highlighting
- CalloutBlock: Warning, info, success, error callouts
- LinkBlock: Internal and external links with metadata
- VideoBlock: Embedded videos with player options
- TableBlock: Structured data tables
- LayoutBlock: Container blocks for organizing content
- CustomBlock: Developer-defined blocks with custom schemas
```

### 3. `@voidhaus/cms-editor`
React-based visual editor components with MonoSchema integration.

```typescript
// Components:
- BlockEditor: Drag-and-drop block interface with schema validation
- PropertyPanel: Auto-generated forms based on MonoSchema definitions
- PreviewPane: Live content preview with type safety
- PublishingPanel: Git workflow interface
- MediaLibrary: Asset management
- SchemaEditor: Visual editor for block type schemas
- BlockTypeSelector: UI for choosing and configuring block types
```

### 4. `@voidhaus/cms-git`
Git operations and GitHub integration.

```typescript
// Features:
- Repository cloning and management
- Branch creation and switching
- Commit and push operations
- Merge conflict detection
- GitHub API integration
- Organization membership validation
```

## Implementation Plan

### Phase 1: Core Infrastructure (Weeks 1-2)
1. **Authentication System**
   - GitHub OAuth integration
   - Organization membership validation
   - Session management
   - Protected routes

2. **Git Operations Backend**
   - Repository cloning service
   - Branch management
   - Basic commit/push functionality
   - GitHub API integration

3. **Basic Admin Interface**
   - Login/logout flow
   - Protected admin routes
   - Basic content listing

### Phase 2: Content Management (Weeks 3-4)
1. **MonoSchema Block System**
   - Block type schema definitions using MonoSchema
   - Block validation and type inference
   - Dynamic content structure validation
   - Schema-based content serialization/deserialization

2. **Content Processing Engine**
   - Block-based content parsing and processing
   - Schema validation for content blocks
   - Type-safe content transformation
   - Structured content file operations

3. **Basic Editor Interface**
   - Schema-driven content editor
   - Block type selection and configuration
   - Property panels based on MonoSchema definitions
   - Save/discard functionality with validation
   - Branch switching

4. **Preview System**
   - Schema-based content rendering
   - Type-safe preview generation
   - Live update functionality with validation
   - Block-level preview components

### Phase 3: Block System (Weeks 5-6)
1. **Advanced Block Architecture**
   - Custom block type creation with MonoSchema
   - Block composition and nesting
   - Schema inheritance and mixins
   - Block template system

2. **Enhanced Block Types**
   - Rich text blocks with advanced formatting
   - Image blocks with responsive handling
   - Interactive blocks (forms, surveys)
   - Data visualization blocks
   - Layout and container blocks

3. **Visual Editor Enhancement**
   - Schema-driven drag-and-drop interface
   - Auto-generated property panels from schemas
   - Real-time validation feedback
   - Block template library
   - Advanced block reordering and nesting

### Phase 4: Publishing Workflow (Weeks 7-8)
1. **Git Workflow Integration**
   - Feature branch creation
   - Commit message generation
   - Pull request creation
   - Merge conflict handling

2. **Content Publishing**
   - Review process
   - Approval workflow
   - Automated testing
   - Publication to main branch

3. **Advanced Features**
   - Content scheduling
   - Bulk operations
   - Media management
   - Search functionality

## MonoSchema Integration

### Block Type Schema Definition
Instead of relying on Markdown parsing, the CMS uses MonoSchema to define structured block types with full TypeScript type safety and runtime validation.

```typescript
// Example: Text Block Schema
const TextBlockSchema = {
  $type: Object,
  $properties: {
    content: {
      $type: String,
      $description: "The text content",
      $constraints: [minLength(1), maxLength(10000)]
    },
    format: {
      $type: TextFormatEnum, // Custom enum type
      $description: "Text formatting style",
      $optional: true
    },
    alignment: {
      $type: String,
      $description: "Text alignment",
      $constraints: [oneOf(['left', 'center', 'right', 'justify'])],
      $optional: true
    }
  }
} as const;

// Example: Image Block Schema
const ImageBlockSchema = {
  $type: Object,
  $properties: {
    src: {
      $type: String,
      $description: "Image source URL",
      $constraints: [url()]
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
      $optional: true,
      $constraints: [min(1), max(4000)]
    },
    height: {
      $type: Number,
      $description: "Image height in pixels", 
      $optional: true,
      $constraints: [min(1), max(4000)]
    }
  }
} as const;

// Block Type Registration
const blockTypeRegistry = new BlockTypeRegistry();
blockTypeRegistry.register({
  key: 'text',
  name: 'Text Block',
  description: 'Rich text content with formatting options',
  schema: TextBlockSchema,
  category: 'content',
  icon: 'text'
});

// Usage in Content
const pageContent: ContentPage = {
  id: 'doc-123',
  path: '/docs/getting-started.json',
  title: 'Getting Started',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      properties: {
        content: 'Welcome to our documentation!',
        format: 'heading-1',
        alignment: 'center'
      }
      // Properties are validated against TextBlockSchema at runtime
    }
  ],
  // ...other properties
};
```

### Benefits of MonoSchema Integration

1. **Type Safety**: Full TypeScript inference for block properties
2. **Runtime Validation**: Automatic validation of content structure
3. **Auto-generated Forms**: Property panels generated from schemas
4. **Extensibility**: Easy creation of custom block types
5. **Documentation**: Schema descriptions provide inline help
6. **Constraint Validation**: Built-in validation for data integrity
7. **Transform Support**: Pre/post-processing with MonoSchema transformers

## Technical Specifications

### Authentication Flow
```typescript
interface AuthFlow {
  1. User visits /admin
  2. Redirect to GitHub OAuth
  3. GitHub callback with code
  4. Exchange code for access token
  5. Fetch user and organization data
  6. Validate organization membership
  7. Create session and redirect to admin
}
```

### Content Structure
```typescript
interface ContentPage {
  id: string;
  path: string; // File path in repository
  title: string;
  description?: string;
  publishedAt?: Date;
  updatedAt: Date;
  author: {
    name: string;
    email: string;
    githubId: string;
  };
  blocks: ContentBlock[];
  metadata: {
    slug: string;
    tags: string[];
    category: string;
    featured: boolean;
  };
}

interface ContentBlock {
  id: string;
  type: string; // References a MonoSchema-defined block type
  properties: Record<string, any>; // Validated against the block type's schema
  children?: ContentBlock[];
  // Schema reference for validation
  schema?: MonoSchemaProperty;
}

// Block Type Definition (using MonoSchema)
interface BlockTypeDefinition {
  key: string; // Unique identifier for the block type
  name: string; // Human-readable name
  description?: string;
  schema: MonoSchemaProperty; // MonoSchema definition for validation
  category: string; // For organizing blocks in the editor
  icon?: string; // Icon for the block selector
  preview?: string; // Preview template
}
```

### Git Workflow
```typescript
interface GitWorkflow {
  1. Create feature branch: `cms/${userId}/${timestamp}`
  2. Make content changes
  3. Stage and commit changes
  4. Push to remote branch
  5. Create pull request (optional)
  6. Merge to main branch
  7. Deploy updated content
}
```

## Security Considerations

### Authentication Security
- **OAuth Token Management**: Secure storage and refresh of GitHub tokens
- **Session Security**: HTTPOnly cookies with CSRF protection
- **Permission Validation**: Server-side organization membership checks

### Content Security
- **Input Sanitization**: Sanitize all user-generated content
- **File Upload Security**: Validate file types and scan for malicious content
- **Git Security**: Sanitize commit messages and file paths

### API Security
- **Rate Limiting**: Prevent abuse of GitHub API calls
- **Request Validation**: Validate all API requests
- **Error Handling**: Secure error messages without sensitive information

## File Structure

```
packages/
├── cms-core/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── github-oauth.ts
│   │   │   ├── session-manager.ts
│   │   │   └── permissions.ts
│   │   ├── git/
│   │   │   ├── operations.ts
│   │   │   ├── github-api.ts
│   │   │   └── workflow.ts
│   │   ├── content/
│   │   │   ├── processor.ts
│   │   │   ├── validator.ts
│   │   │   └── serializer.ts
│   │   ├── schema/
│   │   │   ├── registry.ts
│   │   │   ├── block-types.ts
│   │   │   └── cms-plugin.ts
│   │   └── index.ts
│   └── package.json
├── cms-blocks/
│   ├── src/
│   │   ├── registry.ts
│   │   ├── base-block.ts
│   │   ├── schemas/
│   │   │   ├── text-block.schema.ts
│   │   │   ├── image-block.schema.ts
│   │   │   ├── code-block.schema.ts
│   │   │   ├── callout-block.schema.ts
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   ├── block-validator.ts
│   │   │   ├── content-validator.ts
│   │   │   └── schema-validator.ts
│   │   ├── serializers/
│   │   │   ├── block-serializer.ts
│   │   │   └── content-serializer.ts
│   │   └── index.ts
│   └── package.json
├── cms-editor/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlockEditor.tsx
│   │   │   ├── PreviewPane.tsx
│   │   │   ├── PropertyPanel.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useBlockEditor.ts
│   │   │   ├── usePreview.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
└── cms-git/
    ├── src/
    │   ├── repository.ts
    │   ├── branches.ts
    │   ├── commits.ts
    │   ├── github-integration.ts
    │   └── index.ts
    └── package.json

apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── login/
│   │   │   │   ├── editor/
│   │   │   │   └── preview/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── cms/
│   │   │   │   └── preview/
│   │   │   └── docs/ (existing)
│   │   └── components/
│   │       ├── cms/
│   │       │   ├── AdminLayout.tsx
│   │       │   ├── ContentEditor.tsx
│   │       │   └── index.ts
│   │       └── (existing components)
│   └── package.json
└── cms/ (existing CMS backend)
```

## Environment Configuration

```typescript
// Environment Variables Required
interface CMSConfig {
  // GitHub OAuth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_ORGANIZATION: string; // Organization to validate membership
  
  // Repository
  GITHUB_REPOSITORY: string; // Format: "owner/repo"
  GITHUB_TOKEN: string; // Personal access token for Git operations
  
  // Security
  SESSION_SECRET: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  
  // CMS Backend
  CMS_API_URL: string;
  
  // Schema Validation
  SCHEMA_VALIDATION_STRICT?: boolean; // Enable strict schema validation
  CUSTOM_BLOCK_TYPES_PATH?: string; // Path to custom block type definitions
  
  // Storage (optional)
  UPLOAD_STORAGE_PATH?: string; // For media files
  REDIS_URL?: string; // For session storage
  BLOCK_TYPE_CACHE_TTL?: number; // Cache TTL for block type schemas
}
```

## Integration Points

### Existing Packages Integration
- **MonoSchema**: Core validation system for all block types and content structure
- **MonoSchema Plugins**: Custom types and validators for CMS-specific needs
- **RPC**: Backend communication between web app and CMS service
- **Existing CMS Types**: Extend current type definitions with MonoSchema schemas

### MonoSchema CMS Plugin
A dedicated MonoSchema plugin providing CMS-specific types and validators:

```typescript
// CMS-specific MonoSchema types
const CMSPlugin: Plugin = {
  name: "CMSPlugin",
  description: "MonoSchema plugin for CMS block types",
  version: "1.0.0",
  types: [
    ContentKeyObject,      // References to other content
    BuildingBlockObject,   // Block type definitions
    MediaObject,          // Media file references
    LinkObject,           // Internal/external links
    // ... other CMS-specific types
  ],
  prevalidate: [
    // Content key validation
    // Media file existence checks
    // Link validation
  ]
};
```

### Next.js Integration
- **Middleware**: Authentication checks for admin routes
- **API Routes**: CMS operations with MonoSchema validation
- **Dynamic Routes**: Content rendering from schema-validated blocks
- **Static Generation**: Build-time content processing with type safety

## Benefits

### For Developers
- **Type Safety**: Full TypeScript inference for all content and block types
- **Schema-Driven Development**: Content structure defined by MonoSchema schemas
- **Validation at Every Layer**: Runtime validation from API to storage
- **Code-like Workflow**: Familiar Git workflow for content management
- **Extensibility**: Easy creation of custom block types with schemas
- **Auto-generated Interfaces**: Forms and editors generated from schemas

### For Content Editors
- **Visual Interface**: Schema-driven forms with validation feedback
- **Real-time Validation**: Immediate feedback on content structure
- **Type-safe Editing**: Impossible to create invalid content structure
- **Guided Experience**: Schema descriptions provide inline help
- **Collaborative**: Multiple editors can work simultaneously with merge conflict resolution
- **Familiar**: Similar to other modern CMS interfaces but with stronger structure

### For Organizations
- **Data Integrity**: MonoSchema ensures content structure consistency
- **Security**: Schema validation prevents malformed content injection
- **Compliance**: Full audit trail through Git history with typed changes
- **Scalability**: Schema-based approach scales across multiple projects
- **Cost Effective**: Uses existing GitHub infrastructure with enhanced validation
- **Future-proof**: MonoSchema evolution supports content migration

## Next Steps

1. **MonoSchema Block Type Definitions**: Define core block type schemas using MonoSchema
2. **Content Processing Engine**: Build schema-based content validation and processing
3. **Block Registry System**: Implement dynamic block type registration and management
4. **Schema-driven Editor Components**: Create property panels that auto-generate from schemas
5. **Content Migration Strategy**: Plan migration from existing content to schema-based structure

## Phase 2 Implementation Priority

### Week 1: MonoSchema Foundation
- Define core block type schemas (Text, Image, Code, Callout)
- Implement BlockTypeRegistry with MonoSchema integration
- Create ContentValidator using MonoSchema validation
- Build basic serialization/deserialization for schema-based content

### Week 2: Editor Integration
- Implement schema-driven property panels
- Create block type selector with schema metadata
- Build real-time validation feedback system
- Add schema-based content preview components

This updated approach leverages MonoSchema's powerful validation and type inference capabilities to create a more robust, type-safe content management system that provides better developer experience and content integrity.

## Success Metrics

- **Schema Adoption**: Number of custom block types created using MonoSchema
- **Content Validation**: Reduction in content structure errors and inconsistencies
- **Editor Adoption**: Number of organization members using the schema-driven CMS
- **Content Velocity**: Time from content creation to publication with validation
- **Error Reduction**: Decrease in content-related deployment issues
- **Developer Satisfaction**: Ease of adding new block types with MonoSchema schemas
- **Type Safety Coverage**: Percentage of content operations with full type inference

---

*This proposal provides a comprehensive roadmap for implementing a Git-based CMS that meets the specific needs of the Voidhaus documentation site while maintaining flexibility for future projects.*