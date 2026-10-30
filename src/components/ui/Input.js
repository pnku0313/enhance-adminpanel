"use client";

import React from "react";
import { clsx } from "clsx";

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;

    const wrapperClasses = clsx("w-full", className);
    const labelClasses = clsx(
      "block text-sm font-medium text-foreground mb-1.5",
      error && "text-destructive",
      success && "text-success"
    );
    const inputWrapperClasses = clsx(
      "relative flex items-center",
      leftIcon || leftElement ? "pl-10" : "",
      rightIcon || rightElement || error || success ? "pr-10" : ""
    );
    const inputClasses = clsx(
      "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-destructive focus-visible:ring-destructive/20"
        : success
        ? "border-success focus-visible:ring-success/20"
        : "border-input focus-visible:ring-ring/20",
      "hover:border-muted-foreground/50"
    );
    const iconClasses = clsx(
      "absolute inset-y-0 flex items-center text-muted-foreground pointer-events-none",
      leftIcon || leftElement ? "left-3" : "right-3"
    );
    const helperClasses = clsx(
      "mt-1.5 text-sm",
      error ? "text-destructive" : success ? "text-success" : "text-muted-foreground"
    );

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className={inputWrapperClasses}>
          {(leftIcon || leftElement) && (
            <div className={clsx(iconClasses, "left-0")} aria-hidden="true">
              {leftElement || leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={inputClasses}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={helperText || error ? `${inputId}-helper` : undefined}
            {...props}
          />
          {(rightIcon || rightElement || error || success) && (
            <div className={clsx(iconClasses, "right-0")} aria-hidden="true">
              {rightElement || rightIcon || (error && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )) || (success && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ))}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p id={`${inputId}-helper`} className={helperClasses} role="alert">
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;