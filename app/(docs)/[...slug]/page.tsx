import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig, siteUrl } from '@/lib/shared';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams().filter((item) => item.slug.length > 0);
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const keywords = page.data.keywords;
  const image = getPageImageUrl(page).url;

  return {
    title: page.data.title,
    description: page.data.description,
    keywords: Array.isArray(keywords) ? keywords : keywords ? [keywords] : undefined,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: new URL(page.url, siteUrl).toString(),
      siteName: 'ShopWrk docs',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [image],
    },
  };
}
