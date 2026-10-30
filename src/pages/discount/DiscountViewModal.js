import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../components/ui/Table";

const DiscountViewModal = ({ viewingDiscount, isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto dark:text-white">
        <DialogHeader>
          <DialogTitle>Discount Details</DialogTitle>
          <p className="text-muted-foreground">{viewingDiscount?.name}</p>
        </DialogHeader>
        {viewingDiscount && (
          <div className="py-4">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Name:</TableCell>
                  <TableCell className="w-2/3">
                    {viewingDiscount.name}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Type:</TableCell>
                  <TableCell className="w-2/3">
                    {viewingDiscount.type}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Amount:</TableCell>
                  <TableCell className="w-2/3">
                    {viewingDiscount.amount}
                    {viewingDiscount.type === "PERCENTAGE" ? "%" : "$"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">
                    Start Date:
                  </TableCell>
                  <TableCell className="w-2/3">
                    {new Date(viewingDiscount.startDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">End Date:</TableCell>
                  <TableCell className="w-2/3">
                    {new Date(viewingDiscount.endDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 align-top pt-2">
                    Description:
                  </TableCell>
                  <TableCell className="w-2/3 whitespace-pre-wrap pt-2">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: viewingDiscount.description,
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Active:</TableCell>
                  <TableCell className="w-2/3">
                    {viewingDiscount.active ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3">
                    Created At:
                  </TableCell>
                  <TableCell className="w-2/3">
                    {new Date(viewingDiscount.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscountViewModal;
