// src/pages/ViewUser.jsx
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/users/${id}`
        );

        setUser(res.data.data);
        console.log(res.data);
      } catch (error) {
        toast.error("Failed to load user details");
        console.error(error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto dark:text-white shadow rounded-lg">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <div className="flex gap-6">
        {/* Image */}
        <div className="w-40 h-40 bg-gray-200 rounded overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.customerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center h-full text-gray-500">
              No Image
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {String(user.status) === "1" ? "Active" : "Inactive"}
          </p>
          <p>
            <strong>Gender:</strong> {user.gender}
          </p>
          <p>
            <strong>Role:</strong> {user.roles[0]?.role_name}
          </p>
          <p>
            <strong>User Type:</strong> {user.user_type}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
