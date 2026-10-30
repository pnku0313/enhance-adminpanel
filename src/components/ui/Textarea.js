"use client";

import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";

const Textarea = React.forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      showCharacterCount = false,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      id,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef(null);
    const [height, setHeight] = useState("auto");
    const generatedId = React.useId();
    const textareaId = id || `textarea-${generatedId}`;

    const forwardedRef = React.useCallback(
      (node) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && typeof ref === "object") {
          ref.current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        const newHeight = Math.min(
          textarea.scrollHeight,
          maxRows * 24 // approximate line height
        );
        textarea.style.height = `${Math.max(newHeight, minRows * 24)}px`;
      }
    }, [props.value, autoResize, minRows, maxRows]);

    const wrapperClasses = clsx("w-full", className);
    const labelClasses = clsx(
      "block text-sm font-medium text-foreground mb-1.5",
      error && "text-destructive"
    );
    const textareaClasses = clsx(
      "flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "resize-none",
      error
        ? "border-destructive focus-visible:ring-destructive/20"
        : "border-input focus-visible:ring-ring/20",
      "hover:border-muted-foreground/50"
    );
    const helperClasses = clsx(
      "mt-1.5 text-sm",
      error ? "text-destructive" : "text-muted-foreground"
    );
    const counterClasses = clsx(
      "mt-1.5 text-xs text-right",
      maxLength && props.value && props.value.length >= maxLength * 0.9
        ? "text-destructive"
        : "text-muted-foreground"
    );

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className={labelClasses}>
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={forwardedRef}
          id={textareaId}
          className={textareaClasses}
          style={{ height: autoResize ? height : undefined, minHeight: `${minRows * 1.5}rem` }}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={helperText || error ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {(helperText || error || (showCharacterCount && maxLength)) && (
          <div className="flex items-center justify-between mt-1.5">
            <p id={`${textareaId}-helper`} className={helperClasses} role="alert">
              {error || helperText}
            </p>
            {showCharacterCount && maxLength && (
              <span className={counterClasses}>
                {props.value?.length || 0} / {maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;