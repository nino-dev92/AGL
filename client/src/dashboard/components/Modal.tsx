import { type ReactNode, useEffect } from 'react';
import { LuX as X } from 'react-icons/lu';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-dash-fade-in">
      <div className="absolute inset-0 bg-dash-ink-950/80 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg card animate-dash-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-dash-ink-700/60 px-5 py-4">
          <div>
            <h3 className="font-dash-display text-2xl tracking-wide text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-dash-ink-300">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-dash-ink-700/60 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
