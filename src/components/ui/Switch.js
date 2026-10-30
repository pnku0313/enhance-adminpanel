"use client";

import React from "react";
import { clsx } from "clsx";

const Switch = React.forwardRef(
  (
    {
      className,
      checked,
      onCheckedChange,
      disabled = false,
      label,
      description,
      size = "default",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || `switch-${generatedId}`;

    const sizes = {
      sm: "h-5 w-8",
      default: "h-6 w-11",
      lg: "h-7 w-12",
    };

    const thumbSizes = {
      sm: "h-4 w-4 translate-x-0.5",
      default: "h-5 w-5 translate-x-0.5",
      lg: "h-6 w-6 translate-x-0.5",
    };

    const thumbTranslate = {
      sm: "peer-checked:translate-x-4",
      default: "peer-checked:translate-x-5",
      lg: "peer-checked:translate-x-5.5",
    };

    const wrapperClasses = clsx(
      "relative inline-flex items-start",
      className
    );

    const labelClasses = clsx(
      "ml-3 mt-1",
      "text-sm leading-6",
      disabled && "opacity-50 cursor-not-allowed"
    );

    const labelTextClasses = clsx(
      "font-medium text-foreground",
      disabled && "text-muted-foreground"
    );

    const descriptionClasses = clsx(
      "text-sm text-muted-foreground mt-0.5",
      disabled && "opacity-50"
    );

    return (
      <div className={wrapperClasses}>
        <div className="flex items-center">
          <input
            type="checkbox"
            role="switch"
            id={switchId}
            ref={ref}
            className={clsx(
              "peer appearance-none",
              sizes[size],
              "rounded-full border-2 border-input bg-background",
              "cursor-pointer transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "checked:bg-primary checked:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            checked={checked}
            onChange={(e) => !disabled && onCheckedChange?.(e.target.checked)}
            disabled={disabled}
            aria-describedby={description ? `${switchId}-desc` : undefined}
            {...props}
          />
          <span
            className={clsx(
              "pointer-events-none absolute inset-0 flex items-center",
              thumbSizes[size],
              "rounded-full bg-white shadow-lg",
              "transition-transform duration-200",
              thumbTranslate[size]
            )}
            aria-hidden="true"
          />
        </div>
        {(label || description) && (
          <div className={labelClasses}>
            <label htmlFor={switchId} className={labelTextClasses}>
              {label}
            </label>
            {description && (
              <p id={`${switchId}-desc`} className={descriptionClasses}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";

export default Switch;