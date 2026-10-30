"use client";

import React from "react";
import { clsx } from "clsx";
import Badge  from "./Badge";

const statusConfig = {
  // Order statuses
  pending: { label: "Pending", variant: "warning", dot: true },
  processing: { label: "Processing", variant: "info", dot: true },
  confirmed: { label: "Confirmed", variant: "info", dot: true },
  shipped: { label: "Shipped", variant: "primary", dot: true },
  delivered: { label: "Delivered", variant: "success", dot: true },
  cancelled: { label: "Cancelled", variant: "destructive", dot: true },
  refunded: { label: "Refunded", variant: "destructive", dot: true },
  returned: { label: "Returned", variant: "warning", dot: true },
  partial: { label: "Partial", variant: "warning", dot: true },

  // Payment statuses
  paid: { label: "Paid", variant: "success", dot: true },
  unpaid: { label: "Unpaid", variant: "destructive", dot: true },
  partially_paid: { label: "Partially Paid", variant: "warning", dot: true },
  refunded_payment: { label: "Refunded", variant: "destructive", dot: true },
  failed: { label: "Failed", variant: "destructive", dot: true },
  pending_payment: { label: "Pending", variant: "warning", dot: true },

  // Product statuses
  active: { label: "Active", variant: "success", dot: true },
  inactive: { label: "Inactive", variant: "inactive", dot: true },
  draft: { label: "Draft", variant: "draft", dot: true },
  published: { label: "Published", variant: "published", dot: true },
  archived: { label: "Archived", variant: "archived", dot: true },
  out_of_stock: { label: "Out of Stock", variant: "destructive", dot: true },
  low_stock: { label: "Low Stock", variant: "warning", dot: true },
  in_stock: { label: "In Stock", variant: "success", dot: true },

  // User statuses
  verified: { label: "Verified", variant: "success", dot: true },
  unverified: { label: "Unverified", variant: "inactive", dot: true },
  blocked: { label: "Blocked", variant: "destructive", dot: true },
  suspended: { label: "Suspended", variant: "warning", dot: true },
  pending_verification: { label: "Pending Verification", variant: "warning", dot: true },

  // Generic
  enabled: { label: "Enabled", variant: "success", dot: true },
  disabled: { label: "Disabled", variant: "inactive", dot: true },
  open: { label: "Open", variant: "success", dot: true },
  closed: { label: "Closed", variant: "inactive", dot: true },
  completed: { label: "Completed", variant: "success", dot: true },
  in_progress: { label: "In Progress", variant: "info", dot: true },
  on_hold: { label: "On Hold", variant: "warning", dot: true },
  approved: { label: "Approved", variant: "success", dot: true },
  rejected: { label: "Rejected", variant: "destructive", dot: true },
};

const StatusBadge = ({
  status,
  label,
  variant,
  size = "default",
  dot = true,
  className,
  customConfig,
  showLabel = true,
  uppercase = false,
  ...props
}) => {
  const config = customConfig?.[status] || statusConfig[status] || {};
  const finalVariant = variant || config.variant || "default";
  const finalLabel = showLabel ? (label || config.label || status) : undefined;
  const finalDot = dot && config.dot !== false;
  const finalSize = size;

  const displayLabel = finalLabel
    ? uppercase
      ? finalLabel.toUpperCase()
      : finalLabel
    : undefined;

  return (
    <Badge
      variant={finalVariant}
      size={finalSize}
      dot={finalDot}
      className={className}
      {...props}
    >
      {displayLabel}
    </Badge>
  );
};

const StatusBadgeGroup = ({
  statuses,
  size = "default",
  className,
  maxVisible = 3,
  ...props
}) => {
  const visibleStatuses = statuses.slice(0, maxVisible);
  const remainingCount = statuses.length - maxVisible;

  return (
    <div className={clsx("flex flex-wrap gap-1.5", className)} {...props}>
      {visibleStatuses.map((status, index) => (
        <StatusBadge key={index} status={status} size={size} />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" size={size} className="text-muted-foreground">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

const StatusIndicator = ({
  status,
  size = "default",
  className,
  showLabel = false,
  label,
  customConfig,
  ...props
}) => {
  const config = customConfig?.[status] || statusConfig[status] || {};
  const variant = config.variant || "default";

  const variantColors = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
    primary: "bg-primary",
    inactive: "bg-muted-foreground/50",
    draft: "bg-muted",
    published: "bg-primary/10 text-primary border-primary/20",
    archived: "bg-neutral/10 text-neutral-600 dark:text-neutral-400 border-neutral/20",
    default: "bg-muted-foreground/20",
  };

  const sizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    default: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)} {...props}>
      <span
        className={clsx(
          "rounded-full flex-shrink-0",
          sizes[size],
          variantColors[variant] || variantColors.default
        )}
        aria-label={label || config.label || status}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {label || config.label || status}
        </span>
      )}
    </span>
  );
};

export { StatusBadge, StatusBadgeGroup, StatusIndicator, statusConfig };