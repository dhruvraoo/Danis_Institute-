import { RequestHandler } from "express";
import { AdmissionEnquiryRequest, AdmissionEnquiryResponse } from "../../shared/api";

export const handleAdmissionEnquiry: RequestHandler = async (req, res) => {
  try {
    const enquiry = req.body as AdmissionEnquiryRequest;
    
    // Forward the request to Django backend
    const djangoResponse = await fetch('http://localhost:8000/students/admission-inquiry/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enquiry),
    });
    
    const result = await djangoResponse.json();
    
    if (result.success) {
      const response: AdmissionEnquiryResponse = {
        success: true,
        message: result.message,
        inquiryId: result.inquiry_id
      };
      res.json(response);
    } else {
      const response: AdmissionEnquiryResponse = {
        success: false,
        message: result.message || "Failed to submit enquiry"
      };
      res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error forwarding enquiry to Django:", error);
    const response: AdmissionEnquiryResponse = {
      success: false,
      message: "Failed to submit enquiry. Please try again later."
    };
    res.status(500).json(response);
  }
}; 