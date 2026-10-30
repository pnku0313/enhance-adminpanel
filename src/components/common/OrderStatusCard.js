import React from "react";
import OrderStatusItem from "./OrderStatusItem";
import OrderStatusReport from "./OrderStatusreport";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Users } from "lucide-react";
import Badge from "../ui/Badge";

const OrderStatusCard = ({
  title,
  description,
  orderStatus,
  maxCount,
  reportStatus,
}) => {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center space-x-1">
            <Users className="h-6 w-6 text-red-600" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {/* Conditional rendering using && */}
      {orderStatus && orderStatus.length > 0 ? (
        <CardContent className="space-y-4">
          {orderStatus.map((order) => (
            <OrderStatusItem
              key={order.status}
              order={order}
              maxCount={maxCount}
            />
          ))}
        </CardContent>
      ) : (
        <CardContent>
          <div className="space-y-4">
            {reportStatus.map((segment) => (
              <div key={segment.segment} className="space-y-2">
                <OrderStatusReport segment={segment} />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default OrderStatusCard;
