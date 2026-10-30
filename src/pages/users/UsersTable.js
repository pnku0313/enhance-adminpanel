"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/Dropdown";
import axios from "axios";
import { toast } from "react-toastify";

const UserTable = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  areAllOnPageSelected,
  onDeleteSuccess, // New prop to update users after delete
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const statusClasses = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status] || statusClasses.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      manager:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          roleClasses[role] || roleClasses.user
        }`}
      >
        {role}
      </span>
    );
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/users/${userId}`
      );
      toast.success("User deleted successfully.");

      // Remove the user from UI
      if (typeof onDeleteSuccess === "function") {
        onDeleteSuccess(userId);
      }
    } catch (error) {
      toast.error("Failed to delete user.");
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-[800px] w-full" id="users-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                checked={areAllOnPageSelected}
                onChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="min-w-[150px]">Customer Name</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[100px]">Role</TableHead>
            <TableHead className="min-w-[130px]">Phone Number</TableHead>
            <TableHead className="min-w-[200px]">Email</TableHead>
            <TableHead className="min-w-[120px]">Country</TableHead>
            <TableHead className="min-w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-4 text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {user.customerName}
                </TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell className="truncate max-w-xs">
                  {user.email}
                </TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="dark:bg-gray-600"
                    >
                      <button
                        onClick={() => navigate(`/view-user/${user.id}`)}
                        className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-user/${user.id}`)}
                        className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-full px-3 py-2 flex items-center text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </button>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
