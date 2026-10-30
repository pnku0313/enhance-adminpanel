import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Tag, Hash, Tags, Bookmark } from "lucide-react";
import Swal from "sweetalert2";
import {
  FormShell, FormField, TextInput, SelectInput, FormActions, showSwalLoading,
} from "../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/tags";
const ICONS = [Tag, Hash, Tags, Bookmark];

export default function AddProductTag() {
  const navigate = useNavigate();
  const [tagName, setTagName] = useState("");
  const [status, setStatus] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      toast.error("Please enter a tag name", { position: "top-right", autoClose: 2000 });
      return;
    }

    try {
      setLoading(true);
      showSwalLoading("Saving tag...", "Please wait while we save your tag.");

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: tagName.trim(), status: parseInt(status, 10) }),
      });
      const data = await res.json().catch(() => ({}));

      Swal.close();

      if (data?.status === true || data?.success) {
        toast.success("Product tag saved successfully", { position: "top-right", autoClose: 1000 });
        setTimeout(() => navigate("/producttags"), 1200);
      } else {
        toast.error(data?.message || "Failed to save product tag", { position: "top-right", autoClose: 3000 });
      }
    } catch (err) {
      Swal.close();
      console.error("Error saving product tag:", err);
      toast.error("Failed to save product tag", { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell title="Add product tag" subtitle="Create a tag you can attach to products" icons={ICONS}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Tag name" htmlFor="tagName" required>
          <TextInput
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Enter tag name"
            required
          />
        </FormField>

        <FormField label="Status" htmlFor="status" hint="Choose whether this tag is active.">
          <SelectInput id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </SelectInput>
        </FormField>

        <FormActions
          onCancel={() => navigate("/producttags")}
          submitLabel="Save tag"
          loadingLabel="Saving..."
          loading={loading}
        />
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
}