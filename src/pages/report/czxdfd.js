"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/Dropdown";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
} from "lucide-react";
import StatsCard from "../components/common/Card"; // ✅ Reusable Card
import OrderStatusCard from "../components/common/OrderStatusCard";
import ProductCard from "../components/common/ProductCard";

// 📦 Sample Orders Data
const ordersData = [
  {
    id: 1,
    date: "2025-08-14",
    status: "Pending",
    paymentStatus: "Unpaid",
    fulfillmentStatus: "Unfulfilled",
    total: 120,
    channel: "Website",
    products: [
      { name: "Wireless Headphones", qty: 2 },
      { name: "USB-C Cable", qty: 1 },
    ],
  },
  {
    id: 2,
    date: "2025-08-13",
    status: "Shipped",
    paymentStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
    total: 850,
    channel: "Website",
    products: [{ name: "Laptop Stand", qty: 1 }],
  },
  {
    id: 3,
    date: "2025-08-01",
    status: "Delivered",
    paymentStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
    total: 40,
    channel: "Website",
    products: [{ name: "Phone Case", qty: 3 }],
  },
  {
    id: 4,
    date: "2025-07-30",
    status: "Cancelled",
    paymentStatus: "Refunded",
    fulfillmentStatus: "Unfulfilled",
    total: 60,
    channel: "Website",
    products: [{ name: "Smart Watch", qty: 1 }],
  },
  {
    id: 5,
    date: "2025-08-10",
    status: "Processing",
    paymentStatus: "Paid",
    fulfillmentStatus: "Partially Fulfilled",
    total: 1200,
    channel: "Website",
    products: [
      { name: "Wireless Headphones", qty: 1 },
      { name: "Smart Watch", qty: 2 },
    ],
  },
];

const isWithinDays = (orderDate, days) => {
  const now = new Date();
  const target = new Date(orderDate);
  const diff = (now - target) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

// 📌 Normal Order Filters
const filterOrders = (type) => {
  switch (type) {
    case "today":
      return ordersData.filter(
        (o) => new Date(o.date).toDateString() === new Date().toDateString()
      );
    case "last7days":
      return ordersData.filter((o) => isWithinDays(o.date, 7));
    case "last30days":
      return ordersData.filter((o) => isWithinDays(o.date, 30));
    case "pending":
      return ordersData.filter((o) => o.status === "Pending");
    case "paid":
      return ordersData.filter((o) => o.paymentStatus === "Paid");
    case "unpaid":
      return ordersData.filter((o) => o.paymentStatus === "Unpaid");
    case "unfulfilled":
      return ordersData.filter((o) => o.fulfillmentStatus === "Unfulfilled");
    case "highValue":
      return ordersData.filter((o) => o.total > 500);
    case "lowValue":
      return ordersData.filter((o) => o.total < 50);
    default:
      return ordersData;
  }
};

// 📌 Product-Based Order Summary
const filterOrdersByProduct = (timeRange) => {
  let filteredOrders = [];
  if (timeRange === "last7days") {
    filteredOrders = ordersData.filter((o) => isWithinDays(o.date, 7));
  } else if (timeRange === "last30days") {
    filteredOrders = ordersData.filter((o) => isWithinDays(o.date, 30));
  } else {
    filteredOrders = ordersData;
  }

  const productSummary = {};
  filteredOrders.forEach((order) => {
    order.products.forEach((prod) => {
      if (!productSummary[prod.name]) {
        productSummary[prod.name] = 0;
      }
      productSummary[prod.name] += prod.qty;
    });
  });

  return Object.entries(productSummary).map(([name, count]) => ({
    product: name,
    totalOrders: count,
  }));
};

// 📌 CSV Export for Orders
const handleExportOrders = (filterType) => {
  const data = filterOrders(filterType);
  if (!data.length) {
    alert("No orders found for this filter.");
    return;
  }
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => (typeof val === "string" ? `"${val}"` : val))
      .join(",")
  );
  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orders_${filterType}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 📌 CSV Export for Product Summary
const handleExportProducts = (timeRange) => {
  const data = filterOrdersByProduct(timeRange);
  if (!data.length) {
    alert("No products found for this range.");
    return;
  }
  const header = "Product,Total Orders";
  const rows = data.map((row) => `${row.product},${row.totalOrders}`);
  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `product_orders_${timeRange}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Date Range Export Helpers ---
const filterOrdersByDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return ordersData.filter((o) => {
    const d = new Date(o.date);
    return d >= startDate && d <= endDate;
  });
};

const filterProductsByDateRange = (start, end) => {
  const filteredOrders = filterOrdersByDateRange(start, end);
  const productSummary = {};
  filteredOrders.forEach((order) => {
    order.products.forEach((prod) => {
      if (!productSummary[prod.name]) {
        productSummary[prod.name] = 0;
      }
      productSummary[prod.name] += prod.qty;
    });
  });
  return Object.entries(productSummary).map(([name, count]) => ({
    product: name,
    totalOrders: count,
  }));
};

const ReportsPage = () => {
  const [filter, setFilter] = useState("Monthly");
  const [selectedChart, setSelectedChart] = useState("revenue");

  // Date range state for export
  const [orderRange, setOrderRange] = useState({ from: "", to: "" });
  const [productRange, setProductRange] = useState({ from: "", to: "" });

  // 🔄 CSV Export Logic
  const handleExport = () => {
    const data = chartData[filter];
    if (!data || !data.length) return;
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === "string" ? `"${val}"` : val))
        .join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date range export for orders
  const handleExportOrdersRange = () => {
    if (!orderRange.from || !orderRange.to) {
      alert("Please select both start and end dates.");
      return;
    }
    const data = filterOrdersByDateRange(orderRange.from, orderRange.to);
    if (!data.length) {
      alert("No orders found for this range.");
      return;
    }
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === "string" ? `"${val}"` : val))
        .join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `orders_${orderRange.from}_to_${orderRange.to}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date range export for products
  const handleExportProductsRange = () => {
    if (!productRange.from || !productRange.to) {
      alert("Please select both start and end dates.");
      return;
    }
    const data = filterProductsByDateRange(productRange.from, productRange.to);
    if (!data.length) {
      alert("No products found for this range.");
      return;
    }
    const header = "Product,Total Orders";
    const rows = data.map((row) => `${row.product},${row.totalOrders}`);
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `product_orders_${productRange.from}_to_${productRange.to}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = {
    Monthly: [
      {
        name: "Jan",
        revenue: 280000,
        orders: 1200,
        customers: 400,
        avgOrder: 180,
      },
      {
        name: "Feb",
        revenue: 300000,
        orders: 1300,
        customers: 450,
        avgOrder: 190,
      },
      {
        name: "Mar",
        revenue: 320000,
        orders: 1400,
        customers: 500,
        avgOrder: 200,
      },
    ],
    Weekly: [
      {
        name: "Week 1",
        revenue: 85000,
        orders: 300,
        customers: 100,
        avgOrder: 180,
      },
      {
        name: "Week 2",
        revenue: 95000,
        orders: 330,
        customers: 120,
        avgOrder: 188,
      },
    ],
    Yearly: [
      {
        name: "2022",
        revenue: 2500000,
        orders: 15500,
        customers: 6000,
        avgOrder: 161,
      },
      {
        name: "2023",
        revenue: 2750000,
        orders: 16000,
        customers: 6400,
        avgOrder: 172,
      },
    ],
    Currently: [
      {
        name: "Today",
        revenue: 30000,
        orders: 120,
        customers: 55,
        avgOrder: 250,
      },
    ],
  };

  const topProducts = [
    { name: "Wireless Headphones", sales: 1234, revenue: 24680, growth: 12.5 },
    { name: "Smart Watch", sales: 987, revenue: 19740, growth: 8.3 },
    { name: "Laptop Stand", sales: 756, revenue: 15120, growth: -2.1 },
    { name: "USB-C Cable", sales: 654, revenue: 6540, growth: 15.7 },
    { name: "Phone Case", sales: 543, revenue: 8145, growth: 5.2 },
  ];

  const customerSegments = [
    {
      segment: "New Customers",
      count: 234,
      percentage: 35,
      color: "bg-red-500",
    },
    {
      segment: "Returning Customers",
      count: 456,
      percentage: 45,
      color: "bg-gray-800",
    },
    {
      segment: "VIP Customers",
      count: 123,
      percentage: 20,
      color: "bg-red-300",
    },
  ];

  const renderChart = () => {
    const data = chartData[filter];
    switch (selectedChart) {
      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "orders":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "customers":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorCustomers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "avgOrder":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgOrder"
                stroke="#3b82f6"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your store performance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Orders Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center w-full sm:w-auto justify-center">
                <Download className="mr-2 h-4 w-4" /> Export Orders
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              className="min-w-[220px] max-h-[300px] overflow-y-auto z-[9999] bg-white text-black shadow-lg rounded-md p-0 mt-1"
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("today")}
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("last7days")}
                >
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("last30days")}
                >
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("pending")}
                >
                  Pending Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("paid")}
                >
                  Paid Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("unpaid")}
                >
                  Unpaid Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("unfulfilled")}
                >
                  Unfulfilled Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("highValue")}
                >
                  High Value Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("lowValue")}
                >
                  Low Value Orders
                </DropdownMenuItem>

                {/* Custom Date Range */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div
                    className="flex flex-col gap-2 w-full px-4 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-semibold text-xs">
                      Custom Date Range
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs w-10">From</span>
                      <input
                        type="date"
                        className="border dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-transparent cursor-pointer"
                        value={orderRange.from}
                        onChange={(e) =>
                          setOrderRange((r) => ({ ...r, from: e.target.value }))
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs w-10">To</span>
                      <input
                        type="date"
                        className="border dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-transparent cursor-pointer"
                        value={orderRange.to}
                        onChange={(e) =>
                          setOrderRange((r) => ({ ...r, to: e.target.value }))
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      className="mt-1 w-full justify-center"
                      onClick={handleExportOrdersRange}
                    >
                      Export Range
                    </Button>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Product Orders Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center w-full sm:w-auto justify-center">
                <Download className="mr-2 h-4 w-4" /> Export Product Orders
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              className="min-w-[220px] z-[9999] bg-white text-black  shadow-lg rounded-md p-0 overflow-hidden mt-1"
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportProducts("last7days")}
                >
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportProducts("last30days")}
                >
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportProducts("all")}
                >
                  All Time
                </DropdownMenuItem>

                {/* Custom Date Range */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div
                    className="flex flex-col gap-2 w-full px-4 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-semibold text-xs">
                      Custom Date Range
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs w-10">From</span>
                      <input
                        type="date"
                        className="border dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-transparent cursor-pointer"
                        value={orderRange.from}
                        onChange={(e) =>
                          setOrderRange((r) => ({ ...r, from: e.target.value }))
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs w-10">To</span>
                      <input
                        type="date"
                        className="border dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-transparent cursor-pointer"
                        value={orderRange.to}
                        onChange={(e) =>
                          setOrderRange((r) => ({ ...r, to: e.target.value }))
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      className="mt-1 w-full justify-center"
                      onClick={handleExportOrdersRange}
                    >
                      Export Range
                    </Button>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$2,800,000"
          icon={<DollarSign className="h-6 w-6" />}
          description="This year"
        />
        <StatsCard
          title="Total Orders"
          value="15,500"
          icon={<ShoppingCart className="h-6 w-6" />}
          description="All completed"
        />
        <StatsCard
          title="Customers"
          value="6,000"
          icon={<Users className="h-6 w-6" />}
          description="Active users"
        />
        <StatsCard
          title="Products"
          value="1,200"
          icon={<Package className="h-6 w-6" />}
          description="Available items"
        />
      </div>
      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Trend Overview</CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* Bottom Section (Top Products & Customer Segments) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <ProductCard
          title="Top Products"
          description="Best performing products this month"
          topProducts={topProducts}
        />
        <OrderStatusCard
          title="Customer Segments"
          description="Customer distribution by segment"
          reportStatus={customerSegments}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
