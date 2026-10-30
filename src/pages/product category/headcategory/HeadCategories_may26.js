"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import HeadCategoriesTable from "./HeadCategoriesTable";
import { useNavigate } from "react-router-dom";

// For PDF and Excel export
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// Utility for local storage
const LOCAL_STORAGE_KEY = "headCategories";

const HeadCategoriesPage = () => {
  const navigate = useNavigate();

  const [headCategories, setHeadCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHeads, setSelectedHeads] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setHeadCategories(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(headCategories));
  }, [headCategories]);

  const filteredCategories = headCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSelect = (id) => {
    setSelectedHeads((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCategoryIdsOnPage = paginatedCategories.map((cat) => cat.id);
      setSelectedHeads((prevSelected) =>
        Array.from(new Set([...prevSelected, ...allCategoryIdsOnPage]))
      );
    } else {
      const allCategoryIdsOnPage = paginatedCategories.map((cat) => cat.id);
      setSelectedHeads((prevSelected) =>
        prevSelected.filter((catId) => !allCategoryIdsOnPage.includes(catId))
      );
    }
  };

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedHeads.length} selected categories?`
      )
    ) {
      setHeadCategories((prevCategories) =>
        prevCategories.filter((cat) => !selectedHeads.includes(cat.id))
      );
      setSelectedHeads([]);
    }
  };

  const exportToPdf = () => {
    const input = document.getElementById("head-categories-table");
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
      pdf.save("head-categories.pdf");
    });
  };

  const exportToExcel = () => {
    const data = filteredCategories.map((cat) => ({
      Name: cat.name,
      Description: cat.description,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Head Categories");
    XLSX.writeFile(wb, "head-categories.xlsx");
  };

  const printTable = () => {
    const printContent = document.getElementById("head-categories-table");
    if (!printContent) {
      console.error("Table element not found for printing.");
      return;
    }
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(
      "<html><head><title>Head Categories List</title>"
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
    paginatedCategories.every((cat) => selectedHeads.includes(cat.id));

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4 w-full max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">
        Main Category Management
      </h1>

      <Card className="w-full max-w-full overflow-x-auto">
        <CardContent className="p-0 w-full">
          {/* Table call here */}
          <HeadCategoriesTable
            data={paginatedCategories}
            selectedIds={selectedHeads}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onEdit={(cat) => navigate(`/editheadcategory/${cat.id}`)}
            onDelete={(cat) => {
              if (
                window.confirm("Are you sure you want to delete this category?")
              ) {
                setHeadCategories((prev) =>
                  prev.filter((c) => c.id !== cat.id)
                );
                setSelectedHeads((prev) => prev.filter((id) => id !== cat.id));
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadCategoriesPage;
