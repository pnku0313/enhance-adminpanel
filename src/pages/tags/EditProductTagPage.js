import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Tag, Hash, Tags, Bookmark } from "lucide-react";
import Swal from "sweetalert2";
import {
  FormShell, FormField, TextInput, SelectInput, FormActions, FormLoading, showSwalLoading,
} from "../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api/tags";
const ICONS = [Tag, Hash, Tags, Bookmark];

const EditProductTagPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tagName, setTagName] = useState("");
  const [status, setStatus] = useState("1"); // "1" = active, "0" = inactive
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        // The API returns the tag inside an array
        const raw = res.data.data;
        const tag = Array.isArray(raw) ? raw[0] : raw;
        setTagName(tag?.name || "");
        setStatus(tag?.status === true || tag?.status === "active" || tag?.status === 1 ? "1" : "0");
      })
      .catch((error) => {
        toast.error("Failed to load tag details");
        console.error(error.response?.data || error.message);
      })
      .finally(() => { if (!cancelled) setFetching(false); });

    return () => { cancelled = true; };
  }, [id, token]);

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    try {
      setLoading(true);
      showSwalLoading("Updating...", "Please wait while we update the tag.");

      await axios.put(
        `${API_BASE}/${id}`,
        { name: tagName.trim(), status: Number(status) },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Swal.close();
      toast.success("Tag updated successfully!");
      setTimeout(() => navigate("/producttags"), 900);
    } catch (error) {
      Swal.close();
      console.error("Error updating tag:", error.response?.data || error.message);
      toast.error("Failed to update tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell title="Edit product tag" subtitle="Update the details of this tag" icons={ICONS}>
      {fetching ? (
        <FormLoading />
      ) : (
        <form onSubmit={handleEdit} className="space-y-6">
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
            submitLabel="Update tag"
            loadingLabel="Updating..."
            loading={loading}
          />
        </form>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default EditProductTagPage;