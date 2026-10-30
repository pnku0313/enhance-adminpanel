"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Package, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Extract token and email from URL
  useEffect(() => {
    const emailFromUrl = searchParams.get("email") || "";
    const tokenFromUrl = searchParams.get("token") || "";
    setFormData((prev) => ({
      ...prev,
      email: decodeURIComponent(emailFromUrl),
      token: tokenFromUrl,
    }));
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            token: formData.token,
            password: formData.newPassword,
            password_confirmation: formData.confirmPassword,
          }),
        }
      );

      const data = await res.json();
      console.log("🔑 Reset Password Response:", data);

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else {
        setError(data.message || "Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">Password Reset</h2>
            <p className="text-muted-foreground">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardHeader className="text-center space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-2xl font-bold text-red-600">TYKA</span>
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {/* Email (readonly) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>

            {/* Hidden Token */}
            <input type="hidden" name="token" value={formData.token} />

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
