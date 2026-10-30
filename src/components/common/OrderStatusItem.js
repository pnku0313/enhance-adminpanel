import Badge from "../ui/Badge";
const OrderStatusItem = ({ order, maxCount }) => {
  const barWidth = (order.count / maxCount) * 100;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${order.color}`} />
        <span className="text-sm font-medium">{order.status}</span>
      </div>
      <div className="flex items-center space-x-2 w-1/2">
        <Badge variant="secondary">{order.count}</Badge>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${order.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
export default OrderStatusItem;
