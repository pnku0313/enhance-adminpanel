"use client";

import React from "react";
import { clsx } from "clsx";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const Alert = React.forwardRef(
  ({
    className,
    variant = "default",
    title,
    description,
    children,
    dismissible = false,
    onDismiss,
    action,
    icon: customIcon,
    ...props
  }, ref) => {
    const variants = {
      default: "bg-muted text-muted-foreground border-border",
      destructive: "bg-destructive/10 text-destructive border-destructive/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      info: "bg-info/10 text-info border-info/20",
    };

    const icons = {
      default: <AlertCircle className="h-4 w-4" />,
      destructive: <AlertCircle className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    const Icon = customIcon || icons[variant] || icons.default;

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          "relative w-full rounded-lg border p-4",
          "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
          "[&>div]:pl-10",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon aria-hidden="true" />
        <div className="grid gap-1">
          {title && (
            <h5 className="text-sm font-medium leading-none">
              {title}
            </h5>
          )}
          {description && (
            <p className="text-sm leading-normal opacity-90">
              {description}
            </p>
          )}
          {children && (
            <div className="text-sm leading-normal">
              {children}
            </div>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={clsx(
              "absolute right-4 top-4 rounded-md p-1 text-current",
              "opacity-50 hover:opacity-100",
              "transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={clsx("text-sm font-medium leading-none", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={clsx("text-sm leading-normal opacity-90", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

const AlertAction = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("mt-3", className)} {...props} />
));
AlertAction.displayName = "AlertAction";

export { Alert, AlertTitle, AlertDescription, AlertAction };