"use client";

import React from "react";
import { clsx } from "clsx";

const Skeleton = React.forwardRef(
  ({
    className,
    variant = "text",
    width,
    height,
    count = 1,
    spacing = "default",
    animation = "pulse",
    ...props
  }, ref) => {
    const variants = {
      text: "h-4 rounded",
      title: "h-6 rounded w-3/4",
      card: "h-32 rounded-lg",
      circular: "rounded-full",
      rectangular: "rounded-lg",
      button: "h-10 rounded-lg",
      input: "h-10 rounded-lg",
      avatar: "rounded-full",
      tableRow: "h-12",
      image: "aspect-video rounded-lg",
    };

    const spacings = {
      none: "space-y-0",
      tight: "space-y-2",
      default: "space-y-3",
      loose: "space-y-4",
    };

    const animations = {
      pulse: "animate-pulse",
      wave: "animate-[shimmer_2s_ease-in-out_infinite]",
      none: "",
    };

    const baseStyles = {
      backgroundColor: "hsl(var(--muted))",
    };

    if (variant === "text" || variant === "title") {
      const skeletons = Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          ref={i === 0 ? ref : undefined}
          className={clsx(
            variants[variant],
            animations[animation],
            width && `w-[${width}]`,
            height && `h-[${height}]`
          )}
          style={baseStyles}
          {...(i === 0 ? props : {})}
        />
      ));

      return (
        <div className={clsx(spacings[spacing], className)}>
          {skeletons}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          variants[variant],
          animations[animation],
          width && `w-[${width}]`,
          height && `h-[${height}]`,
          className
        )}
        style={baseStyles}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

const SkeletonGroup = ({ children, className, spacing = "default", ...props }) => {
  const spacings = {
    none: "space-y-0",
    tight: "space-y-2",
    default: "space-y-3",
    loose: "space-y-4",
  };

  return (
    <div className={clsx(spacings[spacing], className)} {...props}>
      {children}
    </div>
  );
};

const SkeletonCard = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "p-6",
    compact: "p-4",
  };

  return (
    <div className={clsx("rounded-xl border border-border bg-card", variants[variant], className)} {...props}>
      <Skeleton variant="title" width="60%" />
      <Skeleton variant="text" width="80%" count={3} spacing="tight" />
      <Skeleton variant="button" width="25%" count={2} spacing="default" />
    </div>
  );
};

const SkeletonTable = ({ className, rows = 5, columns = 4, ...props }) => {
  return (
    <div className={clsx("w-full overflow-auto", className)} {...props}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-border">
            {Array.from({ length: columns }, (_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <Skeleton variant="text" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border hover:bg-muted/50">
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="px-4 py-3 align-middle">
                  <Skeleton variant="text" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SkeletonList = ({ className, items = 5, showAvatar = true, showAction = false, ...props }) => {
  return (
    <div className={clsx("space-y-4", className)} {...props}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          {showAvatar && <Skeleton variant="avatar" size="default" className="w-10 h-10" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
          {showAction && <Skeleton variant="button" width="80px" />}
        </div>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonGroup, SkeletonCard, SkeletonTable, SkeletonList };