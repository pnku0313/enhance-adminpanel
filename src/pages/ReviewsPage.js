"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/Dialog";
import {
  Star,
  Search,
  Filter,
  MessageSquare,
  CheckCircle,
  XCircle,
  Reply,
} from "lucide-react";

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      product: "Wireless Headphones",
      customer: "John Doe",
      email: "john@example.com",
      rating: 5,
      title: "Excellent sound quality!",
      comment:
        "These headphones are amazing. The sound quality is crystal clear and the battery life is fantastic.",
      date: "2024-01-15",
      status: "pending",
      helpful: 12,
      reply: null,
    },
    {
      id: 2,
      product: "Smart Watch",
      customer: "Jane Smith",
      email: "jane@example.com",
      rating: 4,
      title: "Great features but battery could be better",
      comment:
        "Love all the health tracking features. The interface is intuitive but the battery doesn't last as long as advertised.",
      date: "2024-01-14",
      status: "approved",
      helpful: 8,
      reply:
        "Thank you for your feedback! We're working on battery optimization in our next update.",
    },
    {
      id: 3,
      product: "Laptop Stand",
      customer: "Mike Johnson",
      email: "mike@example.com",
      rating: 3,
      title: "Decent but could be more stable",
      comment:
        "The stand works fine for basic use but wobbles a bit when typing. Good value for the price though.",
      date: "2024-01-13",
      status: "pending",
      helpful: 3,
      reply: null,
    },
    {
      id: 4,
      product: "USB-C Cable",
      customer: "Sarah Wilson",
      email: "sarah@example.com",
      rating: 2,
      title: "Stopped working after a month",
      comment:
        "The cable worked fine initially but stopped charging my device after about a month of use. Poor quality.",
      date: "2024-01-12",
      status: "rejected",
      helpful: 15,
      reply: null,
    },
    {
      id: 5,
      product: "Phone Case",
      customer: "David Brown",
      email: "david@example.com",
      rating: 5,
      title: "Perfect protection!",
      comment:
        "Dropped my phone multiple times and it's still in perfect condition. Highly recommend this case.",
      date: "2024-01-11",
      status: "approved",
      helpful: 20,
      reply:
        "We're so glad our case kept your phone safe! Thank you for the review.",
    },
  ]);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (reviewId) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, status: "approved" } : review
      )
    );
  };

  const handleReject = (reviewId) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, status: "rejected" } : review
      )
    );
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyDialog(true);
  };

  const submitReply = () => {
    if (selectedReview && replyText.trim()) {
      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id
            ? { ...review, reply: replyText.trim() }
            : review
        )
      );
      setShowReplyDialog(false);
      setReplyText("");
      setSelectedReview(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const reviewStats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    averageRating: (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Review Management</h1>
        <p className="text-muted-foreground">
          Manage customer reviews and feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Filter className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewStats.averageRating}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            Manage and moderate customer reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {review.product}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {review.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div>
                      <div className="font-medium text-sm">{review.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {review.comment}
                      </div>
                      {review.reply && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                          <strong>Reply:</strong> {review.reply}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(review.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {review.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(review.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReply(review)}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to {selectedReview?.customer}'s review for{" "}
              {selectedReview?.product}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {selectedReview && renderStars(selectedReview.rating)}
                <span className="font-medium">{selectedReview?.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedReview?.comment}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to this review..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitReply} disabled={!replyText.trim()}>
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
