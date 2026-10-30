"use client";

import React from "react";
import { clsx } from "clsx";

const Badge = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      dot = false,
      dotColor,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-primary/10 text-primary border-primary/20",
      secondary: "bg-secondary text-secondary-foreground border-secondary",
      destructive: "bg-destructive/10 text-destructive border-destructive/20",
      outline: "text-foreground border-border bg-transparent",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      info: "bg-info/10 text-info border-info/20",
      // Status-specific variants
      active: "bg-success/10 text-success border-success/20",
      inactive: "bg-muted text-muted-foreground border-border",
      pending: "bg-warning/10 text-warning border-warning/20",
      processing: "bg-info/10 text-info border-info/20",
      completed: "bg-success/10 text-success border-success/20",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20",
      draft: "bg-muted text-muted-foreground border-border",
      published: "bg-primary/10 text-primary border-primary/20",
      archived: "bg-neutral/10 text-neutral-600 dark:text-neutral-400 border-neutral/20",
    };

    const sizes = {
      xs: "px-1.5 py-0.5 text-[10px] gap-1",
      sm: "px-2 py-0.5 text-xs gap-1",
      default: "px-2.5 py-0.5 text-xs gap-1.5",
      lg: "px-3 py-1 text-sm gap-2",
    };

    const dotSizes = {
      xs: "w-1 h-1",
      sm: "w-1.5 h-1.5",
      default: "w-2 h-2",
      lg: "w-2.5 h-2.5",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center rounded-full border font-medium transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              "rounded-full flex-shrink-0",
              dotSizes[size],
              dotColor || (variant === "default" && "bg-primary"),
              dotColor || (variant === "success" && "bg-success"),
              dotColor || (variant === "warning" && "bg-warning"),
              dotColor || (variant === "destructive" && "bg-destructive"),
              dotColor || (variant === "info" && "bg-info"),
              dotColor || (variant === "active" && "bg-success"),
              dotColor || (variant === "inactive" && "bg-muted-foreground"),
              dotColor || (variant === "pending" && "bg-warning"),
              dotColor || (variant === "processing" && "bg-info"),
              dotColor || (variant === "completed" && "bg-success"),
              dotColor || (variant === "cancelled" && "bg-destructive"),
              dotColor || (variant === "draft" && "bg-muted-foreground"),
              dotColor || (variant === "published" && "bg-primary"),
              dotColor || (variant === "archived" && "bg-neutral-500"),
              dotColor || "bg-current"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;