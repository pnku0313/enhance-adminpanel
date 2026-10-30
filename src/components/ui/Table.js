"use client";

import React from "react";
import { clsx } from "clsx";

const Table = React.forwardRef(
  ({ className, stickyHeader = false, ...props }, ref) => (
    <div className={clsx("w-full overflow-auto", stickyHeader && "max-h-[calc(100vh-200px)]", className)}>
      <table
        ref={ref}
        className={clsx("w-full caption-bottom text-sm", stickyHeader && "thead:sticky thead:top-0 thead:z-10", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx("[&_tr]:border-b border-border bg-muted/50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={clsx("[&_tr:last-child]:border-0 divide-y divide-border", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(
  ({ className, selectable = false, selected = false, clickable = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        "border-b transition-colors",
        "hover:bg-muted/50",
        selectable && "cursor-pointer",
        clickable && "cursor-pointer",
        selected && "bg-primary/5",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={clsx(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
      "bg-muted/50",
      "whitespace-nowrap",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={clsx("px-4 py-3 align-middle", "[&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={clsx("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={clsx("border-t border-border bg-muted/30 font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };