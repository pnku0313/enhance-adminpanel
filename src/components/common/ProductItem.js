// components/ProductItem.jsx
import React from "react";

const ProductItem = ({ product, index }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Number circle, centered */}
        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs font-medium text-red-600">
          {index + 1}
        </div>

        {/* Product name and sales */}
        <div className="flex flex-col items-start ">
          <p className="text-sm font-medium mb-0">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.sales} sales</p>
        </div>
      </div>

      {/* Revenue right-aligned */}
      <div className="text-sm font-medium">{product.revenue}</div>
    </div>
  );
};

export default ProductItem;
