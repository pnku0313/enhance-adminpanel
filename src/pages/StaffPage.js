"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import Button from "../components/ui/Button"
import Badge  from "../components/ui/Badge"
import Input from "../components/ui/Input"
import  Select  from "../components/ui/Select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/Dialog"
import { UserCheck, Users, Shield, Plus, Edit, Trash2, Search, Mail, Phone } from "lucide-react"

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "John Admin",
      email: "john@store.com",
      phone: "+1 234 567 8900",
      role: "super_admin",
      permissions: ["all"],
      status: "active",
      lastLogin: "2024-01-15 10:30",
      createdAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Sarah Manager",
      email: "sarah@store.com",
      phone: "+1 234 567 8901",
      role: "manager",
      permissions: ["products", "orders", "customers", "reports"],
      status: "active",
      lastLogin: "2024-01-14 15:45",
      createdAt: "2024-01-05",
    },
    {
      id: 3,
      name: "Mike Support",
      email: "mike@store.com",
      phone: "+1 234 567 8902",
      role: "support",
      permissions: ["orders", "customers"],
      status: "active",
      lastLogin: "2024-01-14 09:15",
      createdAt: "2024-01-10",
    },
    {
      id: 4,
      name: "Lisa Editor",
      email: "lisa@store.com",
      phone: "+1 234 567 8903",
      role: "content_editor",
      permissions: ["content", "reviews"],
      status: "inactive",
      lastLogin: "2024-01-10 14:20",
      createdAt: "2024-01-08",
    },
  ])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "support",
    permissions: [],
    status: "active",
  })
  const roles = [
    {
      id: "super_admin",
      name: "Super Admin",
      description: "Full access to all features",
      permissions: ["all"],
    },
    {
      id: "manager",
      name: "Manager",
      description: "Access to most features except system settings",
      permissions: ["products", "orders", "customers", "reports", "staff"],
    },
    {
      id: "support",
      name: "Support Agent",
      description: "Access to orders and customer management",
      permissions: ["orders", "customers", "reviews"],
    },
    {
      id: "content_editor",
      name: "Content Editor",
      description: "Access to content and review management",
      permissions: ["content", "reviews"],
    },
    {
      id: "inventory_manager",
      name: "Inventory Manager",
      description: "Access to product and inventory management",
      permissions: ["products", "reports"],
    },
  ]
  const allPermissions = [
    { id: "dashboard", name: "Dashboard" },
    { id: "products", name: "Products" },
    { id: "orders", name: "Orders" },
    { id: "customers", name: "Customers" },
    { id: "coupons", name: "Coupons" },
    { id: "reviews", name: "Reviews" },
    { id: "content", name: "Content Management" },
    { id: "staff", name: "Staff Management" },
    { id: "reports", name: "Reports" },
    { id: "settings", name: "Settings" },
  ]
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleRoleChange = (e) => {
    const selectedRole = roles.find((role) => role.id === e.target.value)
    setFormData((prev) => ({
      ...prev,
      role: e.target.value,
      permissions: selectedRole ? selectedRole.permissions : [],
    }))
  }
  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingStaff) {
      setStaff(
        staff.map((member) =>
          member.id === editingStaff.id ? { ...member, ...formData, lastLogin: member.lastLogin } : member,
        ),
      )
    } else {
      setStaff([
        ...staff,
        {
          id: Date.now(),
          ...formData,
          lastLogin: "Never",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ])
    }
    setShowAddDialog(false)
    setEditingStaff(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "support",
      permissions: [],
      status: "active",
    })
  }
  const handleEdit = (member) => {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      permissions: member.permissions,
      status: member.status,
    })
    setShowAddDialog(true)
  }
  const handleDelete = (id) => {
    setStaff(staff.filter((member) => member.id !== id))
  }
  const handleStatusToggle = (id) => {
    setStaff(
      staff.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === "active" ? "inactive" : "active",
            }
          : member,
      ),
    )
  }
  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
      case "support":
        return <Badge className="bg-green-100 text-green-800">Support</Badge>
      case "content_editor":
        return <Badge className="bg-purple-100 text-purple-800">Content Editor</Badge>
      case "inventory_manager":
        return <Badge className="bg-orange-100 text-orange-800">Inventory Manager</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }
  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }
  const staffStats = {
    total: staff.length,
    active: staff.filter((s) => s.status === "active").length,
    inactive: staff.filter((s) => s.status === "inactive").length,
    admins: staff.filter((s) => s.role === "super_admin" || s.role === "manager").length,
  }
  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Staff Management</h1>
        <p className="text-muted-foreground">Manage admin users and their access permissions</p>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.admins}</div>
          </CardContent>
        </Card>
      </div>
      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Manage admin users and their permissions</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-auto">
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.includes("all") ? (
                          <Badge variant="outline" className="text-xs">
                            All Permissions
                          </Badge>
                        ) : (
                          member.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {allPermissions.find((p) => p.id === permission)?.name || permission}
                            </Badge>
                          ))
                        )}
                        {member.permissions.length > 3 && !member.permissions.includes("all") && (
                          <Badge variant="outline" className="text-xs">
                            +{member.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member.lastLogin === "Never" ? "Never" : new Date(member.lastLogin).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusToggle(member.id)}
                          className={member.status === "active" ? "text-red-600" : "text-green-600"}
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {member.role !== "super_admin" && (
                          <Button size="sm" variant="outline" onClick={() => handleDelete(member.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Add/Edit Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update staff member information and permissions"
                : "Create a new staff member with specific role and permissions"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select name="role" value={formData.role} onChange={handleRoleChange}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {roles.find((r) => r.id === formData.role)?.description}
              </p>
            </div>
            {formData.role !== "super_admin" && (
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-4 border rounded-lg">
                  {allPermissions.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingStaff ? "Update Staff Member" : "Add Staff Member"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StaffPage
