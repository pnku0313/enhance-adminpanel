"use client";

import React from "react";
import { clsx } from "clsx";

const Radio = React.forwardRef(
  (
    {
      className,
      checked,
      onCheckedChange,
      disabled = false,
      label,
      description,
      value,
      name,
      size = "default",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const radioId = id || `radio-${generatedId}`;

    const sizes = {
      sm: "h-3.5 w-3.5",
      default: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const innerSizes = {
      sm: "h-1.5 w-1.5",
      default: "h-2 w-2",
      lg: "h-2.5 w-2.5",
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
          type="radio"
          id={radioId}
          name={name}
          value={value}
          ref={ref}
          className={clsx(
            "peer appearance-none",
            sizes[size],
            "rounded-full border-2 border-input bg-background",
            "cursor-pointer transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "checked:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          checked={checked}
          onChange={(e) => !disabled && onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          aria-describedby={description ? `${radioId}-desc` : undefined}
          {...props}
        />
        <span
          className={clsx(
            "absolute inset-0 flex items-center justify-center",
            innerSizes[size],
            "rounded-full bg-primary opacity-0 peer-checked:opacity-100",
            "transition-opacity duration-200"
          )}
          aria-hidden="true"
        />
        {(label || description) && (
          <div className={labelClasses}>
            <label htmlFor={radioId} className={labelTextClasses}>
              {label}
            </label>
            {description && (
              <p id={`${radioId}-desc`} className={descriptionClasses}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Radio.displayName = "Radio";

const RadioGroup = ({ children, value, onChange, disabled = false, className, ...props }) => {
  return (
    <div className={clsx("space-y-3", className)} role="radiogroup" {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          checked: child.props.value === value,
          onCheckedChange: (checked) => checked && onChange?.(child.props.value),
          disabled: disabled || child.props.disabled,
        });
      })}
    </div>
  );
};

export { Radio, RadioGroup };