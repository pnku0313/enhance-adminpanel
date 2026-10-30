"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Badge from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Percent,
  Users,
  CheckCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/Dialog"

const CouponsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const PER_PAGE = 10
  const [showDialog, setShowDialog] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formCoupon, setFormCoupon] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    usageLimit: 0,
    minCart: 0,
    maxCart: 0,
    endDate: "",
    status: "active",
  })
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: "WELCOME10",
      description: "Welcome discount for new customers",
      type: "percentage",
      value: 10,
      usageLimit: 100,
      usageCount: 45,
      minCart: 100,
      maxCart: 1000,
      endDate: "2024-12-31",
      status: "active",
    },
    {
      id: 2,
      code: "SAVE25",
      description: "Fixed discount on orders",
      type: "fixed",
      value: 25,
      usageLimit: 50,
      usageCount: 32,
      minCart: 200,
      maxCart: 800,
      endDate: "2024-06-15",
      status: "inactive",
    },
    {
      id: 3,
      code: "FREESHIP",
      description: "Free shipping on all orders",
      type: "fixed",
      value: 0,
      usageLimit: 200,
      usageCount: 120,
      minCart: 50,
      maxCart: 500,
      endDate: "2024-10-01",
      status: "active",
    },
    {
      id: 4,
      code: "SUMMER20",
      description: "20% off summer collection",
      type: "percentage",
      value: 20,
      usageLimit: 75,
      usageCount: 60,
      minCart: 75,
      maxCart: 300,
      endDate: "2024-08-31",
      status: "active",
    },
    {
      id: 5,
      code: "CLEARANCE",
      description: "Extra 15% off clearance items",
      type: "percentage",
      value: 15,
      usageLimit: 30,
      usageCount: 28,
      minCart: 25,
      maxCart: 150,
      endDate: "2024-07-31",
      status: "inactive",
    },
    {
      id: 6,
      code: "NEWUSER5",
      description: "5% off for first-time users",
      type: "percentage",
      value: 5,
      usageLimit: 500,
      usageCount: 210,
      minCart: 30,
      maxCart: 200,
      endDate: "2025-01-31",
      status: "active",
    },
    {
      id: 7,
      code: "FLASH10",
      description: "Flash sale discount",
      type: "fixed",
      value: 10,
      usageLimit: 40,
      usageCount: 38,
      minCart: 60,
      maxCart: 120,
      endDate: "2024-07-20",
      status: "inactive",
    },
    {
      id: 8,
      code: "LOYALTY",
      description: "Loyalty program discount",
      type: "percentage",
      value: 12,
      usageLimit: 999,
      usageCount: 150,
      minCart: 150,
      maxCart: 700,
      endDate: "2025-12-31",
      status: "active",
    },
    {
      id: 9,
      code: "BIGSAVE",
      description: "Big savings on selected items",
      type: "fixed",
      value: 50,
      usageLimit: 20,
      usageCount: 18,
      minCart: 300,
      maxCart: 1500,
      endDate: "2024-09-30",
      status: "active",
    },
    {
      id: 10,
      code: "WEEKEND",
      description: "Weekend special discount",
      type: "percentage",
      value: 8,
      usageLimit: 120,
      usageCount: 90,
      minCart: 80,
      maxCart: 400,
      endDate: "2024-07-28",
      status: "active",
    },
    {
      id: 11,
      code: "HOLIDAY2024",
      description: "Holiday season discount",
      type: "percentage",
      value: 15,
      usageLimit: 200,
      usageCount: 0,
      minCart: 100,
      maxCart: 500,
      endDate: "2024-12-25",
      status: "active",
    },
    {
      id: 12,
      code: "SPRINGCLEAN",
      description: "Spring cleaning sale",
      type: "fixed",
      value: 15,
      usageLimit: 60,
      usageCount: 5,
      minCart: 70,
      maxCart: 250,
      endDate: "2024-05-31",
      status: "inactive",
    },
  ])

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const totalPages = Math.ceil(filteredCoupons.length / PER_PAGE)
  const paginated = filteredCoupons.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => {
    setEditingCoupon(null)
    setFormCoupon({
      code: "",
      description: "",
      type: "percentage",
      value: 0,
      usageLimit: 0,
      minCart: 0,
      maxCart: 0,
      endDate: "",
      status: "active",
    })
    setShowDialog(true)
  }

  const openEdit = (coupon) => {
    setEditingCoupon(coupon.id)
    setFormCoupon({ ...coupon })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingCoupon) {
      setCoupons((prev) => prev.map((c) => (c.id === editingCoupon ? { ...formCoupon, usageCount: c.usageCount } : c)))
    } else {
      setCoupons((prev) => [...prev, { ...formCoupon, id: Date.now(), usageCount: 0 }])
    }
    setShowDialog(false)
  }

  const handleDelete = (id) => setCoupons((prev) => prev.filter((c) => c.id !== id))

  const toggleStatus = (id) =>
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)),
    )

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === "active").length,
    inactive: coupons.filter((c) => c.status === "inactive").length,
    usage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    savings: coupons.reduce((sum, c) => sum + c.value * c.usageCount, 0),
  }

  // Custom Pagination Component
  const CustomPagination = () => {
    const startEntry = (page - 1) * PER_PAGE + 1
    const endEntry = Math.min(page * PER_PAGE, filteredCoupons.length)
    const totalEntries = filteredCoupons.length

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5 // Max number of page buttons to show

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (page <= 3) {
          pages.push(1, 2, 3, 4, "...", totalPages)
        } else if (page >= totalPages - 2) {
          pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
          pages.push(1, "...", page - 1, page, page + 1, "...", totalPages)
        }
      }
      return pages
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
        {/* Left side - Entries info */}
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>
        {/* Right side - Navigation */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`${
              page === 1
                ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <div key={index}>
                {pageNum === "..." ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[32px] h-8 ${
                      page === pageNum ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : "hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`${
              page === totalPages
                ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    // Outermost container with responsive padding and overflow control
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4">
      {/* Header Section - Responsive */}
      <div className="w-full max-w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate dark:text-white">Coupon Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Create and manage discount coupons for your store
        </p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 w-full max-w-full">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Total Coupons</CardTitle>
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Active</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Inactive</CardTitle>
            <Ban className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Total Usage</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.usage}</div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Total Savings</CardTitle>
            <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.savings.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Coupons Card */}
      <Card className="w-full max-w-full">
        <CardHeader className="px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl truncate">Coupons</CardTitle>
              <CardDescription className="text-sm mt-1">
                Create and manage discount coupons for your store
              </CardDescription>
            </div>
            <Button onClick={openAdd} className="w-full sm:w-auto">
              {/* Full width on mobile */}
              <Plus className="mr-2 h-4 w-4" /> Add Coupon
            </Button>
          </div>
          {/* Search Bar - Responsive */}
          <div className="flex items-center space-x-2 mt-4 w-full max-w-full">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm text-sm" // Full width on mobile, max-width on larger screens
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 lg:px-6 overflow-x-hidden">
          {/* Desktop/Tablet Table View */}
          <div className="hidden lg:block w-full overflow-x-auto">
            {/* Allows table to scroll horizontally if needed */}
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "Code",
                    "Description",
                    "Type",
                    "Value",
                    "Usage",
                    "Min/Max Cart",
                    "Valid Until",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <TableHead key={h} className="text-xs font-medium">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.code}</TableCell>
                    <TableCell className="text-sm truncate max-w-[150px]">{c.description}</TableCell>{" "}
                    {/* Truncate long descriptions */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {c.type === "percentage" ? "%" : "$"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</TableCell>
                    {/* Usage bar with overflow-hidden on TableCell */}
                    <TableCell className="text-sm overflow-hidden">
                      <div className="text-sm">
                        {c.usageCount} / {c.usageLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${c.usageCount <= c.usageLimit ? "bg-blue-600" : "bg-red-500"}`}
                          style={{
                            width: `${(c.usageCount / c.usageLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      ${c.minCart} / ${c.maxCart}
                    </TableCell>
                    <TableCell className="text-sm">{c.endDate}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "destructive"} className="text-xs">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toggleStatus(c.id)}>
                          {c.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3 overflow-x-hidden">
            {/* Added overflow-x-hidden */}
            {paginated.map((coupon) => (
              <Card key={coupon.id} className="w-full max-w-full">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    {/* Coupon Header */}
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{coupon.code}</div>
                        <div className="text-xs text-muted-foreground truncate">{coupon.description}</div>
                      </div>
                      <Badge
                        variant={coupon.status === "active" ? "default" : "destructive"}
                        className="text-xs flex-shrink-0"
                      >
                        {coupon.status}
                      </Badge>
                    </div>
                    {/* Coupon Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Type:</span>
                        <div className="font-medium">
                          <Badge variant="outline" className="text-xs">
                            {coupon.type === "percentage" ? "%" : "$"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Value:</span>
                        <div className="font-medium">
                          {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        {" "}
                        {/* Added overflow-hidden here */}
                        <span className="text-muted-foreground text-xs">Usage:</span>
                        <div className="font-medium truncate">
                          {coupon.usageCount} / {coupon.usageLimit}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${coupon.usageCount <= coupon.usageLimit ? "bg-green-500" : "bg-red-500"}`}
                            style={{
                              width: `${coupon.usageLimit > 0 ? Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Min/Max Cart:</span>
                        <div className="font-medium truncate">
                          ${coupon.minCart} / ${coupon.maxCart}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">Valid Until:</span>
                        <div className="font-medium">{coupon.endDate}</div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(coupon.id)}
                        className="flex-shrink-0"
                      >
                        {coupon.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(coupon)} className="flex-shrink-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Custom Pagination */}
          <CustomPagination />
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit - Responsive */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          {/* Responsive width and height, with scroll */}
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: "code", label: "Code", type: "text" },
              { key: "description", label: "Description", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium">{f.label}:</label>
                <Input
                  placeholder={`Enter ${f.label.toLowerCase()}`}
                  value={formCoupon[f.key]}
                  onChange={(e) => setFormCoupon({ ...formCoupon, [f.key]: e.target.value })}
                  className="w-full" // Ensure input takes full width
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Type:</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm bg-background text-foreground" // Added bg/text for consistency
                value={formCoupon.type}
                onChange={(e) => setFormCoupon({ ...formCoupon, type: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            {["value", "usageLimit", "minCart", "maxCart"].map((key) => (
              <div key={key}>
                <label className="text-sm font-medium">
                  {key === "value"
                    ? "Value"
                    : key === "usageLimit"
                      ? "Usage Limit"
                      : key === "minCart"
                        ? "Min Cart Value"
                        : "Max Cart Value"}
                  :
                </label>
                <Input
                  type="number"
                  placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                  value={formCoupon[key]}
                  onChange={(e) =>
                    setFormCoupon({
                      ...formCoupon,
                      [key]: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-full" // Ensure input takes full width
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">End Date:</label>
              <Input
                type="date"
                value={formCoupon.endDate}
                onChange={(e) => setFormCoupon({ ...formCoupon, endDate: e.target.value })}
                className="w-full" // Ensure input takes full width
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingCoupon ? "Save Changes" : "Add Coupon"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CouponsPage
