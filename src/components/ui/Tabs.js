"use client";

import React, { useState, useRef, useEffect, useContext, createContext, useMemo } from "react";
import { clsx } from "clsx";

const TabsContext = createContext({ activeValue: undefined, onValueChange: () => {} });
const TabsListContext = createContext({ variant: "line" });

const Tabs = ({ children, defaultValue, value, onValueChange, className, ...props }) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const activeValue = controlled ? value : uncontrolledValue;

  const contextValue = useMemo(
    () => ({
      activeValue,
      onValueChange: (newValue) => {
        if (!controlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
    }),
    [activeValue, controlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={clsx("w-full", className)} data-value={activeValue} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(
  ({ className, variant = "line", children, ...props }, ref) => {
    const variantClasses = {
      line: "border-b border-border",
      enclosed: "bg-muted",
      soft: "bg-transparent",
    };

    return (
      <TabsListContext.Provider value={{ variant }}>
        <div
          ref={ref}
          role="tablist"
          aria-orientation="horizontal"
          className={clsx(
            "inline-flex h-10 items-center justify-center gap-1",
            "rounded-md p-1",
            variantClasses[variant],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TabsListContext.Provider>
    );
  }
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(
  ({ className, value, disabled = false, variant: variantProp, children, icon, ...props }, ref) => {
    const { activeValue, onValueChange } = useContext(TabsContext);
    const { variant: listVariant } = useContext(TabsListContext);
    const variant = variantProp ?? listVariant;
    const isActive = activeValue === value;

    const variantClasses = {
      line: isActive
        ? "border-b-2 border-primary text-primary"
        : "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
      enclosed: isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
      soft: isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent",
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-${value}-panel`}
        id={`tabs-${value}-trigger`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && onValueChange?.(value)}
        className={clsx(
          "inline-flex items-center justify-center gap-1.5",
          "px-3 py-1.5 text-sm font-medium",
          "rounded-md",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant] || variantClasses.line,
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(
  ({ className, value, children, forceMount = false, lazyMount = false, ...props }, ref) => {
    const { activeValue } = useContext(TabsContext);
    const isActive = activeValue === value;
    const mountedRef = useRef(isActive || forceMount);

    useEffect(() => {
      if (isActive || forceMount) {
        mountedRef.current = true;
      }
    }, [isActive, forceMount]);

    if (!mountedRef.current && !isActive && lazyMount) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-${value}-panel`}
        aria-labelledby={`tabs-${value}-trigger`}
        hidden={!isActive}
        className={clsx(
          "mt-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !isActive && "hidden",
          className
        )}
        {...props}
      >
        {(isActive || forceMount) && children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };