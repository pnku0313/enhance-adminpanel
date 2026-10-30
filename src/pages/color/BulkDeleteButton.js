"use client";
import React from "react";

const BulkDeleteButton = ({ selectedCount, onDelete }) => {
  if (selectedCount === 0) return null;

  return (
    <button
      onClick={onDelete}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Delete {selectedCount} Selected
    </button>
  );
};

export default BulkDeleteButton;
