"use client";

import React from "react";
import { clsx } from "clsx";

const Label = React.forwardRef(
  (
    {
      className,
      required = false,
      optional = false,
      size = "default",
      children,
      htmlFor,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: "text-xs",
      sm: "text-sm",
      default: "text-sm",
      lg: "text-base",
    };

    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={clsx(
          "block font-medium leading-none text-foreground",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">*</span>
        )}
        {optional && (
          <span className="text-muted-foreground ml-1 text-sm font-normal" aria-hidden="true">
            (optional)
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";

export default Label;