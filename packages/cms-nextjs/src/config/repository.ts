// Configuration for different repository types and documentation structures

export interface RepositoryConfig {
  type: 'monorepo' | 'standard';
  documentationPath: string;
  quickAccessFiles: QuickAccessFile[];
  packagePaths?: string[]; // For monorepos with multiple packages
}

export interface QuickAccessFile {
  name: string;
  path: string;
  description: string;
  category?: string;
}

// Monorepo configuration (like voidhaus/voidhaus)
export const monorepoConfig: RepositoryConfig = {
  type: 'monorepo',
  documentationPath: 'apps/web/docs',
  packagePaths: ['packages/monoschema', 'packages/rpc', 'packages/cms-core', 'packages/cms-git'],
  quickAccessFiles: [
    {
      name: 'Main README',
      path: 'README.md',
      description: 'Project overview',
      category: 'root'
    },
    {
      name: 'Documentation Hub',
      path: 'apps/web/docs/index.md',
      description: 'Main documentation entry',
      category: 'docs'
    },
    {
      name: 'MonoSchema Guide',
      path: 'apps/web/docs/packages/monoschema/index.md',
      description: 'MonoSchema documentation',
      category: 'packages'
    },
    {
      name: 'RPC Guide',
      path: 'apps/web/docs/packages/rpc/index.md',
      description: 'RPC documentation',
      category: 'packages'
    },
    {
      name: 'CMS Guide',
      path: 'apps/web/docs/packages/cms/index.md',
      description: 'CMS documentation',
      category: 'packages'
    },
    {
      name: 'Getting Started',
      path: 'apps/web/docs/getting-started/index.md',
      description: 'Quick start guide',
      category: 'docs'
    },
    {
      name: 'API Reference',
      path: 'apps/web/docs/api/index.md',
      description: 'Complete API docs',
      category: 'docs'
    },
    {
      name: 'Contributing',
      path: 'apps/web/docs/guides/contributing.md',
      description: 'Contribution guide',
      category: 'docs'
    }
  ]
};

// Standard repository configuration (like voidhaus/docs)
export const standardRepoConfig: RepositoryConfig = {
  type: 'standard',
  documentationPath: 'docs',
  quickAccessFiles: [
    {
      name: 'README',
      path: 'README.md',
      description: 'Main documentation',
      category: 'root'
    },
    {
      name: 'Getting Started',
      path: 'docs/getting-started.md',
      description: 'Introduction guide',
      category: 'docs'
    },
    {
      name: 'API Reference',
      path: 'docs/api/index.md',
      description: 'API documentation',
      category: 'docs'
    },
    {
      name: 'Examples',
      path: 'docs/examples/index.md',
      description: 'Code examples',
      category: 'docs'
    },
    {
      name: 'Contributing',
      path: 'docs/contributing.md',
      description: 'How to contribute',
      category: 'docs'
    }
  ]
};

// Auto-detect repository type based on environment or repository structure
export function getRepositoryConfig(): RepositoryConfig {
  // Check environment variable first
  const repoType = process.env.CMS_REPOSITORY_TYPE as 'monorepo' | 'standard';
  
  if (repoType === 'monorepo') {
    return monorepoConfig;
  } else if (repoType === 'standard') {
    return standardRepoConfig;
  }
  
  // Auto-detection logic could go here
  // For now, default to monorepo since we're in voidhaus/voidhaus
  return monorepoConfig;
}

// Helper to get quick access files by category
export function getQuickAccessFilesByCategory(config: RepositoryConfig) {
  const categories: Record<string, QuickAccessFile[]> = {};
  
  config.quickAccessFiles.forEach(file => {
    const category = file.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(file);
  });
  
  return categories;
}
