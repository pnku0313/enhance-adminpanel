"use client";

import React from "react";
import { clsx } from "clsx";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      disabled,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary shadow-sm",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary shadow-sm",
      outline:
        "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent",
      ghost:
        "bg-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive shadow-sm",
      link:
        "text-primary underline-offset-4 hover:underline bg-transparent shadow-none",
      success:
        "bg-success text-success-foreground hover:bg-success/90 active:bg-success shadow-sm",
      warning:
        "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning shadow-sm",
    };

    const sizes = {
      xs: "h-7 px-2.5 text-xs gap-1",
      sm: "h-8 px-3 text-sm gap-1.5",
      default: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2",
      xl: "h-12 px-8 text-lg gap-2",
      icon: "h-10 w-10",
      "icon-sm": "h-8 w-8",
      "icon-lg": "h-12 w-12",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        className={clsx(baseClasses, variants[variant], sizes[size], widthClass, className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;