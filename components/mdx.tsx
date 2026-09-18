import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Callout } from 'fumadocs-ui/components/callout';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { type ComponentProps, type ReactNode } from 'react';
import { getLucideIcon } from '@/lib/icons';
import { CapEmbed } from '@/components/cap-embed';
import { cn } from '@/lib/cn';

function MintlifyCard({
  icon,
  title,
  href,
  children,
  ...props
}: ComponentProps<typeof Card> & { icon?: ReactNode | string }) {
  const resolvedIcon = typeof icon === 'string' ? getLucideIcon(icon) : icon;
  return (
    <Card icon={resolvedIcon} title={title} href={href} {...props}>
      {children}
    </Card>
  );
}

function CardGroup({
  cols = 2,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { cols?: number }) {
  return (
    <Cards
      className={cn(cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3', className)}
      {...props}
    >
      {children}
    </Cards>
  );
}

function MintlifyStep({
  title,
  children,
  ...props
}: ComponentProps<typeof Step> & { title?: ReactNode }) {
  return (
    <Step {...props}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </Step>
  );
}

function MintlifyTab({
  title,
  value,
  children,
  ...props
}: ComponentProps<typeof Tab> & { title?: string }) {
  return (
    <Tab value={value ?? title} {...props}>
      {children}
    </Tab>
  );
}

function MintlifyCallout({
  type = 'info',
  title,
  children,
  ...props
}: ComponentProps<typeof Callout>) {
  return (
    <Callout type={type} title={title} {...props}>
      {children}
    </Callout>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />,
    Card: MintlifyCard,
    Cards,
    CardGroup,
    Callout: MintlifyCallout,
    Note: (props) => <MintlifyCallout type="info" {...props} />,
    Info: (props) => <MintlifyCallout type="info" {...props} />,
    Tip: (props) => <MintlifyCallout type="idea" {...props} />,
    Warning: (props) => <MintlifyCallout type="warn" {...props} />,
    Steps,
    Step: MintlifyStep,
    Tabs,
    Tab: MintlifyTab,
    Accordions,
    Accordion,
    AccordionGroup: Accordions,
    CapEmbed,
    Video: CapEmbed,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
