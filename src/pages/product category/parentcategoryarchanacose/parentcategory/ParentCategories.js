"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// For PDF and Excel export
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import TableParentCategories from "./TableParentCategories";

// Utility for local storage
const PARENT_LOCAL_STORAGE_KEY = "parentCategories";
const HEAD_LOCAL_STORAGE_KEY = "headCategories"; // To get head categories for dropdown

const ParentCategoriesPage = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [headCategories, setHeadCategories] = useState([]); // State to store head categories
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParents, setSelectedParents] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // Load data from local storage on mount
  useEffect(() => {
    const storedParentData = localStorage.getItem(PARENT_LOCAL_STORAGE_KEY);
    if (storedParentData) {
      setParentCategories(JSON.parse(storedParentData));
    }
    const storedHeadData = localStorage.getItem(HEAD_LOCAL_STORAGE_KEY);
    if (storedHeadData) {
      setHeadCategories(JSON.parse(storedHeadData));
    }
  }, []);

  // Save data to local storage whenever parentCategories changes
  useEffect(() => {
    localStorage.setItem(
      PARENT_LOCAL_STORAGE_KEY,
      JSON.stringify(parentCategories)
    );
  }, [parentCategories]);

  const filteredCategories = parentCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (headCategories.find((h) => h.id === cat.headCategoryId)?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedParents.length} selected categories?`
      )
    ) {
      setParentCategories((prevCategories) =>
        prevCategories.filter((cat) => !selectedParents.includes(cat.id))
      );
      setSelectedParents([]);
    }
  };

  const exportToPdf = () => {
    const input = document.getElementById("parent-categories-table");
    if (!input) {
      console.error("Table element not found for PDF export.");
      return;
    }

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("parent-categories.pdf");
    });
  };

  const exportToExcel = () => {
    const data = filteredCategories.map((cat) => ({
      "Head Category":
        headCategories.find((h) => h.id === cat.headCategoryId)?.name || "N/A",
      "Parent Category Name": cat.name,
      Description: cat.description,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parent Categories");
    XLSX.writeFile(wb, "parent-categories.xlsx");
  };

  const printTable = () => {
    const printContent = document.getElementById("parent-categories-table");
    if (!printContent) {
      console.error("Table element not found for printing.");
      return;
    }
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(
      "<html><head><title>Parent Categories List</title>"
    );
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: sans-serif; margin: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(printContent.outerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 2) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 1) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const areAllOnPageSelected =
    paginatedCategories.length > 0 &&
    paginatedCategories.every((cat) => selectedParents.includes(cat.id));

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4 w-full max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">
        Parent Category
      </h1>

      <Card className="w-full max-w-full overflow-x-auto">
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <TableParentCategories />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentCategoriesPage;
