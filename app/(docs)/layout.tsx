import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { MessageCircleIcon } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger position="float" className="sw-ai-trigger">
          <MessageCircleIcon />
          Ask AI
        </AISearchTrigger>
      </AISearch>
      {children}
    </DocsLayout>
  );
}
