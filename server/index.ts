import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAdmissionEnquiry } from "./routes/enquiry";
import { handleAdminLogin } from "./routes/admin-login";
import { getAdminInquiries, updateInquiryStatus } from "./routes/admin-inquiries";
import { createProxyMiddleware } from "http-proxy-middleware";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Proxy /admin, /api/admin, and /accounts/api requests to Django backend
  app.use(
    ["/admin", "/api/admin", "/accounts/api"],
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      ws: false,
      pathRewrite: {
        '^/api/admin': '/accounts/api/admin'
      }
    })
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Admission enquiry routes
  app.post("/api/enquiry", handleAdmissionEnquiry);
  
  // Admin inquiry management routes
  app.get("/api/admin/inquiries", getAdminInquiries);
  app.put("/api/admin/inquiries/:id/status", updateInquiryStatus);
  app.post("/api/admin-login", handleAdminLogin);

  return app;
}
