"use client";

import React, { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = React.createContext(null);

const toastDefaults = {
  duration: 5000,
  position: "top-right",
  dismissible: true,
  pauseOnHover: true,
  closeOnClick: true,
};

let toastId = 0;
const generateId = () => `toast-${++toastId}`;

let globalToastHandler = null;

const toast = (options) => {
  if (typeof options === "string") {
    options = { message: options };
  }

  if (globalToastHandler) {
    return globalToastHandler(options);
  }

  console.warn(
    "ToastProvider is not mounted. Toast notification was not displayed."
  );

  return null;
};

toast.success = (message, options = {}) =>
  toast({ ...options, type: "success", message });

toast.error = (message, options = {}) =>
  toast({ ...options, type: "error", message });

toast.warning = (message, options = {}) =>
  toast({ ...options, type: "warning", message });

toast.info = (message, options = {}) =>
  toast({ ...options, type: "info", message });

const ToastProvider = ({ children, ...defaultOptions }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((options) => {
    const id = generateId();
    const newToast = {
      id,
      ...toastDefaults,
      ...defaultOptions,
      ...options,
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, [defaultOptions]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const update = useCallback((id, options) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...options } : t))
    );
  }, []);

  const success = useCallback((message, options) => {
    return toast({ ...options, type: "success", message });
  }, [toast]);

  const error = useCallback((message, options) => {
    return toast({ ...options, type: "error", message });
  }, [toast]);

  const warning = useCallback((message, options) => {
    return toast({ ...options, type: "warning", message });
  }, [toast]);

  const info = useCallback((message, options) => {
    return toast({ ...options, type: "info", message });
  }, [toast]);

  const loading = useCallback((message, options) => {
    return toast({ ...options, type: "loading", message, duration: Infinity });
  }, [toast]);

  const promise = useCallback((promise, messages) => {
    const id = loading(messages.loading);
    promise
      .then(() => {
        update(id, { type: "success", message: messages.success, duration: toastDefaults.duration });
      })
      .catch(() => {
        update(id, { type: "error", message: messages.error, duration: toastDefaults.duration });
      });
    return id;
  }, [loading, update]);

  const value = { toast, dismiss, dismissAll, update, success, error, warning, info, loading, promise };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={defaultOptions.position || "top-right"} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onDismiss, position }) => {
  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={clsx(
        "fixed z-[800] flex flex-col gap-2 pointer-events-none",
        positions[position] || positions["top-right"]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const types = {
    success: { icon: CheckCircle, className: "text-success border-success/20 bg-success/10" },
    error: { icon: AlertCircle, className: "text-destructive border-destructive/20 bg-destructive/10" },
    warning: { icon: AlertTriangle, className: "text-warning border-warning/20 bg-warning/10" },
    info: { icon: Info, className: "text-info border-info/20 bg-info/10" },
    loading: { icon: AlertCircle, className: "text-info border-info/20 bg-info/10" },
    default: { icon: Info, className: "text-foreground border-border bg-card" },
  };

  const { icon: Icon, className: typeClass } = types[toast.type] || types.default;

  useEffect(() => {
    if (toast.duration === Infinity) return;

    const startTime = Date.now();
    const duration = toast.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, toast.id, onDismiss]);

  const handleMouseEnter = () => {
    if (toast.pauseOnHover) {
      // Pause progress by not updating
    }
  };

  const handleMouseLeave = () => {
    if (toast.pauseOnHover) {
      // Resume progress
    }
  };

  const handleClick = () => {
    if (toast.closeOnClick) {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }
    toast.onClick?.();
  };

  if (!toast.message && !toast.title && !toast.description) return null;

  return (
    <div
      className={clsx(
        "relative pointer-events-auto flex items-start gap-3 w-full max-w-sm",
        "rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-right-full duration-300",
        isExiting && "animate-out slide-out-to-right-full duration-200",
        typeClass
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-medium text-foreground">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm text-muted-foreground mt-0.5">{toast.description}</div>
        )}
        {toast.message && !toast.title && !toast.description && (
          <div className="text-sm text-foreground">{toast.message}</div>
        )}
        {toast.action && (
          <div className="mt-3">
            {toast.action}
          </div>
        )}
      </div>
      {toast.dismissible && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 200);
          }}
          className={clsx(
            "flex-shrink-0 p-1 rounded-md",
            "text-muted-foreground hover:text-foreground",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {toast.duration !== Infinity && (
        <div
          className="absolute bottom-0 left-0 h-1 rounded-bl-lg rounded-br-lg bg-current/20"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
};

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export { ToastProvider, ToastContainer, useToast, toast };