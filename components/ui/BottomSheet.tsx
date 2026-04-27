'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useDragControls,
  type PanInfo,
} from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noDrag?: boolean;
  showClose?: boolean;
  ariaLabel?: string;
}

const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;
const SHEET_SPRING = { type: 'spring' as const, damping: 32, stiffness: 320 };

export function BottomSheet({
  onClose,
  title,
  children,
  footer,
  noDrag = false,
  showClose = true,
  ariaLabel,
}: BottomSheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const original = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.width = original.width;
      body.style.overflow = original.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        className="relative w-full sm:max-w-lg bg-[#16161b] rounded-t-3xl shadow-2xl border-t border-x border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden pointer-events-auto"
        style={{ maxHeight: '92dvh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SHEET_SPRING}
        drag={noDrag ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        {!noDrag && (
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none select-none"
            aria-hidden
          >
            <div className="h-1 w-10 rounded-full bg-[rgba(255,255,255,0.18)]" />
          </div>
        )}

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 pt-1 pb-3 gap-3">
            {title && (
              <h2 className="font-title text-lg text-foreground leading-tight truncate">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto h-10 w-10 -mr-2 flex-shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.1)] transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex-shrink-0 border-t border-[rgba(255,255,255,0.06)] px-5 pt-3 bg-[#16161b]"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
