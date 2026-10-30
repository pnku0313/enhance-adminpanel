"use client";

import React, { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

const Tooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  delayDuration = 200,
  skipDelayDuration = 300,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
  contentClassName,
  wrapperClassName,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  const controlled = open !== undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    if (!controlled) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      handleOpenChange(true);
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleOpenChange(false);
    }, skipDelayDuration);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleOpenChange(false);
    }
  };

  if (!mounted) return <>{children}</>;

  const child = React.Children.only(children);
  const childProps = child.props || {};

  const tooltipContent = isOpen && (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={clsx(
        "absolute z-50 max-w-xs rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        contentClassName
      )}
      style={{
        position: "absolute",
        zIndex: 50,
      }}
    >
      {content}
      <div className="tooltip-arrow" data-side={side} />
    </div>
  );

  const wrapper = (
    <div
      ref={triggerRef}
      className={clsx("relative inline-block", wrapperClassName)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      aria-describedby={isOpen ? "tooltip-content" : undefined}
    >
      {React.cloneElement(child, {
        ...childProps,
        ref: (el) => {
          triggerRef.current = el;
          if (typeof childProps.ref === "function") childProps.ref(el);
          else if (childProps.ref) childProps.ref.current = el;
        },
      })}
      {tooltipContent}
    </div>
  );

  return createPortal(wrapper, document.body);
};

const TooltipTrigger = ({ children, ...props }) => children;
const TooltipContent = ({ children, ...props }) => <div {...props}>{children}</div>;
const TooltipProvider = ({ children, ...props }) => <div {...props}>{children}</div>;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };