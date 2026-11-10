import { type ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-dash-ink-500">{icon}</div>}
      <p className="font-dash-display text-xl tracking-wide text-dash-ink-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-dash-ink-400">{description}</p>}
    </div>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="animate-spin rounded-full border-2 border-dash-ink-700 border-t-dash-red-500"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
