"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Mail, Package, AlertCircle, CheckCircle } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/password/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      console.log("📩 Forgot Password Response:", data);

      if (res.ok) {
        setSuccess(true);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        {success ? (
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              A password reset link has been sent to{" "}
              <span className="font-medium">{email}</span>.
            </p>
            <Link
              to="/auth/login"
              className="text-red-600 hover:text-red-500 text-sm font-medium underline"
            >
              Back to Login
            </Link>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center space-y-1">
              <div className="flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-red-600 mr-2" />
                <span className="text-2xl font-bold text-red-600">TYKA</span>
              </div>
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your registered email to receive a reset link.
              </p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@store.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending link..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Back to{" "}
                  <Link
                    to="/auth/login"
                    className="text-red-600 hover:text-red-500 font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
