"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Truck, Save } from "lucide-react";
import { toast } from "react-toastify";

export default function ShippingChargesPage() {
  const [settings, setSettings] = useState({
    shipping_charge: "",
  });

  // 👇 yahan apna token store karein (localStorage ya env se)
  const authToken = localStorage.getItem("authToken");

  // Input change handler
  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // API call for saving
  const handleSave = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/shipping-charge",
        settings,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Update Response:", res.data); // 👈 console print
      toast.success("Shipping charges updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update shipping charges.");
    }
  };

  // On mount load existing settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/shipping-charge",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        console.log("Fetch Response:", res.data); // 👈 console print
        setSettings(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [authToken]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Truck className="h-5 w-5" />
            Shipping Charges
          </CardTitle>
          <CardDescription>
            Manage shipping fee rules and free shipping thresholds
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              placeholder="Shipping Charge"
              value={settings.shipping_charge}
              onChange={(e) =>
                handleInputChange("shipping_charge", e.target.value)
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
