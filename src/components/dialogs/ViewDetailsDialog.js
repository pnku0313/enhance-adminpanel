"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";

const ViewDetailsDialog = ({ viewing, onClose }) => {
  return (
    <Dialog open={!!viewing} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Product Details</DialogTitle>
          <DialogDescription className="text-sm break-words">
            {viewing?.name}
          </DialogDescription>
        </DialogHeader>
        {viewing && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={
                  viewing.image ||
                  "/placeholder.svg?height=40&width=40&query=product"
                }
                alt={viewing.name}
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border"
              />
            </div>
            <div className="space-y-3">
              {[
                { label: "Name", value: viewing.name },
                { label: "Category", value: viewing.category },
                { label: "Price", value: `$${viewing.price}` },
                { label: "Discount", value: `${viewing.discount}%` },
                { label: "Tax", value: `${viewing.tax}%` },
                { label: "Stock", value: viewing.stock },
                { label: "Status", value: viewing.status },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-b-0"
                >
                  <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                    {item.label}:
                  </span>
                  <span className="text-sm text-right break-words min-w-0 flex-1">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsDialog;
