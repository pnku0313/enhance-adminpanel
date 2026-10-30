// "use client";

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../../components/ui/Card";
// import Input from "../../components/ui/Input";
// import Button from "../../components/ui/Button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/Table";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import Swal from "sweetalert2";

// const API_URL = "http://127.0.0.1:8000/api/permissions";

// const PermissionSettingsPage = () => {
//   const [permissions, setPermissions] = useState([]); // all permissions
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedIds, setSelectedIds] = useState([]);

//   useEffect(() => {
//     fetchAllPermissions();
//   }, []);

//   const fetchAllPermissions = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem("token");

//       // 1. Fetch the first page to know how many pages there are
//       const firstResponse = await fetch(`${API_URL}?page=1`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const firstJson = await firstResponse.json();
//       if (!firstResponse.ok || !firstJson.data) {
//         throw new Error("Failed to fetch initial permissions");
//       }

//       let allPerms = [...firstJson.data];
//       const lastPage = firstJson.meta?.last_page ?? 1;

//       // 2. Fetch remaining pages in parallel (if more than 1)
//       const fetchPromises = [];
//       for (let p = 2; p <= lastPage; p++) {
//         fetchPromises.push(
//           fetch(`${API_URL}?page=${p}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }).then((res) => res.json())
//         );
//       }

//       const restResults = await Promise.all(fetchPromises);
//       for (const result of restResults) {
//         if (result && result.data) {
//           allPerms = allPerms.concat(result.data);
//         }
//       }

//       setPermissions(allPerms);
//     } catch (err) {
//       console.error("fetchAllPermissions error:", err);
//       setError("An error occurred while fetching all permissions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedIds.length === 0) {
//       Swal.fire("Info", "No permissions selected.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `You want to delete ${selectedIds.length} selected permissions?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete them!",
//     });

//     if (result.isConfirmed) {
//       try {
//         const token = localStorage.getItem("token");
//         await Promise.all(
//           selectedIds.map((id) =>
//             fetch(`${API_URL}/${id}`, {
//               method: "DELETE",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             })
//           )
//         );
//         // Refresh all data
//         await fetchAllPermissions();
//         setSelectedIds([]);
//         Swal.fire(
//           "Deleted!",
//           "Selected permissions have been deleted.",
//           "success"
//         );
//       } catch (err) {
//         console.error("bulk delete error:", err);
//         Swal.fire("Error!", "Failed to delete selected permissions.", "error");
//       }
//     }
//   };

//   const filteredPermissions = permissions.filter(
//     (perm) =>
//       perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       perm.guard_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
//   const startIndex = (page - 1) * itemsPerPage;
//   const endIndex = Math.min(
//     startIndex + itemsPerPage,
//     filteredPermissions.length
//   );
//   const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       const idsOnPage = paginatedPermissions.map((perm) => perm.id);
//       setSelectedIds((prev) => [...new Set([...prev, ...idsOnPage])]);
//     } else {
//       const idsOnPage = paginatedPermissions.map((perm) => perm.id);
//       setSelectedIds((prev) => prev.filter((id) => !idsOnPage.includes(id)));
//     }
//   };

//   const handleSelectRow = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 lg:px-6 py-4">
//       <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 dark:text-white">
//         Permission Settings
//       </h1>
//       <p className="text-muted-foreground text-sm sm:text-base mb-4">
//         Manage your system permissions
//       </p>

//       {error && (
//         <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
//       )}

//       <Card className="w-full max-w-full overflow-x-auto">
//         <CardHeader className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center">
//             <div className="flex flex-col space-y-2 sm:flex-1">
//               <CardTitle className="text-lg sm:text-xl">Permissions</CardTitle>
//               <CardDescription className="text-sm">
//                 View and manage your permissions
//               </CardDescription>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 onClick={handleBulkDelete}
//                 className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//               >
//                 Delete Selected
//               </Button>
//             </div>
//           </div>

//           {/* Top controls */}
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
//             <div>
//               Show{" "}
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(parseInt(e.target.value, 10));
//                   setPage(1);
//                 }}
//                 className="border p-1 rounded bg-transparent"
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>{" "}
//               entries
//             </div>
//             <div className="flex items-center rounded-md px-3 py-2 flex-1 max-w-xs sm:max-w-sm">
//               <Input
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setPage(1);
//                 }}
//                 className="border p-1 rounded bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0"
//               />
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="p-0 w-full">
//           <div className="overflow-x-auto w-full">
//             <Table className="min-w-[640px] w-full" id="permissions-table">
//               <TableHeader>
//                 <TableRow className="border border-black shadow-md">
//                   <TableHead className="w-[50px] text-center">
//                     <input
//                       type="checkbox"
//                       onChange={handleSelectAll}
//                       checked={
//                         paginatedPermissions.length > 0 &&
//                         paginatedPermissions.every((perm) =>
//                           selectedIds.includes(perm.id)
//                         )
//                       }
//                     />
//                   </TableHead>
//                   <TableHead className="min-w-[250px] w-[40%] text-center">
//                     Permission Name
//                   </TableHead>
//                   <TableHead className="min-w-[150px] w-[30%] text-center">
//                     Guard
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={3}
//                       className="text-center py-4 text-muted-foreground"
//                     >
//                       Loading...
//                     </TableCell>
//                   </TableRow>
//                 ) : paginatedPermissions.length === 0 ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={3}
//                       className="text-center py-4 text-muted-foreground"
//                     >
//                       No permissions found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   paginatedPermissions.map((perm) => (
//                     <TableRow
//                       key={perm.id}
//                       className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-900 dark:even:bg-gray-800"
//                     >
//                       <TableCell className="text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedIds.includes(perm.id)}
//                           onChange={() => handleSelectRow(perm.id)}
//                         />
//                       </TableCell>
//                       <TableCell className="font-medium text-center">
//                         {perm.name}
//                       </TableCell>
//                       <TableCell className="font-medium text-center">
//                         {perm.guard_name}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Pagination UI */}
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
//             <div className="text-sm text-muted-foreground">
//               Showing {paginatedPermissions.length === 0 ? 0 : startIndex + 1}{" "}
//               to {startIndex + paginatedPermissions.length} of{" "}
//               {filteredPermissions.length} entries
//             </div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <Button
//                 disabled={page === 1}
//                 onClick={() => setPage(page - 1)}
//                 size="sm"
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 <ChevronLeft className="h-4 w-4 mr-1" /> Previous
//               </Button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                 (num) => (
//                   <Button
//                     key={num}
//                     onClick={() => setPage(num)}
//                     size="sm"
//                     className={`px-3 py-1 border rounded ${
//                       page === num
//                         ? "bg-red-600 text-white"
//                         : "bg-transparent dark:text-white"
//                     }`}
//                   >
//                     {num}
//                   </Button>
//                 )
//               )}
//               <Button
//                 disabled={page === totalPages}
//                 onClick={() => setPage(page + 1)}
//                 size="sm"
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default PermissionSettingsPage;

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api/permissions";

const PermissionSettingsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  const fetchAllPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const firstResponse = await fetch(`${API_URL}?page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const firstJson = await firstResponse.json();
      if (!firstResponse.ok || !firstJson.data) {
        throw new Error("Failed to fetch initial permissions");
      }

      let allPerms = [...firstJson.data];
      const lastPage = firstJson.meta?.last_page ?? 1;

      const fetchPromises = [];
      for (let p = 2; p <= lastPage; p++) {
        fetchPromises.push(
          fetch(`${API_URL}?page=${p}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json())
        );
      }

      const restResults = await Promise.all(fetchPromises);
      for (const result of restResults) {
        if (result && result.data) {
          allPerms = allPerms.concat(result.data);
        }
      }

      setPermissions(allPerms);
    } catch (err) {
      console.error("fetchAllPermissions error:", err);
      setError("An error occurred while fetching all permissions.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.guard_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredPermissions.length
  );
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

  // pagination range with ellipsis
  const getPaginationRange = () => {
    const range = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1, 2); // always show 1 and 2
      if (page > 4) range.push("...");
      const start = Math.max(3, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) range.push(i);
      if (page < totalPages - 3) range.push("...");
      range.push(totalPages - 1, totalPages); // always show last 2
    }
    return range;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 dark:text-white">
        Permission Settings
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base mb-4">
        Manage your system permissions
      </p>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
      )}

      <Card className="w-full max-w-full overflow-x-auto">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center">
            <div className="flex flex-col space-y-2 sm:flex-1">
              <CardTitle className="text-lg sm:text-xl">Permissions</CardTitle>
              <CardDescription className="text-sm">
                View and manage your permissions
              </CardDescription>
            </div>
          </div>

          {/* Top controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              Show{" "}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="border p-1 rounded bg-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>{" "}
              entries
            </div>
            <div className="flex items-center rounded-md px-3 py-2 flex-1 max-w-xs sm:max-w-sm">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="border p-1 rounded bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[640px] w-full" id="permissions-table">
              <TableHeader>
                <TableRow className="border border-black shadow-md">
                  <TableHead className="min-w-[250px] w-[40%] text-center">
                    Permission Name
                  </TableHead>
                  <TableHead className="min-w-[150px] w-[30%] text-center">
                    Guard
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No permissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPermissions.map((perm) => (
                    <TableRow
                      key={perm.id}
                      className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-900 dark:even:bg-gray-800"
                    >
                      <TableCell className="font-medium text-center">
                        {perm.name}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {perm.guard_name}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination UI */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedPermissions.length === 0 ? 0 : startIndex + 1}{" "}
              to {startIndex + paginatedPermissions.length} of{" "}
              {filteredPermissions.length} entries
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                size="sm"
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {getPaginationRange().map((num, idx) =>
                num === "..." ? (
                  <span key={`dots-${idx}`} className="px-2">
                    ...
                  </span>
                ) : (
                  <Button
                    key={num}
                    onClick={() => setPage(num)}
                    size="sm"
                    className={`px-3 py-1 border rounded ${
                      num === 1 || num === 2
                        ? "bg-red-600 text-white"
                        : page === num
                    }`}
                  >
                    {num}
                  </Button>
                )
              )}

              <Button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                size="sm"
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionSettingsPage;
