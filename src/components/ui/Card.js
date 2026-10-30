"use client";

import React from "react";
import { clsx } from "clsx";

const Card = React.forwardRef(
  ({ className, variant = "default", interactive = false, ...props }, ref) => {
    const variants = {
      default: "border border-border bg-card shadow-sm",
      outlined: "border-2 border-border bg-card shadow-none",
      elevated: "border-none bg-card shadow-lg",
      ghost: "border-none bg-transparent shadow-none",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl w-full",
          variants[variant],
          interactive && "transition-all duration-200 hover:shadow-md cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx("text-xl font-semibold leading-tight tracking-tight text-card-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center p-6 pt-0 border-t border-border", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };