"use client";

import React from "react";
import { clsx } from "clsx";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Skeleton } from "./Skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StatsCard = ({
  className,
  title,
  value,
  change,
  changeLabel,
  icon,
  iconClassName,
  trend,
  variant = "default",
  size = "default",
  loading = false,
  clickable = false,
  onClick,
  children,
  footer,
  ...props
}) => {
  const variants = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-success/5 border-success/20",
    warning: "bg-warning/5 border-warning/20",
    destructive: "bg-destructive/5 border-destructive/20",
    info: "bg-info/5 border-info/20",
  };

  const sizes = {
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  const iconSizes = {
    sm: "h-10 w-10",
    default: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const valueSizes = {
    sm: "text-2xl",
    default: "text-3xl",
    lg: "text-4xl",
  };

  if (loading) {
    return (
      <Card variant="default" className={clsx(sizes[size], className)} {...props}>
        <CardContent className="pt-0">
          <Skeleton variant="title" width="50%" />
          <Skeleton variant="text" width="60%" className="mt-4" />
          <Skeleton variant="text" width="40%" className="mt-2" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  const defaultIcons = {
    revenue: <DollarSign className="h-6 w-6" />,
    users: <Users className="h-6 w-6" />,
    orders: <ShoppingCart className="h-6 w-6" />,
    products: <Package className="h-6 w-6" />,
  };

  return (
    <Card
      variant={variants[variant] || variants.default}
      className={clsx(
        sizes[size],
        "transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="pt-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={clsx("font-bold tabular-nums text-foreground", valueSizes[size])}>
                {value}
              </span>
              {change !== undefined && change !== null && (
                <span className={clsx("text-sm font-medium flex items-center gap-1", trendColor)}>
                  <TrendIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{change >= 0 ? `+${change}` : change}%</span>
                  {changeLabel && (
                    <span className="text-muted-foreground">{changeLabel}</span>
                  )}
                </span>
              )}
            </div>
            {footer && (
              <div className="mt-4 text-sm text-muted-foreground">{footer}</div>
            )}
          </div>
          <div
            className={clsx(
              "flex-shrink-0 rounded-xl flex items-center justify-center",
              iconSizes[size],
              iconClassName
            )}
            aria-hidden="true"
          >
            {icon || defaultIcons[title?.toLowerCase().replace(/\s+/g, "")] || (
              <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
};

StatsCard.displayName = "StatsCard";

const StatsGrid = ({
  className,
  children,
  columns = 4,
  gap = "default",
  ...props
}) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  };

  const gapClasses = {
    none: "gap-0",
    tight: "gap-3",
    default: "gap-4",
    loose: "gap-6",
  };

  return (
    <div
      className={clsx(
        "grid",
        columnClasses[columns] || columnClasses[4],
        gapClasses[gap] || gapClasses.default,
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return child;
      })}
    </div>
  );
};

const StatItem = ({
  label,
  value,
  change,
  trend,
  icon,
  className,
  ...props
}) => (
  <div className={clsx("flex items-center gap-3 p-3 rounded-lg bg-muted/50", className)} {...props}>
    {icon && <span className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{icon}</span>}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {change !== undefined && (
        <span className={clsx("text-xs font-medium flex items-center gap-1", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {trend === "neutral" && <Minus className="h-3 w-3" />}
          <span>{change >= 0 ? `+${change}` : change}%</span>
        </span>
      )}
    </div>
  </div>
);

export { StatsCard, StatsGrid, StatItem };