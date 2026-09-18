import type { ComponentProps } from 'react';

type CapEmbedProps = {
  src: string;
  title?: string;
} & Omit<ComponentProps<'iframe'>, 'src' | 'title'>;

function toEmbedUrl(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname === 'cap.so' && !url.pathname.startsWith('/embed/')) {
      const id = url.pathname.replace(/^\/(?:s\/)?/, '');
      url.pathname = `/embed/${id}`;
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}

export function CapEmbed({ src, title = 'ShopWrk video', className, ...props }: CapEmbedProps) {
  return (
    <figure className="my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--sw-border)] bg-[var(--sw-card)]">
        <iframe
          src={toEmbedUrl(src)}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className={['absolute inset-0 h-full w-full', className].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
    </figure>
  );
}
