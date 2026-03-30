import { useState, createContext, useContext, useCallback } from 'react';
import { IconAlertCircle, IconAlertTriangle, IconCheckCircle, IconInfo, IconX } from './icons/Icons';
import './Toast.css';

const toastTypeIcon = {
  success: IconCheckCircle,
  error: IconAlertCircle,
  warning: IconAlertTriangle,
  info: IconInfo,
};

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(String(msg ?? ''), 'success'), [addToast]);
  const error = useCallback((msg) => addToast(String(msg ?? 'Đã có lỗi xảy ra.'), 'error'), [addToast]);
  const info = useCallback((msg) => addToast(String(msg ?? ''), 'info'), [addToast]);
  const warning = useCallback((msg) => addToast(String(msg ?? ''), 'warning'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  const TypeIcon = toastTypeIcon[toast.type] ?? IconInfo;

  return (
    <div className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : ''}`}>
      <span className="toast-type-icon" aria-hidden>
        <TypeIcon size={18} />
      </span>
      <span className="toast-message">{toast.message}</span>
      <button type="button" className="toast-close" onClick={handleClose} aria-label="Đóng">
        <IconX size={18} />
      </button>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được dùng bên trong ToastProvider');
  }
  return context;
}
