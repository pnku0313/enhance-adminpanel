"use client";

import React from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({
  className,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  boundaryCount = 1,
  showPageSize = false,
  pageSizeOptions = [10, 25, 50, 100],
  pageSize = 10,
  onPageSizeChange,
  totalItems = 0,
  showTotal = false,
  ...props
}) => {
  const pages = React.useMemo(() => {
    const range = (start, end) =>
      Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

    const unique = new Set(
      [
        ...range(1, boundaryCount),
        ...range(totalPages - boundaryCount + 1, totalPages),
        ...range(currentPage - siblingCount, currentPage + siblingCount),
      ].filter((p) => p >= 1 && p <= totalPages)
    );
    const sorted = [...unique].sort((a, b) => a - b);

    const result = [];
    sorted.forEach((page, i) => {
      if (i > 0) {
        const gap = page - sorted[i - 1];
        if (gap === 2) result.push(page - 1);
        else if (gap > 2) result.push("ellipsis");
      }
      result.push(page);
    });
    return result;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={clsx(
        "flex flex-wrap items-center justify-center gap-1",
        className
      )}
      aria-label="Pagination"
      {...props}
    >
      {showTotal && totalItems > 0 && (
        <span className="flex items-center px-3 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </span>
      )}

      {showPageSize && (
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-muted-foreground">
            Rows per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage === 1}
            className={clsx(
              "p-2 rounded-lg text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "disabled:opacity-50 disabled:pointer-events-none",
              "transition-colors"
            )}
            aria-label="Go to first page"
            aria-disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {showPrevNext && (
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={clsx(
              "p-2 rounded-lg text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "disabled:opacity-50 disabled:pointer-events-none",
              "transition-colors"
            )}
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              className={clsx(
                "min-w-[2.5rem] h-8 rounded-lg text-sm font-medium",
                "transition-colors",
                page === currentPage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        {showPrevNext && (
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={clsx(
              "p-2 rounded-lg text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "disabled:opacity-50 disabled:pointer-events-none",
              "transition-colors"
            )}
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage === totalPages}
            className={clsx(
              "p-2 rounded-lg text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "disabled:opacity-50 disabled:pointer-events-none",
              "transition-colors"
            )}
            aria-label="Go to last page"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Pagination;