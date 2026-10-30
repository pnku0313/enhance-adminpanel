// components/ProductCard.jsx
import React from "react";
import ProductItem from "./ProductItem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Package } from "lucide-react";

const ProductCard = ({ title, description, topProducts }) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-center space-x-1">
          <Package className="h-6 w-6 text-red-600" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <ProductItem key={product.name} product={product} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
