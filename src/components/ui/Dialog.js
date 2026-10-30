"use client";

import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import Button from "./Button";
import { createPortal } from "react-dom";

const Dialog = ({ children, open, onOpenChange, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const portalRoot = mountedRef.current ? document.body : null;

  const renderContent = () => {
    if (!isOpen) return null;

    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          isOpen,
          onOpenChange: handleOpenChange,
        });
      }
      return child;
    });
  };

  if (!portalRoot) {
    return <>{renderContent()}</>;
  }

  return createPortal(<>{renderContent()}</>, portalRoot);
};

const DialogTrigger = ({ children, isOpen, onOpenChange }) => {
  return React.cloneElement(children, {
    onClick: () => onOpenChange && onOpenChange(true),
  });
};

const DialogContent = ({
  className,
  children,
  isOpen,
  onOpenChange,
  size = "default",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  ...props
}) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeOnEscape, onOpenChange]);

  const sizes = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? () => onOpenChange?.(false) : undefined}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={clsx(
          "relative z-50 w-full animate-zoom-in",
          "rounded-2xl border border-border bg-background shadow-2xl",
          sizes[size],
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-4 top-4 rounded-lg hover:bg-muted/50"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

const DialogHeader = ({ className, ...props }) => (
  <div
    className={clsx("flex flex-col space-y-1.5 text-center sm:text-left p-6", className)}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={clsx("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={clsx("text-sm text-muted-foreground", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={clsx(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-border",
      className
    )}
    {...props}
  />
);

const DialogClose = ({ className, ...props }) => (
  <Button variant="ghost" size="icon-sm" className={clsx("absolute right-4 top-4", className)} {...props}>
    <X className="h-4 w-4" />
  </Button>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};