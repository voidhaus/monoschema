'use client';

import { ContentBrowser } from '@voidhaus/cms-nextjs/client';

// Prevent static generation for admin pages
export const dynamic = 'force-dynamic';

export default function NewContentBrowser() {
  return (
    <ContentBrowser
      basePath="/admin"
      statusEndpoint="/api/cms/status"
    />
  );
}
