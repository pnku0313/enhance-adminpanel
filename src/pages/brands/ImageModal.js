import React from "react";
import { X } from "lucide-react";

const ImageModal = ({ isOpen, onClose, imageUrl, brandName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 z-10"
        >
          <X size={24} />
        </button>
        <img
          src={
            imageUrl ||
            "/placeholder.svg?height=400&width=600&query=brand-image"
          }
          alt={brandName}
          className="w-full h-full object-contain rounded-lg"
        />
        {brandName && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">{brandName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
