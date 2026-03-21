import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
};

export const Modal = ({ isOpen, onClose, children, size = 'lg' }: ModalProps) => {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", onKeyDown);
            // Disable body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            // Re-enable body scroll when modal closes
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        full: 'max-w-full m-4',
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-1 sm:p-4 z-50 overflow-y-auto overscroll-contain"
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
            style={{ touchAction: 'pan-y' }}
        >
            <div
                className={`relative w-full ${sizeClasses[size]} min-h-0 max-h-none sm:max-h-[95vh] rounded-lg bg-white dark:bg-gray-900 shadow-lg my-1 sm:my-0`}
                role="document"
            >

                {children}
            </div>
        </div>,
        document.body
    );
};
