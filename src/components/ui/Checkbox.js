"use client";

import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef(
  (
    {
      className,
      checked,
      onCheckedChange,
      disabled = false,
      indeterminate = false,
      label,
      description,
      size = "default",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    const sizes = {
      sm: "h-3.5 w-3.5",
      default: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const iconSizes = {
      sm: "h-2.5 w-2.5",
      default: "h-3 w-3",
      lg: "h-3.5 w-3.5",
    };

    const wrapperClasses = clsx("relative inline-flex items-start", className);

    const labelClasses = clsx(
      "ml-3 mt-0.5",
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
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={clsx(
            "peer appearance-none",
            sizes[size],
            "rounded-sm border-2 border-input bg-background",
            "cursor-pointer transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "checked:bg-primary checked:border-primary checked:text-primary-foreground",
            "indeterminate:bg-primary indeterminate:border-primary indeterminate:text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          checked={checked}
          onChange={(e) => !disabled && onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          aria-describedby={description ? `${checkboxId}-desc` : undefined}
          aria-checked={indeterminate ? "mixed" : checked}
          {...props}
        />
        {(checked || indeterminate) && (
          <span
            className={clsx(
              "absolute inset-0 flex items-center justify-center text-white",
              iconSizes[size],
              "transition-opacity duration-200"
            )}
            aria-hidden="true"
          >
            {indeterminate ? (
              <div className="w-full h-0.5 bg-current rounded" />
            ) : (
              <Check className="h-full w-full" />
            )}
          </span>
        )}
        {(label || description) && (
          <div className={labelClasses}>
            <label htmlFor={checkboxId} className={labelTextClasses}>
              {label}
            </label>
            {description && (
              <p id={`${checkboxId}-desc`} className={descriptionClasses}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export default Checkbox;