import Badge from "../ui/Badge";
const OrderStatusreport = ({ segment }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{segment.segment}</span>
        <Badge variant="outline">{segment.count}</Badge>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${segment.color}`} />
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full"
            style={{ width: `${segment.percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {segment.percentage}%
        </span>
      </div>
    </>
  );
};
export default OrderStatusreport;
