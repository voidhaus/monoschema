'use client';

import { ContentEditor } from '@voidhaus/cms-nextjs/client';

// Prevent static generation for admin pages
export const dynamic = 'force-dynamic';

export default function NewContentEditor() {
  return (
    <ContentEditor
      basePath="/admin"
      statusEndpoint="/api/cms/status"
      contentEndpoint="/api/cms/content"
      publishEndpoint="/api/cms/publish"
    />
  );
}
