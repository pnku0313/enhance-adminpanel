// code complete with pagination

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "../../components/ui/Card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/Table";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import axios from "axios";

// const StockAlertPage = () => {
//   const [products, setProducts] = useState([]);
//   const [expandedProductIds, setExpandedProductIds] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [lastPage, setLastPage] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("token");

//   // Fetch stock alerts with backend pagination, search, perPage
//   const fetchStockAlerts = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `http://127.0.0.1:8000/api/stock-alerts`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             perPage: itemsPerPage,
//             page,
//             search: searchTerm,
//             sortDir: "desc",
//           },
//         }
//       );

//       setProducts(res.data.data || []);
//       setTotal(res.data.meta?.total || 0); // total number of records
//       setLastPage(res.data.meta?.last_page || 1); // total pages
//     } catch (error) {
//       console.error("Error fetching stock alerts:", error.response || error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStockAlerts();
//   }, [page, itemsPerPage, searchTerm]);

//   // Toggle product accordion
//   const toggleExpand = (id) => {
//     setExpandedProductIds((prev) =>
//       prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="space-y-4 px-4 py-6">
//       <h1 className="text-3xl font-bold mb-4 dark:text-white">Stock Alerts</h1>
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <div>
//               <CardTitle>Low Stock Products</CardTitle>
//               <CardDescription>
//                 Click on a row to view variant details
//               </CardDescription>
//             </div>
//             <div className="flex gap-2 items-center">
//               <label className="text-sm">Search:</label>
//               <Input
//                 placeholder="Search by name..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setPage(1); // reset to first page
//                 }}
//                 className="w-64"
//               />
//               <label className="text-sm ml-4">Show</label>
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setPage(1);
//                 }}
//                 className="dark:bg-slate-700 border rounded px-2 py-1"
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead></TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Slug</TableHead>
//                   <TableHead>Brand</TableHead>
//                   <TableHead>Season</TableHead>
//                   <TableHead>Fabric</TableHead>
//                   <TableHead>Total Stock</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {!loading && products.length > 0 ? (
//                   products.map((product) => (
//                     <React.Fragment key={product.id}>
//                       <TableRow
//                         className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
//                         onClick={() => toggleExpand(product.id)}
//                       >
//                         <TableCell>
//                           {expandedProductIds.includes(product.id) ? (
//                             <ChevronDown size={18} />
//                           ) : (
//                             <ChevronRight size={18} />
//                           )}
//                         </TableCell>
//                         <TableCell>{product.name}</TableCell>
//                         <TableCell>{product.slug}</TableCell>
//                         <TableCell>{product.brand || "—"}</TableCell>
//                         <TableCell>{product.season || "—"}</TableCell>
//                         <TableCell>{product.fabric || "—"}</TableCell>
//                         <TableCell>{product.stock ?? "—"}</TableCell>
//                       </TableRow>

//                       {expandedProductIds.includes(product.id) && (
//                         <TableRow>
//                           <TableCell
//                             colSpan={7}
//                             className="bg-gray-50 dark:bg-gray-900"
//                           >
//                             {product.variants && product.variants.length > 0 ? (
//                               <div className="p-2">
//                                 <p className="font-semibold mb-2">Variants</p>
//                                 <Table className="w-full border">
//                                   <TableHeader>
//                                     <TableRow>
//                                       <TableHead>Color</TableHead>
//                                       <TableHead>Size</TableHead>
//                                       <TableHead>Stock</TableHead>
//                                     </TableRow>
//                                   </TableHeader>
//                                   <TableBody>
//                                     {product.variants.map((variant) => (
//                                       <TableRow key={variant.id}>
//                                         <TableCell>{variant.color}</TableCell>
//                                         <TableCell>{variant.size}</TableCell>
//                                         <TableCell
//                                           className={
//                                             variant.stock === 0
//                                               ? "text-red-500 font-bold"
//                                               : "text-green-600"
//                                           }
//                                         >
//                                           {variant.stock}
//                                         </TableCell>
//                                       </TableRow>
//                                     ))}
//                                   </TableBody>
//                                 </Table>
//                               </div>
//                             ) : (
//                               <p className="text-center py-4 text-gray-500">
//                                 No variants available.
//                               </p>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </React.Fragment>
//                   ))
//                 ) : loading ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-6">
//                       Loading...
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-6">
//                       No products found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Pagination Controls */}
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
//             <div className="text-sm text-gray-600 dark:text-white ml-3 mb-4">
//               Showing {total === 0 ? 0 : (page - 1) * itemsPerPage + 1} to{" "}
//               {page * itemsPerPage > total ? total : page * itemsPerPage} of{" "}
//               {total} entries
//             </div>
//             <div className="flex gap-2 flex-wrap">
//               <Button
//                 size="sm"
//                 disabled={page === 1}
//                 onClick={() => setPage(page - 1)}
//               >
//                 Previous
//               </Button>
//               {[...Array(lastPage)].map((_, i) => (
//                 <Button
//                   key={i}
//                   size="sm"
//                   variant={page === i + 1 ? "default" : "outline"}
//                   onClick={() => setPage(i + 1)}
//                 >
//                   {i + 1}
//                 </Button>
//               ))}
//               <Button
//                 size="sm"
//                 disabled={page === lastPage}
//                 onClick={() => setPage(page + 1)}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default StockAlertPage;

// code without pagination

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
} from "lucide-react";
import axios from "axios";

const StockAlertPage = () => {
  const [products, setProducts] = useState([]);
  const [expandedProductIds, setExpandedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const token = localStorage.getItem("token");

  // Fetch stock alerts
  const fetchStockAlerts = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/stock-alerts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching stock alerts:", error.response || error);
    }
  };

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  // Toggle product accordion
  const toggleExpand = (id) => {
    setExpandedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Filtered by search
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Stock Alerts</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>
                Click on a row to view variant details
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm">Search:</label>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-64"
              />
              <label className="text-sm ml-4">Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="dark:bg-slate-700 border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Fabric</TableHead>
                  <TableHead>Total Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <React.Fragment key={product.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => toggleExpand(product.id)}
                      >
                        <TableCell>
                          {expandedProductIds.includes(product.id) ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.slug}</TableCell>
                        <TableCell>{product.brand || "—"}</TableCell>
                        <TableCell>{product.season || "—"}</TableCell>
                        <TableCell>{product.fabric || "—"}</TableCell>
                        <TableCell>{product.stock ?? "—"}</TableCell>
                      </TableRow>

                      {expandedProductIds.includes(product.id) && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="bg-gray-50 dark:bg-gray-900"
                          >
                            {product.variants && product.variants.length > 0 ? (
                              <div className="p-2">
                                <p className="font-semibold mb-2">Variants</p>
                                <Table className="w-full border">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Color</TableHead>
                                      <TableHead>Size</TableHead>
                                      <TableHead>Stock</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {product.variants.map((variant) => (
                                      <TableRow key={variant.id}>
                                        <TableCell>{variant.color}</TableCell>
                                        <TableCell>{variant.size}</TableCell>
                                        <TableCell
                                          className={
                                            variant.stock === 0
                                              ? "text-red-500 font-bold"
                                              : "text-green-600"
                                          }
                                        >
                                          {variant.stock}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-center py-4 text-gray-500">
                                No variants available.
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-red-500 text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-red-500 text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlertPage;
