"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/Dropdown";
import {
  DollarSign,
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Download,
} from "lucide-react";
import StatsCard from "../../components/common/Card";
import OrderStatusCard from "../../components/common/OrderStatusCard";
import ProductCard from "../../components/common/ProductCard";

const ReportsPage = () => {
  const [filter, setFilter] = useState("Monthly");
  const [selectedChart, setSelectedChart] = useState("revenue");

  // ✅ API state
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [chartData, setChartData] = useState([]); // <-- NEW: holds chart points derived from API totals
  const [loading, setLoading] = useState(true);

  // ✅ Date range state
  const [orderRange, setOrderRange] = useState({ from: "", to: "" });

  // 🔄 Fetch Reports API (common function)
  const fetchReports = async (params = {}, exportFile = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/reports",
        {
          params: exportFile ? { ...params, export: true } : params,
          headers: { Authorization: `Bearer ${token}` },
          responseType: exportFile ? "blob" : "json", // blob if exporting
        }
      );

      if (exportFile) {
        // Download Excel file
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        const filename = `report_${timestamp}.xlsx`;
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        // Normal JSON response -> update state
        console.log("📊 Reports API Response:", res.data);

        setStats(res.data.stats);

        if (res.data.top_products?.data) {
          setTopProducts(
            res.data.top_products.data.map((p) => ({
              name: p.product_name,
              sales: p.total_qty,
              revenue: p.total_sales,
              growth: 0,
            }))
          );
        } else {
          setTopProducts([]);
        }

        if (res.data.customer_segments) {
          setCustomerSegments([
            {
              segment: "New Customers",
              count: res.data.customer_segments.new_customers.count,
              percentage: res.data.customer_segments.new_customers.percentage,
              color: "bg-red-500",
            },
            {
              segment: "Returning Customers",
              count: res.data.customer_segments.returning_customers.count,
              percentage:
                res.data.customer_segments.returning_customers.percentage,
              color: "bg-gray-800",
            },
            {
              segment: "VIP Customers",
              count: res.data.customer_segments.vip_customers.count,
              percentage: res.data.customer_segments.vip_customers.percentage,
              color: "bg-red-300",
            },
          ]);
        } else {
          setCustomerSegments([]);
        }

        const fromLabel =
          (res.data.filters && res.data.filters.from) || orderRange.from || "";
        const toLabel =
          (res.data.filters && res.data.filters.to) || orderRange.to || "";
        const rangeLabel =
          fromLabel && toLabel ? `${fromLabel} - ${toLabel}` : "Current Range";

        if (res.data.stats) {
          const mappedChart = [
            {
              name: rangeLabel,
              revenue: Number(res.data.stats.total_revenue || 0),
              orders: Number(res.data.stats.total_orders || 0),
              customers: Number(res.data.stats.new_customers || 0),
              avgOrder: Number(res.data.stats.avg_order_value || 0),
            },
          ];
          setChartData(mappedChart);
        } else {
          setChartData([]);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      setLoading(false);
      setChartData([]);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchReports({ filter: "last_30_days" });
  }, []);

  const handleExportOrders = (type) => {
    let filter = null;

    switch (type) {
      case "today":
        filter = "today";
        break;
      case "last7days":
        filter = "last_7_days";
        break;
      case "last30days":
        filter = "last_30_days";
        break;
      case "pending_orders":
        filter = "pending_orders";
        break;
      case "paid_orders":
        filter = "paid_orders";
        break;
      case "unpaid_orders":
        filter = "unpaid_orders";
        break;
      case "unfulfilled_orders":
        filter = "unfulfilled_orders";
        break;
      case "high_value_orders":
        filter = "high_value_orders";
        break;
      case "low_value_orders":
        filter = "low_value_orders";
        break;
      default:
        break;
    }

    if (filter) {
      fetchReports({ filter }); // UI update
      fetchReports({ filter }, true); // Excel export
    }
  };

  // ✅ Date Range Export + UI update
  const handleExportOrdersRange = () => {
    if (orderRange.from && orderRange.to) {
      const params = {
        filter: "custom",
        from: orderRange.from,
        to: orderRange.to,
      };
      fetchReports(params); // UI update
      fetchReports(params, true); // Excel export
    }
  };

  // ✅ Products Export + UI update
  const handleExportProducts = (type) => {
    let params = {};

    if (type === "last7days") params = { filter: "last_7_days" };
    else if (type === "last30days") params = { filter: "last_30_days" };
    else if (type === "all") params = {};

    if (params) {
      fetchReports(params); // UI update
      fetchReports(params, true); // Excel export
    }
  };

  // ---------- render chart using dynamic chartData derived from API ----------
  const renderChart = () => {
    if (!chartData || chartData.length === 0)
      return <p className="p-4">No chart data for selected range.</p>;

    switch (selectedChart) {
      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
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
            <BarChart data={chartData}>
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
            <AreaChart data={chartData}>
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
            <LineChart data={chartData}>
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

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
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
                  onClick={() => handleExportOrders("pending_orders")}
                >
                  Pending Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("paid_orders")}
                >
                  Paid Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("unpaid_orders")}
                >
                  Unpaid Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("unfulfilled_orders")}
                >
                  Unfulfilled Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("high_value_orders")}
                >
                  High Value Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportOrders("low_value_orders")}
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
                {/* <DropdownMenuItem
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-300"
                  onClick={() => handleExportProducts("all")}
                >
                  All Time
                </DropdownMenuItem> */}

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

      {/* ✅ Stats from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.total_revenue || 0}`}
          icon={<IndianRupee className="h-6 w-6" />}
          description="This period"
          onClick={() => setSelectedChart("revenue")}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={<ShoppingCart className="h-6 w-6" />}
          description="Orders count"
          onClick={() => setSelectedChart("orders")}
        />
        <StatsCard
          title="New Customers"
          value={stats?.new_customers || 0}
          icon={<Users className="h-6 w-6" />}
          description="Joined this period"
          onClick={() => setSelectedChart("customers")}
        />
        <StatsCard
          title="Avg Order Value"
          value={`₹${stats?.avg_order_value || 0}`}
          icon={<Package className="h-6 w-6" />}
          description="Average order"
          onClick={() => setSelectedChart("avgOrder")}
        />
      </div>

      {/* ✅ Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Trend Overview</CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* ✅ API-driven Top Products & Customer Segments */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <ProductCard
          title="Top Products"
          description="Best performing products"
          topProducts={topProducts}
        />
        <OrderStatusCard
          title="Customer Segments"
          description="Customer distribution"
          reportStatus={customerSegments}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
