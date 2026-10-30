"use client";

import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  tags = [],
  products = [],
  formDatas,
  updateData,
}) => {
  const [localFormData, setLocalFormData] = useState({
    mainCategory: [],
    subCategory: [],
    childCategory: [],
    tags: [],
    relatedProducts: [],
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredChildcategories, setFilteredChildcategories] = useState([]);
  const select2Initialized = useRef(false);

  const handleSelectChange = (field, selectedValuesRaw) => {
    const selectedValues = selectedValuesRaw || [];

    setLocalFormData((prev) => ({
      ...prev,
      [field]: selectedValues,
    }));

    if (field === "mainCategory") {
      updateData("head_categories", selectedValues);

      const filtered = subcategories.filter((sub) =>
        selectedValues.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filtered);
      setFilteredChildcategories([]);

      updateData("parent_categories", []);
      updateData("child_categories", []);

      setLocalFormData((prev) => ({
        ...prev,
        subCategory: [],
        childCategory: [],
      }));

      setTimeout(() => {
        $("#subCategory").val(null).trigger("change");
        $("#childCategory").val(null).trigger("change");
      }, 100);
    }

    if (field === "subCategory") {
      updateData("parent_categories", selectedValues);

      const filtered = childcategories.filter((child) =>
        selectedValues.includes(String(child.product_subcategory_id))
      );
      setFilteredChildcategories(filtered);

      updateData("child_categories", []);

      setLocalFormData((prev) => ({
        ...prev,
        childCategory: [],
      }));

      setTimeout(() => {
        $("#childCategory").val(null).trigger("change");
      }, 100);
    }

    if (field === "childCategory") {
      updateData("child_categories", selectedValues);
    }

    if (field === "relatedProducts") {
      updateData("related_product", selectedValues);
    }

    if (field === "tags") {
      updateData("tags", selectedValues);
    }
  };

  const initializeSelect2 = () => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

    ids.forEach((id) => {
      $(id)
        .select2({
          placeholder: "Select options",
          allowClear: true,
          width: "100%",
          theme: "default",
        })
        .on("change", function () {
          const field = $(this).attr("id");
          const selectedValues = $(this).val() || [];
          handleSelectChange(field, selectedValues);
        });
    });

    select2Initialized.current = true;
  };

  const destroySelect2 = () => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

    ids.forEach((id) => {
      if ($(id).hasClass("select2-hidden-accessible")) {
        $(id).off("change").select2("destroy");
      }
    });

    select2Initialized.current = false;
  };

  useEffect(() => {
    if (!select2Initialized.current) {
      initializeSelect2();
    }

    if (formDatas) {
      const mainCategoryIds =
        formDatas.head_categories?.map((id) => String(id)) || [];
      const subCategoryIds =
        formDatas.parent_categories?.map((c) => String(c.id || c)) || [];
      const childCategoryIds =
        formDatas.child_categories?.map((c) => String(c.id || c)) || [];
      const relatedProductIds =
        formDatas.related_product?.map((p) => String(p.id || p)) || [];
      const tagIds = formDatas.tags?.map((id) => String(id)) || [];

      const initialFormData = {
        mainCategory: mainCategoryIds,
        subCategory: subCategoryIds,
        childCategory: childCategoryIds,
        relatedProducts: relatedProductIds,
        tags: tagIds,
      };

      const filteredSubs = subcategories.filter((sub) =>
        mainCategoryIds.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filteredSubs);

      const filteredChildren = childcategories.filter((child) =>
        subCategoryIds.includes(String(child.product_subcategory_id))
      );
      setFilteredChildcategories(filteredChildren);

      setLocalFormData(initialFormData);

      setTimeout(() => {
        $("#mainCategory").val(mainCategoryIds).trigger("change.select2");
        $("#subCategory").val(subCategoryIds).trigger("change.select2");
        $("#childCategory").val(childCategoryIds).trigger("change.select2");
        $("#relatedProducts").val(relatedProductIds).trigger("change.select2");
        $("#tags").val(tagIds).trigger("change.select2");
      }, 500);
    }

    return () => destroySelect2();
  }, [formDatas, categories, subcategories, childcategories, tags, products]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Main Category */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Main Category
                </label>
                <select id="mainCategory" multiple className="w-full">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Sub Category
                </label>
                <select id="subCategory" multiple className="w-full">
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Child Category */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Child Category
                </label>
                <select id="childCategory" multiple className="w-full">
                  {filteredChildcategories.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Products */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Related Products
                </label>
                <select id="relatedProducts" multiple className="w-full">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              {/* <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Tags
                </label>
                <select id="tags" multiple className="w-full">
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductLinksTab;
