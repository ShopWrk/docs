import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute } from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(`{/*path}`, `${docsContentRoute}{/*path}/content.md`);
const { rewrite: rewriteSuffix } = rewritePath(
  `{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

const skip = [/^\/api(?:\/|$)/, /^\/og(?:\/|$)/, /^\/llms/, /^\/_next/, /^\/images\//];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (skip.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const suffix = rewriteSuffix(pathname);
  if (suffix) {
    return NextResponse.rewrite(new URL(suffix, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(pathname);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}
