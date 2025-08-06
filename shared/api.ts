/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface AdmissionEnquiryRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  previousEducation: string;
  subjects: string[];
  message?: string;
}

export interface AdmissionEnquiryResponse {
  success: boolean;
  message: string;
  inquiryId?: number;
}

export interface AdmissionInquiry {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  previousEducation: string;
  subjects: string[];
  message: string;
  status: 'pending' | 'contacted' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
}

export interface AdminInquiriesResponse {
  success: boolean;
  inquiries: AdmissionInquiry[];
  stats: InquiryStats;
  message?: string;
}

export interface UpdateInquiryStatusRequest {
  status: 'pending' | 'contacted' | 'resolved';
}

export interface UpdateInquiryStatusResponse {
  success: boolean;
  message: string;
  inquiry?: {
    id: number;
    status: string;
    updatedAt: string;
  };
}
