"use client";

import React from "react";
import { clsx } from "clsx";

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  default: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-24 h-24 text-xl",
};

const shapeClasses = {
  circle: "rounded-full",
  square: "rounded-lg",
  rounded: "rounded-xl",
};

const Avatar = React.forwardRef(
  ({
    className,
    src,
    alt,
    fallback,
    size = "default",
    shape = "circle",
    status,
    statusPosition = "bottom-right",
    ...props
  }, ref) => {
    const statusSizes = {
      xs: "w-2 h-2",
      sm: "w-2.5 h-2.5",
      default: "w-3 h-3",
      lg: "w-3.5 h-3.5",
      xl: "w-4 h-4",
      "2xl": "w-5 h-5",
    };

    const statusPositions = {
      "bottom-right": "bottom-0 right-0",
      "bottom-left": "bottom-0 left-0",
      "top-right": "top-0 right-0",
      "top-left": "top-0 left-0",
    };

    const statusColors = {
      online: "bg-success border-background",
      offline: "bg-muted-foreground/50 border-background",
      busy: "bg-destructive border-background",
      away: "bg-warning border-background",
      none: "hidden",
    };

    const getInitials = (name) => {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const showFallback = !src || src === "";
    const initials = fallback || (alt ? getInitials(alt) : "?");
    const bgColor = alt
      ? `hsl(${Math.abs(
          [...alt].reduce((acc, char) => acc + char.charCodeAt(0), 0)
        ) % 360} 70% 50%)`
      : "hsl(var(--primary))";

    return (
      <div
        ref={ref}
        className={clsx(
          "relative inline-flex shrink-0 overflow-hidden",
          "bg-muted",
          shapeClasses[shape],
          sizes[size],
          className
        )}
        {...props}
      >
        {showFallback ? (
          <div
            className="flex h-full w-full items-center justify-center font-medium text-primary-foreground"
            style={{ backgroundColor: bgColor }}
            aria-hidden="true"
          >
            {initials}
          </div>
        ) : (
          <img
            src={src}
            alt={alt || ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {status && status !== "none" && (
          <span
            className={clsx(
              "absolute rounded-full border-2",
              statusSizes[size],
              statusColors[status],
              statusPositions[statusPosition]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarGroup = React.forwardRef(
  ({ className, children, max = 5, overlap = true, size = "default", ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    const overlapClasses = {
      xs: "-space-x-1",
      sm: "-space-x-1.5",
      default: "-space-x-2",
      lg: "-space-x-2.5",
      xl: "-space-x-3",
      "2xl": "-space-x-4",
    };

    return (
      <div
        ref={ref}
        className={clsx("flex items-center", overlap && overlapClasses[size], className)}
        {...props}
      >
        {visibleChildren.map((child, index) =>
          React.cloneElement(child, {
            key: child.key || index,
            size,
            className: clsx(
              child.props.className,
              "border-background",
              overlap && index > 0 && "ring-2 ring-background"
            ),
          })
        )}
        {remainingCount > 0 && (
          <div
            className={clsx(
              "flex items-center justify-center font-medium text-muted-foreground border-2 border-background",
              shapeClasses.circle,
              sizes[size],
              overlap ? "-ml-2" : ""
            )}
            aria-label={`${remainingCount} more people`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };