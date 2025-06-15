// Client-side only exports for browser environments
export * from './components/schema-editor/index.js';

// Re-export only the types from cms-core to avoid importing server-side code
export type { 
  ContentPage, 
  ContentBlock, 
  BlockTypeDefinition 
} from '@voidhaus/cms-core';
