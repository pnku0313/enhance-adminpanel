"use client";

import React, { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./Table";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Input from "./Input";
import Select from "./Select";
import Badge from "./Badge";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./Dropdown";
import { Skeleton } from "./Skeleton";
import {
  ChevronUp,
  ChevronDown,
  Search,
  MoreHorizontal,
} from "lucide-react";

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div
    className="rounded-lg border border-border overflow-hidden"
    aria-busy="true"
    aria-label="Loading table"
  >
    <div className="flex gap-4 border-b border-border bg-muted/50 p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="flex gap-4 border-b border-border p-4 last:border-b-0"
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const DataTable = ({
  columns = [],
  data = [],
  keyField = "id",
  sortable = true,
  filterable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  serverSide = false,
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription,
  emptyAction,
  caption,
  striped = true,
  hoverable = true,
  stickyHeader = true,
  className,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [globalFilter, setGlobalFilter] = useState("");

  const handleSort = (key) => {
    if (!sortable) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    onSort?.(newConfig);
  };

  const handleFilter = (key, value) => {
    if (!filterable) return;
    const newFilters = { ...filters };
    if (value === "" || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
    setCurrentPage(1);
    onFilter?.(newFilters);
  };

  const handleGlobalFilter = (value) => {
    setGlobalFilter(value);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelection = new Set(data.map((row) => row[keyField]));
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handlePageSizeChange = (size) => {
    setCurrentPage(1);
    onPageSizeChange?.(size);
  };

  const handleRowClick = (row) => {
    onRowClick?.(row);
  };

  // Process data client-side if not server-side
  const processedData = useMemo(() => {
    if (serverSide) return data;

    let result = [...data];

    // Apply global filter
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      const column = columns.find((c) => c.key === key);
      if (!column || !column.filter) return;
      result = result.filter((row) => column.filter(row[key], value));
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, columns, globalFilter, filters, sortConfig, serverSide]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination || serverSide) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, pagination, serverSide, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const totalItems = processedData.length;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  if (loading) {
    return (
      <div className={clsx("w-full", className)}>
        <SkeletonTable rows={Math.min(pageSize, 10)} columns={Math.max(columns.length, 1)} />
        {pagination && (
          <div className="mt-4 flex justify-center">
            <Pagination currentPage={1} totalPages={1} />
          </div>
        )}
      </div>
    );
  }

  if (paginatedData.length === 0) {
    return (
      <div className={clsx("w-full", className)}>
        <EmptyState
          title="No data found"
          description={emptyDescription || emptyMessage}
          action={emptyAction}
        />
      </div>
    );
  }

  const renderCell = (row, column) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === "badge") {
      return <Badge variant={column.variant || "default"}>{value}</Badge>;
    }

    if (column.type === "image") {
      return (
        <img
          src={value}
          alt={column.alt || ""}
          className={clsx("h-10 w-10 rounded-lg object-cover", column.imageClass)}
        />
      );
    }

    if (column.type === "avatar") {
      return (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt={column.alt || ""}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>{row[column.nameKey || "name"]}</span>
        </div>
      );
    }

    if (column.type === "actions") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {column.actions?.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick?.(row)}
                className={action.destructive ? "text-destructive" : ""}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return <span>{value !== null && value !== undefined ? String(value) : "—"}</span>;
  };

  const renderFilter = (column) => {
    if (!column.filterable || !filterable) return null;

    const filterValue = filters[column.key] || "";

    switch (column.filterType) {
      case "select":
        return (
          <Select
            value={filterValue}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            placeholder="All"
            className="w-full"
          >
            {column.filterOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={filterValue}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            className="w-full"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={filterValue}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            placeholder="Filter..."
            className="w-full"
          />
        );
      default:
        return (
          <Input
            value={filterValue}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            placeholder={`Filter ${column.header}...`}
            className="w-full"
            leftIcon={<Search className="h-4 w-4" />}
          />
        );
    }
  };

  return (
    <div className={clsx("w-full overflow-hidden", className)}>
      {(filterable || pagination) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
          {filterable && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={globalFilter}
                  onChange={(e) => handleGlobalFilter(e.target.value)}
                  placeholder="Search..."
                  className="pl-10"
                />
              </div>
              {columns.filter((c) => c.filterable).map((column) => (
                <div key={column.key} className="w-full sm:w-48">
                  {renderFilter(column)}
                </div>
              ))}
            </div>
          )}
          {pagination && pageSizeOptions.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-muted-foreground">
                Show
              </label>
              <Select
                id="page-size"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="w-[100px]"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
              <span className="text-sm text-muted-foreground">rows</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table stickyHeader={stickyHeader}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={clsx(
                    column.className,
                    column.align && `text-${column.align}`,
                    column.width && `w-[${column.width}]`,
                    sortable && column.sortable !== false && "cursor-pointer select-none hover:bg-muted"
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && sortConfig.key === column.key && (
                      <span className="text-primary">
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {columns.some((c) => c.type === "actions") && (
                <TableHead className="w-12 text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={row[keyField] || rowIndex}
                selectable={selectable}
                selected={selectedRows.has(row[keyField])}
                clickable={!!onRowClick}
                onClick={() => handleRowClick(row)}
              >
                {selectable && (
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedRows.has(row[keyField])}
                      onCheckedChange={(checked) => handleSelectRow(row[keyField], checked)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={clsx(
                      column.className,
                      column.align && `text-${column.align}`
                    )}
                  >
                    {renderCell(row, column)}
                  </TableCell>
                ))}
                {columns.some((c) => c.type === "actions") && (
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {columns
                          .find((c) => c.type === "actions")
                          ?.actions?.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick?.(row)}
                              className={action.destructive ? "text-destructive" : ""}
                            >
                              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && !serverSide && totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showFirstLast
            showPrevNext
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;