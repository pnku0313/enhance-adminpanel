"use client";
import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Filter, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/Dialog";

const UserFilters = ({ onFilterChange, activeFilters }) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    customer: "",
    phoneNumber: "",
    email: "",
    ...activeFilters,
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      name: "",
      code: "",
      customer: "",
      phoneNumber: "",
      email: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsFilterModalOpen(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== ""
  );

  return (
    <>
      <Button
        className={`flex-shrink-0 w-full sm:w-auto ${
          hasActiveFilters
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-transparent"
        }`}
        onClick={() => setIsFilterModalOpen(true)}
        variant={hasActiveFilters ? "default" : "outline"}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filter{" "}
        {hasActiveFilters &&
          `(${Object.values(activeFilters).filter((v) => v !== "").length})`}
      </Button>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px] dark:text-white">
          <DialogHeader>
            <DialogTitle>
              <div className="dark:text-white">Filter Users</div>
            </DialogTitle>
            <DialogDescription>
              Filter users by various criteria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right dark:text-white">Name</label>
              <Input
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                className="col-span-3 dark:text-white"
                placeholder="Filter by name"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right dark:text-white">Code</label>
              <Input
                value={filters.code}
                onChange={(e) => handleFilterChange("code", e.target.value)}
                className="col-span-3 dark:text-white"
                placeholder="Filter by code"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right dark:text-white">Customer</label>
              <Input
                value={filters.customer}
                onChange={(e) => handleFilterChange("customer", e.target.value)}
                className="col-span-3 dark:text-white"
                placeholder="Filter by customer"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right dark:text-white">Phone</label>
              <Input
                value={filters.phoneNumber}
                onChange={(e) =>
                  handleFilterChange("phoneNumber", e.target.value)
                }
                className="col-span-3 dark:text-white"
                placeholder="Filter by phone number"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right dark:text-white">Email</label>
              <Input
                value={filters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
                className="col-span-3 dark:text-white"
                placeholder="Filter by email"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserFilters;
