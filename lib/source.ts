import { llms, loader, type LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { kebabToPascal } from './icons';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      sidebarTitle: z.string().optional(),
      keywords: z.union([z.string(), z.array(z.string())]).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const normalizeIconsPlugin: LoaderPlugin = {
  name: 'normalize-icons',
  enforce: 'pre',
  transformStorage({ storage }) {
    for (const path of storage.getFiles()) {
      const file = storage.read(path);
      if (!file || !('data' in file) || !file.data) continue;
      const data = file.data as { icon?: string };
      if (typeof data.icon === 'string') {
        data.icon = kebabToPascal(data.icon);
      }
    }
  },
};

const sidebarTitlePlugin: LoaderPlugin = {
  name: 'sidebar-title',
  transformPageTree: {
    file(node, filePath) {
      if (!filePath) return node;
      const file = this.storage.read(filePath);
      const sidebarTitle = (file as { data?: { sidebarTitle?: string } } | undefined)?.data
        ?.sidebarTitle;
      if (sidebarTitle) node.name = sidebarTitle;
      return node;
    },
  },
};

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [normalizeIconsPlugin, lucideIconsPlugin(), sidebarTitlePlugin],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
