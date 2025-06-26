import React from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  isConfirming?: boolean;
  confirmButtonClass?: string;
  isForm?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  show,
  onClose,
  title,
  description,
  icon,
  confirmText = 'Confirmer',
  onConfirm,
  isConfirming,
  confirmButtonClass = '',
  isForm = false,
  children,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor"><path d="M6 6l8 8M6 14L14 6" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        {title && <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>}
        {description && <p className="text-gray-600 text-center mb-4">{description}</p>}
        {children}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
            disabled={isConfirming}
            type={isForm ? 'button' : 'button'}
          >
            Annuler
          </button>
          {onConfirm && (
            <button
              className={`px-4 py-2 rounded ${confirmButtonClass}`}
              onClick={onConfirm}
              disabled={isConfirming}
              type={isForm ? 'submit' : 'button'}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;