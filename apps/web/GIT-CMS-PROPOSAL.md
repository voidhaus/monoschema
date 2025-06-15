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
- ContentProcessor: Parse and transform content
- PreviewGenerator: Generate preview content
- AuthProvider: GitHub OAuth integration
- PermissionManager: Organization-based access control
```

### 2. `@voidhaus/cms-blocks`
Block-based content system with extensible architecture.

```typescript
// Built-in Blocks:
- TextBlock: Rich text editing
- ImageBlock: Image with caption and alt text
- CodeBlock: Syntax-highlighted code snippets
- CalloutBlock: Warning, info, success callouts
- LinkBlock: Internal and external links
- VideoBlock: Embedded videos
- TableBlock: Data tables
- CustomBlock: Developer-defined blocks
```

### 3. `@voidhaus/cms-editor`
React-based visual editor components.

```typescript
// Components:
- BlockEditor: Drag-and-drop block interface
- PropertyPanel: Block settings and configuration
- PreviewPane: Live content preview
- PublishingPanel: Git workflow interface
- MediaLibrary: Asset management
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
1. **Content Parsing & Processing**
   - Markdown file parsing
   - Frontmatter extraction
   - Content structure analysis
   - File system operations

2. **Basic Editor Interface**
   - File browser
   - Text editor with markdown support
   - Save/discard functionality
   - Branch switching

3. **Preview System**
   - Temporary content rendering
   - Side-by-side preview
   - Live update functionality

### Phase 3: Block System (Weeks 5-6)
1. **Block Architecture**
   - Block type definitions
   - Block registry system
   - Serialization/deserialization
   - Block validation

2. **Core Blocks Implementation**
   - Text blocks with rich formatting
   - Image blocks with upload
   - Code blocks with syntax highlighting
   - Basic layout blocks

3. **Visual Editor**
   - Drag-and-drop interface
   - Block property panels
   - Block insertion/deletion
   - Block reordering

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
  type: string;
  properties: Record<string, any>;
  children?: ContentBlock[];
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
│   │   │   ├── parser.ts
│   │   │   └── serializer.ts
│   │   └── index.ts
│   └── package.json
├── cms-blocks/
│   ├── src/
│   │   ├── registry.ts
│   │   ├── base-block.ts
│   │   ├── blocks/
│   │   │   ├── text-block.ts
│   │   │   ├── image-block.ts
│   │   │   ├── code-block.ts
│   │   │   └── index.ts
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
  
  // Storage (optional)
  UPLOAD_STORAGE_PATH?: string; // For media files
  REDIS_URL?: string; // For session storage
}
```

## Integration Points

### Existing Packages Integration
- **MonoSchema**: Use for content validation and type safety
- **RPC**: Backend communication between web app and CMS service
- **Existing CMS Types**: Extend current type definitions

### Next.js Integration
- **Middleware**: Authentication checks for admin routes
- **API Routes**: CMS operations and GitHub webhook handlers
- **Dynamic Routes**: Content rendering from Git-stored markdown
- **Static Generation**: Build-time content processing

## Benefits

### For Developers
- **Version Control**: Full Git history for all content changes
- **Code-like Workflow**: Familiar Git workflow for content management
- **Type Safety**: TypeScript throughout the stack
- **Extensibility**: Plugin architecture for custom blocks and features

### For Content Editors
- **Visual Interface**: No need to write markdown or code
- **Live Preview**: See changes immediately
- **Collaborative**: Multiple editors can work simultaneously
- **Familiar**: Similar to other modern CMS interfaces

### For Organizations
- **Security**: Organization-based access control
- **Compliance**: Full audit trail through Git history
- **Scalability**: Can be deployed across multiple projects
- **Cost Effective**: Uses existing GitHub infrastructure

## Next Steps

1. **Technical Validation**: Prototype core Git operations and GitHub integration
2. **UI/UX Design**: Create mockups for the admin interface
3. **Package Setup**: Initialize the new package structure
4. **Authentication Implementation**: Build GitHub OAuth flow
5. **MVP Development**: Start with basic content editing functionality

## Success Metrics

- **Editor Adoption**: Number of organization members using the CMS
- **Content Velocity**: Time from content creation to publication
- **Error Reduction**: Decrease in content-related deployment issues
- **Developer Satisfaction**: Ease of adding new block types and features

---

*This proposal provides a comprehensive roadmap for implementing a Git-based CMS that meets the specific needs of the Voidhaus documentation site while maintaining flexibility for future projects.*