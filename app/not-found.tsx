import { source } from '@/lib/source';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import Link from 'next/link';

export default function NotFound() {
  const first = source.getPages()[0];

  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-24">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-fd-muted-foreground">
          That page is not in the ShopWrk docs. Try search, or start from the overview.
        </p>
        <Link href={first?.url ?? '/introduction'} className="text-fd-primary font-medium underline">
          Back to docs
        </Link>
      </div>
    </HomeLayout>
  );
}
