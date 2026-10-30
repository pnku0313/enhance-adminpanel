"use client";

import React from "react";
import { clsx } from "clsx";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./Breadcrumb";
import Button from "./Button";

const PageHeader = ({
  className,
  title,
  description,
  breadcrumb,
  actions,
  backLink,
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "border-b border-border pb-6",
    minimal: "pb-4",
    card: "bg-card border border-border rounded-xl p-6",
  };

  return (
    <div className={clsx(variants[variant], className)} {...props}>
      {(breadcrumb || backLink) && (
        <div className="mb-4 flex items-center gap-2">
          {backLink && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => window.history.back()}
              className="h-8 w-8"
              aria-label="Go back"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          )}
          {breadcrumb && (
            <Breadcrumb className="flex-1" items={breadcrumb} maxItems={5} />
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = "PageHeader";

const PageHeaderActions = ({ children, className, ...props }) => (
  <div className={clsx("flex flex-wrap items-center gap-2", className)} {...props}>
    {children}
  </div>
);

const PageHeaderTitle = ({ children, className, ...props }) => (
  <div className={clsx("flex-1 min-w-0", className)} {...props}>
    {children}
  </div>
);

export { PageHeader, PageHeaderActions, PageHeaderTitle };