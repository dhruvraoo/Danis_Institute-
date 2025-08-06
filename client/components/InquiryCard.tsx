import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdmissionInquiry } from "@/../shared/api";

interface InquiryCardProps {
  inquiry: AdmissionInquiry;
  onStatusUpdate: (inquiryId: number, newStatus: 'pending' | 'contacted' | 'resolved') => void;
  isUpdating?: boolean;
}

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending"
  },
  contacted: {
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    icon: AlertCircle,
    label: "Contacted"
  },
  resolved: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Resolved"
  }
};

export default function InquiryCard({ inquiry, onStatusUpdate, isUpdating = false }: InquiryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(inquiry.status);

  const statusInfo = statusConfig[inquiry.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusChange = (newStatus: 'pending' | 'contacted' | 'resolved') => {
    setSelectedStatus(newStatus);
    onStatusUpdate(inquiry.id, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{inquiry.fullName}</h3>
                <p className="text-sm text-gray-500">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {formatDate(inquiry.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`${statusInfo.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? "Less" : "More"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Basic Info - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{inquiry.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{inquiry.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <GraduationCap className="h-4 w-4" />
              <span>{inquiry.course}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{inquiry.subjects.join(", ")}</span>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t pt-4 space-y-4"
            >
              {inquiry.previousEducation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Previous Education</h4>
                  <p className="text-sm text-gray-600">{inquiry.previousEducation}</p>
                </div>
              )}

              {inquiry.message && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {inquiry.message}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  Last updated: {formatDate(inquiry.updatedAt)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Select
                    value={selectedStatus}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="contacted">
                        <div className="flex items-center">
                          <AlertCircle className="h-3 w-3 mr-2 text-blue-600" />
                          Contacted
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                          Resolved
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}