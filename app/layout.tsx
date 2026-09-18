import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { siteUrl } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ShopWrk docs',
    template: '%s | ShopWrk docs',
  },
  description: 'Help for running your ShopWrk shop.',
  applicationName: 'ShopWrk docs',
  icons: {
    icon: [{ url: '/images/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/images/shopwrk-symbol-black.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#090909',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.className} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            enableSystem: false,
            forcedTheme: 'dark',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
