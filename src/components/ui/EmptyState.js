"use client";

import React from "react";
import { clsx } from "clsx";
import { Button } from "./Button";

const EmptyState = ({
  className,
  title = "No data found",
  description,
  icon,
  action,
  illustration,
  size = "default",
  ...props
}) => {
  const sizes = {
    sm: "py-8 px-4",
    default: "py-16 px-6",
    lg: "py-24 px-8",
  };

  const defaultIcons = {
    search: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    filter: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    list: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    user: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    box: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    document: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    chart: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  const defaultIllustrations = {
    empty: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.list}
      </div>
    ),
    search: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.search}
      </div>
    ),
    filter: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.filter}
      </div>
    ),
    users: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.user}
      </div>
    ),
    products: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.box}
      </div>
    ),
    orders: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.document}
      </div>
    ),
    analytics: (
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || defaultIcons.chart}
      </div>
    ),
  };

  return (
    <div
      className={clsx(
        "text-center",
        sizes[size],
        className
      )}
      {...props}
    >
      {illustration ? (
        typeof illustration === "string"
          ? defaultIllustrations[illustration] || defaultIllustrations.empty
          : illustration
      ) : (
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          {icon || defaultIcons.list}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && (
        <div className="flex justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;