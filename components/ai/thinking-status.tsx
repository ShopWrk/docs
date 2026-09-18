'use client';

import { ThinkingOrb, type OrbState } from 'thinking-orbs';

export function ThinkingStatus({
  state = 'composing',
  label,
}: {
  state?: OrbState;
  label: string;
}) {
  return (
    <div className="sw-ai-thinking" role="status" aria-label={label}>
      <ThinkingOrb
        state={state}
        size={64}
        theme="auto"
        aria-hidden="true"
        style={{ width: 28, height: 28 }}
      />
      <span className="sw-ai-thinking-label">{label}</span>
    </div>
  );
}
