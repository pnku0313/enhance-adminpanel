import { useState, useRef, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { X } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2"; // Added SweetAlert2

const AddressForm = ({ formData, setFormData, id, onClose, onSubmit }) => {
  console.log("formdata condndn", formData);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const formRef = useRef(null);

  const authToken = localStorage.getItem("authToken");
  const userId = id || localStorage.getItem("authUserId");

  // Close modal when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/countries",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setCountries(res.data.data || []);
      } catch (error) {
        console.error("❌ Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, [authToken]);

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      setCities([]);
      return;
    }

    const fetchStates = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/states/${formData.country}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setStates(res.data.data || []);
        // setCities([]);
      } catch (error) {
        console.error("❌ Error fetching states:", error);
      }
    };
    fetchStates();
  }, [formData.country, authToken]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/cities/${formData.state}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setCities(res.data.data || []);
      } catch (error) {
        console.error("❌ Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [formData.state, authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Required fields validation (custom error messages)
    const fieldErrorMessages = {
      name: "Please enter your name.",
      line1: "Please enter your street address.",
      pincode: "Please enter your ZIP code.",
      country: "Please select your country.",
      state: "Please select your state.",
      city: "Please select your city.",
      contact: "Please enter your phone number.",
      addressType: "Please select your address type.",
    };

    for (const key in fieldErrorMessages) {
      if (!formData[key] || formData[key].toString().trim() === "") {
        setFormError(fieldErrorMessages[key]);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        user_id: userId,
        name: formData.name,
        street: formData.line1,
        apartment_suite: formData.landmark,
        zipcode: formData.pincode,
        country_id: formData.country,
        state_id: formData.state,
        city_id: formData.city,
        status: 1,
        address_type: formData.addressType,
        phone_number: formData.contact,
      };

      let res;
      if (formData.id) {
        res = await axios.put(
          `http://127.0.0.1:8000/api/user-addresses/${formData.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        res = await axios.post(
          "http://127.0.0.1:8000/api/user-addresses",
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.data.message || "Address saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        onSubmit(res.data);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: res.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Error saving address (caught):", error);

      // Try to get backend message
      const backendMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save address. Please try again.";
      setFormError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-4xl max-h-[80vh] bg-white rounded-md p-6 relative overflow-y-auto"
        style={{ minWidth: "700px" }}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
          aria-label="Close modal"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {formData.id ? "Edit Address" : "Add Address"}
        </h2>

        {formError && (
          <p className="text-red-600 mb-2 font-semibold">{formError}</p>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Left half */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-medium">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="line1" className="block font-medium">
                Street Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="line1"
                value={formData.line1}
                onChange={(e) =>
                  setFormData({ ...formData, line1: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="landmark" className="block font-medium">
                Apartment/Suite (Optional)
              </label>
              <input
                type="text"
                id="landmark"
                value={formData.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, landmark: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="pincode" className="block font-medium">
                Zip Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          {/* Right half */}
          <div className="space-y-4">
            <div>
              <label htmlFor="country" className="block font-medium">
                Country <span className="text-red-600">*</span>
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country: e.target.value,
                    state: "",
                    city: "",
                  })
                }
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="state" className="block font-medium">
                State <span className="text-red-600">*</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value, city: "" })
                }
                className="w-full rounded border px-3 py-2"
                disabled={!states.length}
              >
                <option value="">
                  Select State <span className="text-red-600">*</span>
                </option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block font-medium">
                City <span className="text-red-600">*</span>
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
                disabled={!cities.length}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact" className="block font-medium">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <PhoneInput
                country={"in"}
                value={formData.contact}
                onChange={(value) =>
                  setFormData({ ...formData, contact: value })
                }
                inputProps={{
                  name: "phone",
                  required: true,
                }}
                containerClass="w-full"
                inputClass="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="addressType" className="block font-medium">
                Address Type <span className="text-red-600">*</span>
              </label>
              <select
                id="addressType"
                value={formData.addressType}
                onChange={(e) =>
                  setFormData({ ...formData, addressType: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              >
                <option value="home">Home</option>
                <option value="office">Office</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : formData.id ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
