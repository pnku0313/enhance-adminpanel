"use client";

import React from "react";
import { clsx } from "clsx";

const Progress = React.forwardRef(
  ({
    className,
    value = 0,
    max = 100,
    min = 0,
    variant = "default",
    size = "default",
    showLabel = false,
    label,
    indeterminate = false,
    ...props
  }, ref) => {
    const percentage = indeterminate ? 100 : Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    const variants = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      info: "bg-info",
    };

    const sizes = {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
      xl: "h-4",
    };

    const radius = "rounded-full";

    return (
      <div
        ref={ref}
        className={clsx("w-full", className)}
        {...props}
      >
        {(label || showLabel) && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {showLabel && (
              <span className="text-sm text-muted-foreground font-mono tabular-nums">
                {indeterminate ? "—" : `${Math.round(percentage)}%`}
              </span>
            )}
          </div>
        )}
        <div
          className={clsx(
            "relative overflow-hidden bg-muted",
            sizes[size],
            radius
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : percentage}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className={clsx(
              "h-full transition-all duration-300 ease-out",
              variants[variant],
              radius,
              indeterminate
                ? "animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-current to-transparent"
                : "origin-left"
            )}
            style={{
              transform: indeterminate ? undefined : `scaleX(${percentage / 100})`,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

const CircularProgress = React.forwardRef(
  ({
    className,
    value = 0,
    max = 100,
    min = 0,
    size = "default",
    strokeWidth = 4,
    variant = "default",
    showLabel = false,
    label,
    children,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const sizes = {
      sm: 32,
      default: 48,
      lg: 64,
      xl: 80,
    };

    const variants = {
      default: "text-primary",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
      info: "text-info",
    };

    const sizeValue = sizes[size];

    return (
      <div
        ref={ref}
        className={clsx("relative inline-flex items-center justify-center", className)}
        style={{ width: sizeValue, height: sizeValue }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={sizeValue}
          height={sizeValue}
          aria-hidden="true"
        >
          <circle
            className="text-muted"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={sizeValue / 2}
            cy={sizeValue / 2}
          />
          <circle
            className={clsx(
              "transition-all duration-300 ease-out",
              variants[variant]
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={sizeValue / 2}
            cy={sizeValue / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showLabel && (
            <span className="text-sm font-medium tabular-nums">
              {Math.round(percentage)}%
            </span>
          )) || label}
        </div>
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

export { Progress, CircularProgress };