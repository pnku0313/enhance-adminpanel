"use client";

import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(
  (
    {
      className,
      children,
      label,
      error,
      helperText,
      placeholder,
      leftIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || `select-${generatedId}`;

    const wrapperClasses = clsx("w-full", className);
    const labelClasses = clsx(
      "block text-sm font-medium text-foreground mb-1.5",
      error && "text-destructive"
    );
    const selectWrapperClasses = clsx(
      "relative",
      leftIcon ? "pl-10" : ""
    );
    const selectClasses = clsx(
      "flex h-10 w-full appearance-none items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-destructive focus:ring-destructive/20"
        : "border-input focus:ring-ring/20",
      "hover:border-muted-foreground/50",
      "pr-10"
    );
    const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none";

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={selectId} className={labelClasses}>
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className={selectWrapperClasses}>
          {leftIcon && (
            <div className={iconClasses} aria-hidden="true">{leftIcon}</div>
          )}
          <select
            id={selectId}
            className={selectClasses}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={helperText || error ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        </div>
        {(helperText || error) && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-muted-foreground" role="alert">
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;