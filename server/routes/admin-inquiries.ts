import { RequestHandler } from "express";

export const getAdminInquiries: RequestHandler = async (req, res) => {
  try {
    const status = req.query.status as string;
    const queryParam = status ? `?status=${status}` : '';
    
    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const djangoResponse = await fetch(`http://localhost:8000/students/admin/inquiries/${queryParam}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!djangoResponse.ok) {
      throw new Error(`Django server responded with status: ${djangoResponse.status}`);
    }
    
    const result = await djangoResponse.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error fetching inquiries from Django:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch inquiries";
    if (error.name === 'AbortError') {
      errorMessage = "Request to Django server timed out";
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Django server. Please ensure it's running on port 8000.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const updateInquiryStatus: RequestHandler = async (req, res) => {
  try {
    const inquiryId = req.params.id;
    const { status } = req.body;
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const djangoResponse = await fetch(`http://localhost:8000/students/admin/inquiries/${inquiryId}/status/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!djangoResponse.ok) {
      throw new Error(`Django server responded with status: ${djangoResponse.status}`);
    }
    
    const result = await djangoResponse.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(djangoResponse.status).json(result);
    }
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    
    let errorMessage = "Failed to update inquiry status";
    if (error.name === 'AbortError') {
      errorMessage = "Request to Django server timed out";
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Django server. Please ensure it's running on port 8000.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};