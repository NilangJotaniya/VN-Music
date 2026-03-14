// src/context/ToastContext.jsx — Global Toast Notification System
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={16} className="text-green-400" />,
  error:   <XCircle    size={16} className="text-red-400"   />,
  info:    <Info       size={16} className="text-blue-400"  />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const recentToastRef = useRef(new Map());

  const toast = useCallback((message, type = 'success', duration = 3000) => {
    const key = `${type}:${message}`;
    const now = Date.now();
    const lastShownAt = recentToastRef.current.get(key) || 0;
    if (now - lastShownAt < 2200) return;
    recentToastRef.current.set(key, now);

    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl glass-elevated min-w-[220px] max-w-xs shadow-2xl"
            >
              {ICONS[t.type]}
              <p className="text-sm text-vn-text flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-vn-muted hover:text-vn-text transition-colors"
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
