"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DesktopView = ({
  paginatedProducts,
  searchTerm,
  setSearchTerm,
  openEdit,
  openView,
  deleteProd,
  openDropdownId,
  setOpenDropdownId,
  selectedProductIds,
  toggleProductSelection,
  toggleAllProductsSelection,
  isAllSelected,
  page,
  setPage,
  totalPages,
  startEntry,
  endEntry,
  totalEntries,
  getPageNumbers,
}) => {
  return (
    <>
      <div className="flex items-center border rounded-md px-3 py-2 flex-1 min-w-0 mb-4">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none p-0 ml-2 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0"
        />
      </div>

      <div className="hidden lg:block w-full">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[640px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAllProductsSelection}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead className="min-w-[200px] w-[30%]">Product</TableHead>
                <TableHead className="min-w-[150px] w-[20%]">
                  Category
                </TableHead>
                <TableHead className="min-w-[100px] w-[15%]">Price</TableHead>
                <TableHead className="min-w-[80px] w-[10%]">Stock</TableHead>
                <TableHead className="min-w-[100px] w-[15%]">Status</TableHead>
                <TableHead className="min-w-[80px] w-[10%] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell className="max-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          p.image ||
                          "/placeholder.svg?height=40&width=40&query=product"
                        }
                        alt={p.name}
                        className="h-10 w-10 object-cover rounded-md flex-shrink-0"
                      />
                      <span className="truncate font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-0">
                    <span className="truncate block">{p.category}</span>
                  </TableCell>
                  <TableCell className="font-medium">${p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "Active" ? "default" : "destructive"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === p.id ? null : p.id
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openDropdownId === p.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-36 bg-white dark:bg-gray-800 shadow-lg rounded-md border overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openView(p);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(p);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProd(p.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination for Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <div key={index}>
                {pageNum === "..." ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 text-sm min-w-[32px] ${
                      page === pageNum
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default DesktopView;
