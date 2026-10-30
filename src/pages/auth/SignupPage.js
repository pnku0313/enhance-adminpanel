"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/register",
        {
          withCredentials: true,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            confirm_password: formData.confirm_password,
            login_type: "email",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Account Created!</h2>
              <p className="text-muted-foreground">
                Your account has been created successfully. You will be
                redirected to the login page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 p-4">
      <Card className="w-full max-w-xl bg-transparent border-red-200 dark:border-red-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-2xl font-bold text-red-600">TYKA</span>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <PhoneInput
                  country="in"
                  value={formData.phone}
                  onChange={(phone) =>
                    setFormData((prev) => ({ ...prev, phone }))
                  }
                  inputProps={{
                    name: "phone",
                    required: true,
                    autoFocus: false,
                  }}
                  inputClass="!w-full !border-red-200 dark:!border-red-800"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
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

              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
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
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{" "}
                <Link to="/terms" className="text-red-600 hover:text-red-500">
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
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

export default SignupPage;
