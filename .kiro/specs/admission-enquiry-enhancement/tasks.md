# Implementation Plan

- [x] 1. Set up database infrastructure and models






  - Create SQLite database initialization script with admission_inquiries table
  - Implement database service class with CRUD operations for inquiries




  - Add database connection and error handling utilities
  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [x] 2. Enhance backend API endpoints



  - [ ] 2.1 Update existing enquiry endpoint to store data in database
    - Modify server/routes/enquiry.ts to save inquiries to SQLite database
    - Add proper error handling and validation
    - Update response to include inquiry ID




    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 2.2 Create admin inquiries API endpoints
    - Implement GET /api/admin/inquiries endpoint to retrieve all inquiries
    - Implement PUT /api/admin/inquiries/:id/status endpoint for status updates






    - Add inquiry statistics endpoint for dashboard summary
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Update shared API types and interfaces

  - Add new TypeScript interfaces for AdmissionInquiry database model
  - Add InquiryStats interface for dashboard statistics
  - Add status update request/response types

  - Update existing AdmissionEnquiryResponse to include inquiry ID






  - _Requirements: 2.2, 2.3, 3.2, 4.1_

- [ ] 4. Enhance admission enquiry form component
  - [x] 4.1 Modify form step flow to show success confirmation in step 3



    - Update AdmissionEnquiry component to show "Inquiry sent to admin successfully" in step 3
    - Move optional message field from step 3 to step 2
    - Update form validation and step navigation logic

    - _Requirements: 1.1, 1.2, 1.3_





  - [ ] 4.2 Improve form submission handling
    - Add loading states during form submission
    - Implement proper error handling with user-friendly messages


    - Add success confirmation with inquiry reference

    - _Requirements: 1.3, 1.4_

- [ ] 5. Create inquiry management components for admin dashboard
  - [ ] 5.1 Create InquiryCard component for displaying individual inquiries
    - Build reusable card component showing inquiry details


    - Add status badge with color coding

    - Include action buttons for status updates
    - _Requirements: 3.2, 3.3, 4.3_

  - [ ] 5.2 Create InquiryManagement component for inquiry list
    - Implement inquiry list with filtering by status


    - Add search functionality for inquiries


    - Implement status update functionality with optimistic updates
    - Add inquiry statistics summary display

    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.4_

- [x] 6. Integrate inquiry management into admin dashboard


  - Add InquiryManagement component to AdminDashboard page
  - Update dashboard layout to accommodate inquiry section
  - Add navigation and section organization for inquiries
  - Implement responsive design for inquiry management
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Add form validation and error handling
  - Implement comprehensive client-side validation for all form fields
  - Add server-side validation using Zod schemas
  - Create error boundary components for graceful error handling
  - Add toast notifications for success and error states
  - _Requirements: 1.4, 2.1_

- [ ] 8. Implement database initialization and migration
  - Create database setup script that runs on server startup
  - Add database migration logic for creating tables
  - Implement database connection testing and error recovery
  - Add database seeding for development/testing
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 9. Add comprehensive testing for inquiry system
  - Write unit tests for database service methods
  - Create integration tests for API endpoints
  - Add component tests for form submission flow
  - Implement end-to-end tests for complete inquiry workflow
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1_

- [ ] 10. Optimize performance and add security measures
  - Implement rate limiting for form submissions
  - Add input sanitization and validation
  - Optimize database queries with proper indexing
  - Add pagination for inquiry lists in admin dashboard
  - _Requirements: 2.1, 3.5, 4.4_