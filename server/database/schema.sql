-- Admission Inquiries Database Schema
-- This file contains the SQL schema for the admission inquiries system

CREATE TABLE IF NOT EXISTS admission_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  previous_education TEXT,
  subjects TEXT NOT NULL, -- JSON array as string
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admission_inquiries_status ON admission_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_admission_inquiries_created_at ON admission_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admission_inquiries_email ON admission_inquiries(email);