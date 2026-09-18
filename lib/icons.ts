import { createElement, type ReactElement } from 'react';
import { icons } from 'lucide-react';

export function kebabToPascal(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function getLucideIcon(name?: string): ReactElement | undefined {
  if (!name) return;
  const direct = icons[name as keyof typeof icons];
  if (direct) return createElement(direct, { className: 'size-4' });

  const pascal = kebabToPascal(name);
  const Icon = icons[pascal as keyof typeof icons];
  if (!Icon) return;
  return createElement(Icon, { className: 'size-4' });
}
