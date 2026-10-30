// "use client";

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Input from "../../ui/Input";
// import Button from "../../ui/Button";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import { X } from "lucide-react";
// import Swal from "sweetalert2";
// import "react-toastify/dist/ReactToastify.css";

// const AddBannerPage = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     banner_placement: "",
//     banner_image: null,
//     target_url: "",
//     is_active: false,
//     rawImage: null,
//   });

//   const [loading, setLoading] = useState(false); // Loader state

//   // Handle text and select inputs
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Handle image upload + preview
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         banner_image: URL.createObjectURL(file), // preview
//         rawImage: file,
//       }));
//     }
//   };

//   // Remove selected image
//   const handleRemoveImage = () => {
//     setFormData((prev) => ({
//       ...prev,
//       banner_image: null,
//       rawImage: null,
//     }));
//   };

//   // Validation function
//   const validateForm = () => {
//     const placementRegex = /^[A-Za-z\s-]+$/;
//     const urlRegex =
//       /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

//     if (!placementRegex.test(formData.banner_placement)) {
//       toast.error(
//         "❌ Placement can contain only letters, spaces, and hyphens."
//       );
//       return false;
//     }

//     if (formData.target_url && !urlRegex.test(formData.target_url)) {
//       toast.error("❌ The target URL must be a valid URL.");
//       return false;
//     }

//     return true;
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return; // stop if validation fails

//     setLoading(true); // Show loader

//     const data = new FormData();
//     data.append("banner_placement", formData.banner_placement);
//     data.append("target_url", formData.target_url);
//     data.append("is_active", formData.is_active ? 1 : 0);
//     if (formData.rawImage) data.append("banner_image", formData.rawImage);

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/banners",
//         data,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       console.log("API Response:", response.data);
//       debugger; // For debugging purpose

//       // SweetAlert after success
//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "✅ Banner created successfully!",
//         confirmButtonColor: "#d33",
//         confirmButtonText: "OK",
//       }).then(() => {
//         navigate("/content");
//       });
//     } catch (error) {
//       console.error("API Error:", error.response || error);
//       toast.error("❌ Failed to create banner.");
//     } finally {
//       setLoading(false); // Hide loader
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
//       <h1 className="text-2xl font-bold mb-6">Add Banner</h1>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Banner Placement */}
//         <div>
//           <label className="text-sm font-medium">Banner Placement</label>
//           <Input
//             name="banner_placement"
//             value={formData.banner_placement}
//             onChange={handleInputChange}
//             placeholder="Enter banner placement"
//             required
//             className="w-full"
//           />
//         </div>

//         {/* Banner Image */}
//         <div>
//           <label className="text-sm font-medium">Banner Image</label>
//           <div className="space-y-2">
//             <Input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="cursor-pointer w-full"
//             />

//             {formData.banner_image && (
//               <div className="relative w-full">
//                 <img
//                   src={formData.banner_image}
//                   alt="Preview"
//                   className="w-full h-80 object-cover rounded border shadow"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleRemoveImage}
//                   className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Target URL */}
//         <div>
//           <label className="text-sm font-medium">Target URL</label>
//           <Input
//             name="target_url"
//             value={formData.target_url}
//             onChange={handleInputChange}
//             placeholder="Enter target URL"
//             className="w-full"
//           />
//         </div>

//         {/* Is Active */}
//         <div className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             name="is_active"
//             checked={formData.is_active}
//             onChange={handleInputChange}
//             className="h-4 w-4"
//           />
//           <label className="text-sm font-medium">Active</label>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => navigate("/content")}
//             className="w-full sm:w-auto"
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex items-center justify-center"
//             disabled={loading}
//           >
//             {loading ? (
//               <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
//             ) : (
//               "Create Banner"
//             )}
//           </Button>
//         </div>
//       </form>
//       <ToastContainer />
//     </div>
//   );
// };

// export default AddBannerPage;

"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const AddBannerPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    position: "", // ✅ using correct key for backend
    banner_image: null,
    target_url: "",
    is_active: false,
    rawImage: null,
  });

  const [loading, setLoading] = useState(false);

  // Handle text, select, checkbox
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload + preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        banner_image: URL.createObjectURL(file),
        rawImage: file,
      }));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      banner_image: null,
      rawImage: null,
    }));
  };

  // Validation
  const validateForm = () => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

    if (!formData.position) {
      toast.error("❌ Please select a banner position.");
      return false;
    }

    if (formData.target_url && !urlRegex.test(formData.target_url)) {
      toast.error("❌ The target URL must be a valid URL.");
      return false;
    }

    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    data.append("position", formData.position); // ✅ correct key for backend
    data.append("target_url", formData.target_url);
    data.append("is_active", formData.is_active ? 1 : 0);
    if (formData.rawImage) data.append("banner_image", formData.rawImage);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/banners",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "✅ Banner created successfully!",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/content");
      });
    } catch (error) {
      console.error("API Error:", error.response || error);
      toast.error("❌ Failed to create banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Add Banner</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Position Dropdown exactly as you asked */}
        <div>
          <label className="text-sm font-medium">Banner Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-red-300 bg-white dark:bg-transparent dark:text-white"
          >
            <option value="">-- Select Position --</option>
            <option value="top_banner">Top Banner</option>
            <option value="bottom_banner">Bottom Banner</option>
          </select>
        </div>

        {/* Banner Image */}
        <div>
          <label className="text-sm font-medium">Banner Image</label>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer w-full"
              required
            />

            {formData.banner_image && (
              <div className="relative w-full">
                <img
                  src={formData.banner_image}
                  alt="Preview"
                  className="w-full h-80 object-cover rounded border shadow"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Target URL */}
        <div>
          <label className="text-sm font-medium">Target URL</label>
          <Input
            name="target_url"
            value={formData.target_url}
            onChange={handleInputChange}
            placeholder="Enter target URL"
            className="w-full"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">Active</label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/content")}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Create Banner"
            )}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddBannerPage;
