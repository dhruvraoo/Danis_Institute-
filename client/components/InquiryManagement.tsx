import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InquiryCard from "./InquiryCard";
import { AdmissionInquiry, AdminInquiriesResponse, InquiryStats } from "@/../shared/api";
import { useToast } from "@/hooks/use-toast";

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats>({ total: 0, pending: 0, contacted: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingInquiry, setUpdatingInquiry] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchInquiries = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (status && status !== "all") {
        queryParams.append("status", status);
      }
      
      const response = await fetch(`/api/admin/inquiries?${queryParams}`);
      const data: AdminInquiriesResponse = await response.json();
      
      if (data.success) {
        setInquiries(data.inquiries);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch inquiries");
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError("Failed to fetch inquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: number, newStatus: 'pending' | 'contacted' | 'resolved') => {
    try {
      setUpdatingInquiry(inquiryId);
      
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the inquiry in the local state
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry.id === inquiryId 
              ? { ...inquiry, status: newStatus, updatedAt: new Date().toISOString() }
              : inquiry
          )
        );
        
        // Update stats
        await fetchInquiries(statusFilter === "all" ? undefined : statusFilter);
        
        toast({
          variant: "success",
          title: "Status Updated",
          description: `Inquiry status changed to ${newStatus}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: data.message || "Failed to update status",
        });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to update status. Please try again.",
      });
    } finally {
      setUpdatingInquiry(null);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    fetchInquiries(newFilter === "all" ? undefined : newFilter);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === "" || 
      inquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.includes(searchTerm) ||
      inquiry.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading inquiries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Inquiries</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => fetchInquiries()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Inbox className="h-5 w-5 text-blue-600" />
              <span>Admission Inquiries</span>
            </div>
            <Button 
              onClick={() => fetchInquiries(statusFilter === "all" ? undefined : statusFilter)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, phone, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inquiries List */}
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No admission inquiries have been submitted yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <InquiryCard
                    inquiry={inquiry}
                    onStatusUpdate={handleStatusUpdate}
                    isUpdating={updatingInquiry === inquiry.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}