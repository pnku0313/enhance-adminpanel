
import React from "react";
import { clsx } from "clsx";
import { Home } from "lucide-react";

const Breadcrumb = React.forwardRef(
  ({ className, items = [], separator = "/", maxItems = 5, ...props }, ref) => {
    const visibleItems = items.slice(-maxItems);

    const renderItems = visibleItems.map((item, index) => {
      const isLast = index === visibleItems.length - 1;
      const isFirst = index === 0 && items.length > maxItems;

      if (isFirst) {
        return (
          <React.Fragment key="ellipsis">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-border">
                <Home className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="mx-1.5 text-muted-foreground/50">
                {separator}
              </span>
              <span className="flex h-4 w-4 items-center justify-center rounded border border-border text-[10px]">
                …
              </span>
            </span>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment key={item.href || item.label || index}>
          {!isLast && (
            <span className="mx-1.5 text-muted-foreground/50">
              {separator}
            </span>
          )}

          {item.href && !isLast ? (
            <a
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ) : (
            <span
              className={clsx(
                "text-sm",
                isLast
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
              aria-current={isLast ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      );
    });

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={clsx("flex flex-wrap items-center gap-1.5", className)}
        {...props}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {renderItems}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = ({
  children,
  href,
  isCurrent = false,
  className,
  ...props
}) => {
  const classes = clsx(
    "text-sm text-muted-foreground transition-colors hover:text-foreground",
    className
  );

  return href && !isCurrent ? (
    <a
      href={href}
      className={classes}
      aria-current={undefined}
      {...props}
    >
      {children}
    </a>
  ) : (
    <span
      className={clsx("text-sm font-medium text-foreground", className)}
      aria-current={isCurrent ? "page" : undefined}
      {...props}
    >
      {children}
    </span>
  );
};

const BreadcrumbSeparator = ({
  children = "/",
  className,
  ...props
}) => (
  <span
    className={clsx("text-muted-foreground/50", className)}
    aria-hidden="true"
    {...props}
  >
    {children}
  </span>
);

const BreadcrumbLink = BreadcrumbItem;

const BreadcrumbPage = ({ children, className, ...props }) => (
  <span
    className={clsx("text-sm font-medium text-foreground", className)}
    aria-current="page"
    {...props}
  >
    {children}
  </span>
);

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
