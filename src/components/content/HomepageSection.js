"use client";
import React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const HomepageSection = ({ onStatsUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const recordsPerPage = 10;
  const [homepageSections, setHomepageSections] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "hero",
    content: "",
    status: "active",
    order: "",
  });
  // Update stats when sections change
  React.useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate({ homepageSections: homepageSections.length });
    }
  }, [homepageSections, onStatsUpdate]);
  // Pagination calculations
  const totalPages = Math.ceil(homepageSections.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentSections = homepageSections.slice(startIndex, endIndex);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const contentObj =
      typeof formData.content === "string"
        ? JSON.parse(formData.content)
        : formData.content;
    if (editingItem) {
      setHomepageSections(
        homepageSections.map((section) =>
          section.id === editingItem.id
            ? { ...section, ...formData, content: contentObj }
            : section
        )
      );
    } else {
      setHomepageSections([
        ...homepageSections,
        {
          id: Date.now(),
          ...formData,
          content: contentObj,
          order: Number.parseInt(formData.order) || homepageSections.length + 1,
        },
      ]);
    }
    setShowAddDialog(false);
    setEditingItem(null);
    setFormData({
      name: "",
      type: "hero",
      content: "",
      status: "active",
      order: "",
    });
  };
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      content: JSON.stringify(item.content, null, 2),
      status: item.status,
      order: item.order.toString(),
    });
    setShowAddDialog(true);
  };
  const handleView = (item) => {
    setViewingItem(item);
    setShowViewDialog(true);
  };
  const handleDelete = (id) => {
    setHomepageSections(
      homepageSections.filter((section) => section.id !== id)
    );
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(
      (homepageSections.length - 1) / recordsPerPage
    );
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(totalPages); // Ensure it doesn't go past the last page
    }
  };
  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-medium">Homepage Sections</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage homepage content sections and layout
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {section.content.title ||
                          JSON.stringify(section.content).substring(0, 50) +
                            "..."}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{section.type}</Badge>
                  </TableCell>
                  <TableCell>{section.order}</TableCell>
                  <TableCell>{getStatusBadge(section.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(section)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(section.id)}
                      >
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
      <div className="block md:hidden space-y-4">
        {currentSections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  {section.name}
                  {getStatusBadge(section.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    <Badge variant="outline">{section.type}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Order:</span> {section.order}
                  </div>
                  <div className="col-span-full">
                    <span className="font-medium">Content:</span>{" "}
                    <span className="text-muted-foreground">
                      {section.content.title ||
                        JSON.stringify(section.content).substring(0, 70) +
                          "..."}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(section)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(section)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(section.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, homepageSections.length)} of{" "}
          {homepageSections.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className={
                currentPage === page ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-2" />
          </Button>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Section Details</DialogTitle>
            <DialogDescription>View section information</DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell>{viewingItem.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    <TableCell>{viewingItem.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Content</TableCell>
                    <TableCell>
                      <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(viewingItem.content, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>{getStatusBadge(viewingItem.status)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Order</TableCell>
                    <TableCell>{viewingItem.order}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto my-4">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Section</DialogTitle>
            <DialogDescription>
              Create or edit a homepage section
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Section Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter section name"
                required
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full"
                >
                  <option value="hero">Hero</option>
                  <option value="products">Products</option>
                  <option value="text">Text</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="reviews">Reviews</option>
                  <option value="offers">Offers</option>
                  <option value="brands">Brands</option>
                  <option value="contact">Contact</option>
                  <option value="faq">FAQ</option>
                  <option value="social">Social</option>
                  <option value="video">Video</option>
                  <option value="locations">Locations</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Order"
                  min="1"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Content (JSON format)
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder='{"title": "Section Title", "subtitle": "Section Subtitle"}'
                rows={4}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default HomepageSection;
