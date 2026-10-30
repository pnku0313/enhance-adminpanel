"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import {
  Search,
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ORDERS_PER_PAGE = 5

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [customerFilter, setCustomerFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const initialOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      email: "john@example.com",
      date: "2024-01-15",
      status: "pending",
      total: 299.99,
      items: 3,
      tracking: "",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      email: "jane@example.com",
      date: "2024-01-14",
      status: "shipped",
      total: 149.99,
      items: 2,
      tracking: "TRK123456789",
    },
    {
      id: "#ORD-003",
      customer: "Bob Johnson",
      email: "bob@example.com",
      date: "2024-01-13",
      status: "delivered",
      total: 89.99,
      items: 1,
      tracking: "TRK987654321",
    },
    {
      id: "#ORD-004",
      customer: "Alice Brown",
      email: "alice@example.com",
      date: "2024-01-12",
      status: "pending",
      total: 120.0,
      items: 2,
      tracking: "",
    },
    {
      id: "#ORD-005",
      customer: "Steve Parker",
      email: "steve@example.com",
      date: "2024-01-11",
      status: "shipped",
      total: 180.75,
      items: 4,
      tracking: "TRK1122334455",
    },
    {
      id: "#ORD-006",
      customer: "Rachel Green",
      email: "rachel@example.com",
      date: "2024-01-10",
      status: "delivered",
      total: 210.5,
      items: 3,
      tracking: "TRK99887766",
    },
    {
      id: "#ORD-007",
      customer: "Mike Wilson",
      email: "mike@example.com",
      date: "2024-01-09",
      status: "pending",
      total: 350.25,
      items: 5,
      tracking: "",
    },
    {
      id: "#ORD-008",
      customer: "Sarah Davis",
      email: "sarah@example.com",
      date: "2024-01-08",
      status: "shipped",
      total: 199.99,
      items: 3,
      tracking: "TRK555666777",
    },
    {
      id: "#ORD-009",
      customer: "Tom Anderson",
      email: "tom@example.com",
      date: "2024-01-07",
      status: "delivered",
      total: 89.5,
      items: 1,
      tracking: "TRK888999000",
    },
    {
      id: "#ORD-010",
      customer: "Lisa Johnson",
      email: "lisa@example.com",
      date: "2024-01-06",
      status: "pending",
      total: 275.0,
      items: 4,
      tracking: "",
    },
    {
      id: "#ORD-011",
      customer: "David Brown",
      email: "david@example.com",
      date: "2024-01-05",
      status: "shipped",
      total: 125.75,
      items: 2,
      tracking: "TRK111222333",
    },
    {
      id: "#ORD-012",
      customer: "Emma Wilson",
      email: "emma@example.com",
      date: "2024-01-04",
      status: "delivered",
      total: 450.0,
      items: 6,
      tracking: "TRK444555666",
    },
  ]

  const [ordersData, setOrdersData] = useState(initialOrders)

  const handleStatusChange = (id, newStatus) => {
    const updated = ordersData.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    setOrdersData(updated)
  }

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesCustomer = customerFilter === "" || order.customer.toLowerCase().includes(customerFilter.toLowerCase())
    const matchesDate = dateFilter === "" || order.date === dateFilter
    return matchesSearch && matchesStatus && matchesCustomer && matchesDate
  })

  // Paginate filteredOrders
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE)

  // Calculate pagination info
  const startEntry = (page - 1) * ORDERS_PER_PAGE + 1
  const endEntry = Math.min(page * ORDERS_PER_PAGE, filteredOrders.length)
  const totalEntries = filteredOrders.length

  // Fixed Export CSV function for all devices
  const exportCSV = () => {
    try {
      const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Items", "Total", "Tracking"]
      const rows = filteredOrders.map((o) => [
        o.id,
        `"${o.customer}"`, // Wrap in quotes to handle commas
        `"${o.email}"`,
        o.date,
        o.status,
        o.items,
        o.total,
        `"${o.tracking || "-"}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create blob with proper MIME type
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      })

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const filename = `orders_${timestamp}.csv`

      // Check if we're on mobile/tablet (iOS Safari, Android Chrome, etc.)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      if (isMobile || isIOS) {
        // For mobile devices, use a different approach
        const url = URL.createObjectURL(blob)

        // Try to open in new window first (works on most mobile browsers)
        const newWindow = window.open(url, "_blank")

        if (!newWindow) {
          // Fallback: create a temporary link and trigger download
          const tempLink = document.createElement("a")
          tempLink.href = url
          tempLink.download = filename
          tempLink.style.display = "none"

          // Add to DOM, click, and remove
          document.body.appendChild(tempLink)

          // Use setTimeout to ensure the link is in DOM
          setTimeout(() => {
            tempLink.click()
            document.body.removeChild(tempLink)
            URL.revokeObjectURL(url)
          }, 100)
        } else {
          // Clean up the URL after a delay
          setTimeout(() => {
            URL.revokeObjectURL(url)
            newWindow.close()
          }, 1000)
        }
      } else {
        // Desktop approach
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.style.display = "none"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }

      // Show success message (optional)
      console.log("CSV export initiated successfully")
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Container with proper overflow control */}
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
        {/* Header Section - Responsive */}
        <div className="w-full max-w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate dark:text-white">Order Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Manage and process customer orders</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-5 w-full max-w-full">
          {["Total Orders", "Pending", "Shipped", "Delivered", "Cancelled"].map((label, idx) => {
            const Icon = [Package, Clock, Truck, CheckCircle, XCircle][idx]
            const value =
              label === "Total Orders"
                ? filteredOrders.length
                : filteredOrders.filter((o) => o.status === label.toLowerCase()).length
            return (
              <Card key={label} className="min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{label}</CardTitle>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Orders Card */}
        <Card className="w-full max-w-full">
          <CardHeader className="px-3 sm:px-4 lg:px-6">
            {/* Card Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">Orders</CardTitle>
                <CardDescription className="text-sm mt-1">Manage and process customer orders</CardDescription>
              </div>
              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto text-sm"
                >
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button onClick={exportCSV} className="w-full sm:w-auto text-sm">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>

            {/* Filters Section - Responsive */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="w-full max-w-full">
                  <label className="block text-xs sm:text-sm mb-1">Filter by Status</label>
                  <select
                    className="w-full rounded border px-2 py-1 text-xs sm:text-sm  text-black dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="w-full max-w-full">
                  <label className="block text-xs sm:text-sm mb-1">Filter by Customer</label>
                  <Input
                    placeholder="Enter customer name"
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
                <div className="w-full max-w-full">
                  <label className="block text-xs sm:text-sm mb-1">Filter by Date</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Search Bar - Responsive */}
            <div className="flex items-center space-x-2 mt-4 w-full max-w-full">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm text-sm"
              />
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-4 lg:px-6">
            {/* Desktop/Tablet Table View */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium">Order ID</TableHead>
                    <TableHead className="text-xs font-medium">Customer</TableHead>
                    <TableHead className="text-xs font-medium">Date</TableHead>
                    <TableHead className="text-xs font-medium">Status</TableHead>
                    <TableHead className="text-xs font-medium">Items</TableHead>
                    <TableHead className="text-xs font-medium">Total</TableHead>
                    <TableHead className="text-xs font-medium">Tracking</TableHead>
                    <TableHead className="text-right text-xs font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm truncate max-w-[150px]">{order.customer}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{order.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{order.date}</TableCell>
                      <TableCell>
                        <select
                          className="rounded border px-2 py-1 text-xs  text-black dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="returned">Returned</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-sm">{order.items}</TableCell>
                      <TableCell className="text-sm">${order.total}</TableCell>
                      <TableCell>
                        {order.tracking ? (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded truncate max-w-[100px] inline-block">
                            {order.tracking}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
              {paginatedOrders.map((order) => (
                <Card key={order.id} className="w-full max-w-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      {/* Order Header */}
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{order.id}</div>
                          <div className="text-xs text-muted-foreground truncate">{order.date}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                          className="flex-shrink-0 ml-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Customer Info */}
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{order.customer}</div>
                        <div className="text-xs text-muted-foreground truncate">{order.email}</div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Items:</span>
                          <div className="font-medium">{order.items}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Total:</span>
                          <div className="font-medium">${order.total}</div>
                        </div>
                      </div>

                      {/* Status and Tracking */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="w-full sm:w-auto">
                          <label className="text-xs text-muted-foreground">Status:</label>
                          <select
                            className="w-full mt-1 rounded border px-2 py-1 text-xs bg-white text-black dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned">Returned</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="w-full sm:w-auto">
                          <span className="text-xs text-muted-foreground">Tracking:</span>
                          <div className="mt-1">
                            {order.tracking ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                                {order.tracking}
                              </code>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Pagination - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              {/* Entries Info - Left Side */}
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                {totalEntries > 0 ? (
                  <span>
                    Showing {startEntry} to {endEntry} of {totalEntries} entries
                  </span>
                ) : (
                  <span>No entries found</span>
                )}
              </div>

              {/* Pagination Controls - Right Side */}
              <div className="flex items-center gap-2 order-1 sm:order-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
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
                          className="min-w-[32px] h-8 text-sm"
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
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal - Responsive */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold truncate pr-4">Order Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-xl hover:bg-gray-100 dark:hover:bg-zinc-800 rounded p-1 flex-shrink-0"
                  >
                    &times;
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ["Order ID", selectedOrder.id],
                    ["Customer", selectedOrder.customer],
                    ["Email", selectedOrder.email],
                    ["Date", selectedOrder.date],
                    ["Status", selectedOrder.status],
                    ["Items", selectedOrder.items],
                    ["Total", `$${selectedOrder.total}`],
                    ["Tracking", selectedOrder.tracking || "-"],
                  ].map(([label, value], idx) => (
                    <div key={label}>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-muted-foreground flex-shrink-0">{label}:</span>
                        <span className="text-right break-all">{value}</span>
                      </div>
                      {idx < 7 && <hr className="my-2 border-gray-200 dark:border-zinc-700" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
