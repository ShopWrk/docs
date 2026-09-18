import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/integrations/stripe-payments',
        destination: '/integrations/shopwrk-pay',
        permanent: true,
      },
      {
        source: '/settings/webhooks',
        destination: '/settings/billing',
        permanent: true,
      },
      {
        source: '/integrations/meta',
        destination: '/integrations/social-media',
        permanent: true,
      },
      {
        source: '/settings/sending-domain',
        destination: '/settings/email-domain',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
