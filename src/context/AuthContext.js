"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      const userData = localStorage.getItem("userData");
      const savedRoles = localStorage.getItem("roles");
      const savedPermissions = localStorage.getItem("permissions");

      if (authStatus === "true" && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        setRoles(savedRoles ? JSON.parse(savedRoles) : []);
        setPermissions(savedPermissions ? JSON.parse(savedPermissions) : []);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password,
            user_type: "Admin",
            login_type: "email",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.user_type, // adjust this based on your API response
        };
        setUser(userData);
        setIsAuthenticated(true);
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);
        localStorage.setItem("roles", JSON.stringify(data.roles || []));
        localStorage.setItem(
          "permissions",
          JSON.stringify(data.permissions || [])
        );
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userData", JSON.stringify(userData));
        return { success: true };
      } else {
        setError(data.message || "Login failed");
        return { success: false, error: data.message };
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      return { success: false, error: "Something went wrong" };
    }
  };

  const signup = async (formData) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: "Account created successfully." };
      } else {
        setError(result.message || "Registration failed.");
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      return { success: false, error: "Something went wrong" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setRoles([]);
    setPermissions([]);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.clear();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    roles,
    permissions,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
