"use client";

import { useState, useEffect } from "react";
import MultiSelect from "./MultiSelect";
import ImageUpload from "./ImageUpload";
import Input from "../ui/Input"; // Assuming Input is available from shadcn/ui or similar
import Button from "../ui/Button"; // Assuming Button is available from shadcn/ui or similar
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table"; // Assuming Table components are available

const VariationTableGenerator = ({
  mockColors,
  mockSizes,
  selectedColors,
  selectedSizes,
  onColorsChange,
  onSizesChange,
  onVariationsGenerated,
  initialGeneratedVariations = [],
}) => {
  const [generatedVariations, setGeneratedVariations] = useState(
    initialGeneratedVariations
  );
  const [tableGenerated, setTableGenerated] = useState(
    initialGeneratedVariations.length > 0
  );

  useEffect(() => {
    setGeneratedVariations(initialGeneratedVariations);
    setTableGenerated(initialGeneratedVariations.length > 0);
  }, [initialGeneratedVariations]);

  const handleGenerateTable = () => {
    const newVariations = [];
    if (selectedColors.length === 0 && selectedSizes.length === 0) {
      alert(
        "Please select at least one color or one size to generate variations."
      );
      return;
    }

    // Handle cases where only colors or only sizes are selected
    if (selectedColors.length === 0) {
      selectedSizes.forEach((size) => {
        newVariations.push({
          color: null, // No color selected
          size: size,
          quantity: 0,
          image: null,
        });
      });
    } else if (selectedSizes.length === 0) {
      selectedColors.forEach((color) => {
        newVariations.push({
          color: color,
          size: null, // No size selected
          quantity: 0,
          image: null,
        });
      });
    } else {
      // Both colors and sizes are selected
      selectedColors.forEach((color) => {
        selectedSizes.forEach((size) => {
          newVariations.push({
            color: color,
            size: size,
            quantity: 0,
            image: null,
          });
        });
      });
    }

    setGeneratedVariations(newVariations);
    setTableGenerated(true);
    onVariationsGenerated(newVariations);
  };

  const handleQuantityChange = (index, value) => {
    const updatedVariations = [...generatedVariations];
    updatedVariations[index].quantity = Number(value);
    setGeneratedVariations(updatedVariations);
    onVariationsGenerated(updatedVariations);
  };

  const handleImageUpload = (index, file) => {
    const updatedVariations = [...generatedVariations];
    updatedVariations[index].image = file;
    setGeneratedVariations(updatedVariations);
    onVariationsGenerated(updatedVariations);
  };

  return (
    <div className="variation-table-generator">
      <div className="form-group">
        <label className="form-label">Colors</label>
        <MultiSelect
          options={mockColors}
          selected={selectedColors}
          onChange={onColorsChange}
          placeholder="Select colors..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Sizes</label>
        <MultiSelect
          options={mockSizes}
          selected={selectedSizes}
          onChange={onSizesChange}
          placeholder="Select sizes..."
        />
      </div>

      <Button onClick={handleGenerateTable} className="mt-4 mb-6">
        Generate Variation Table
      </Button>

      {tableGenerated && generatedVariations.length > 0 && (
        <div className="generated-variations-section mt-6">
          <h4 className="section-title">Product Variations</h4>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Color & Size</TableHead>
                  <TableHead className="w-[120px]">Quantity</TableHead>
                  <TableHead className="w-[150px]">Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedVariations.map((variation, index) => (
                  <TableRow
                    key={`${variation.color?.id}-${variation.size?.id}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {variation.color?.name}{" "}
                      {variation.color && variation.size ? " - " : ""}{" "}
                      {variation.size?.name}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variation.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-24"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <ImageUpload
                        onUpload={(file) => handleImageUpload(index, file)}
                        currentImage={variation.image}
                        single={true}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {tableGenerated && generatedVariations.length === 0 && (
        <p className="text-muted-foreground mt-4">
          No variations generated. Please select colors or sizes.
        </p>
      )}
    </div>
  );
};

export default VariationTableGenerator;
