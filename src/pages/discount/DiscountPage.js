"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import DiscountTable from "./DiscountTable";

import { useNavigate } from "react-router-dom";

// Utility for local storage
const LOCAL_STORAGE_KEY = "discounts";

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [descriptionContent, setDescriptionContent] = useState(""); // State for RichTextEditor content
  const editorRef = useRef(null); // Ref for RichTextEditor
  const navigate = useNavigate();

  // Load data from local storage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setDiscounts(JSON.parse(storedData));
    } else {
      // Dummy data for initial load
      setDiscounts([
        {
          id: "1",
          name: "Summer Sale",
          type: "PERCENTAGE",
          amount: 15,
          startDate: "2024-06-01",
          endDate: "2024-08-31",
          description: "<p>Get 15% off on all summer collection items!</p>",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "New Customer Discount",
          type: "FIXED",
          amount: 10,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          description: "<p><strong>$10 off</strong> your first purchase.</p>",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Clearance Sale",
          type: "PERCENTAGE",
          amount: 50,
          startDate: "2024-07-15",
          endDate: "2024-07-30",
          description: "<p>Huge discounts on selected items.</p>",
          active: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Save data to local storage whenever discounts changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(discounts));
  }, [discounts]);

  // Effect to manage descriptionContent when modal opens/closes
  useEffect(() => {
    if (isAddEditModalOpen) {
      setDescriptionContent(editingDiscount?.description || "");
    } else {
      setDescriptionContent(""); // Clear content when modal closes
    }
  }, [isAddEditModalOpen, editingDiscount]);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 dark:text-white">
        Discount Management
      </h1>

      <Card className="w-full max-w-full overflow-x-auto">
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <DiscountTable></DiscountTable>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountPage;
