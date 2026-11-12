'use client';

import React, { useEffect, useRef } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy?: string;
  ariaLabel?: string;
  maxWidthClass?: string;
  panelClassName?: string;
  maxHeightClass?: string;
  showMobileHandle?: boolean;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  labelledBy,
  ariaLabel,
  maxWidthClass = 'max-w-lg',
  panelClassName = '',
  maxHeightClass = 'max-h-[92dvh] sm:max-h-[90dvh]',
  showMobileHandle = true,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOnBackdropRef = useRef(false);
  const closingFromPropRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.setAttribute('closedby', 'any');
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Ignore if already open in edge lifecycle states
        }
      }
    } else if (dialog.open) {
      closingFromPropRef.current = true;
      dialog.close();
      closingFromPropRef.current = false;
    }

    return () => {
      if (dialog.open) {
        closingFromPropRef.current = true;
        dialog.close();
        closingFromPropRef.current = false;
      }
    };
  }, [isOpen]);

  const handleNativeClose = () => {
    if (!closingFromPropRef.current && isOpen) {
      onClose();
    }
  };

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    pointerDownOnBackdropRef.current = e.target === dialogRef.current;
  };

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (pointerDownOnBackdropRef.current && e.target === dialogRef.current) {
      onClose();
    }
    pointerDownOnBackdropRef.current = false;
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      onClose={handleNativeClose}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className="modal-dialog hidden open:flex items-end sm:items-center justify-center p-0 sm:p-4 sm:px-[max(1rem,env(safe-area-inset-left,0px))] m-0 w-dvw h-dvh bg-transparent border-0 text-inherit overflow-hidden animate-fade-in print:block print:w-auto print:h-auto print:p-0 print:overflow-visible"
    >
      <div
        className={`relative w-full ${maxWidthClass} ${maxHeightClass} flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0 animate-slide-up print:max-h-none print:h-auto print:rounded-none print:border-none print:bg-white print:text-black print:shadow-none print:overflow-visible ${panelClassName}`}
      >
        {showMobileHandle && (
          <div
            aria-hidden="true"
            className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0 print:hidden"
          />
        )}
        {children}
      </div>
    </dialog>
  );
};
