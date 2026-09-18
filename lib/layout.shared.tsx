import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { gitConfig } from './shared';

function Logo() {
  return (
    <>
      <Image
        src="/images/shopwrk-lockup-horizontal-black.svg"
        alt="ShopWrk"
        width={500}
        height={110}
        className="h-6 w-auto dark:hidden"
        priority
      />
      <Image
        src="/images/shopwrk-lockup-horizontal-white.svg"
        alt="ShopWrk"
        width={500}
        height={110}
        className="h-6 w-auto hidden dark:block"
        priority
      />
    </>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: 'https://shopwrk.com',
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    themeSwitch: {
      enabled: true,
      mode: 'light-dark-system',
    },
    links: [
      {
        type: 'button',
        text: 'Sign in',
        url: 'https://app.shopwrk.com',
        external: true,
      },
    ],
  };
}
