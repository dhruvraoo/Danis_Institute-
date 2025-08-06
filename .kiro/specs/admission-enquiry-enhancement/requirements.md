# Requirements Document

## Introduction

This feature enhances the existing admission enquiry form on the home page to provide a complete inquiry submission and management system. The current form has 3 steps but needs improvements to properly handle form submission, display success confirmation, store inquiries, and show them in the admin dashboard for management.

## Requirements

### Requirement 1

**User Story:** As a prospective student, I want to submit my admission inquiry through the multi-step form and receive immediate confirmation, so that I know my inquiry was successfully sent.

#### Acceptance Criteria

1. WHEN I complete step 2 of the form and click "Next" THEN the system SHALL proceed to step 3 showing the success confirmation
2. WHEN I reach step 3 THEN the system SHALL display "Inquiry sent to admin successfully" message
3. WHEN the inquiry is submitted THEN the system SHALL show a success confirmation with appropriate messaging
4. WHEN the inquiry submission fails THEN the system SHALL display an appropriate error message

### Requirement 2

**User Story:** As a prospective student, I want my inquiry data to be properly stored in the system, so that the admin can review and respond to my inquiry.

#### Acceptance Criteria

1. WHEN I submit the admission inquiry form THEN the system SHALL store all form data including firstName, lastName, email, phone, course, subjects, and optional message
2. WHEN the inquiry is stored THEN the system SHALL include a timestamp of submission
3. WHEN the inquiry is stored THEN the system SHALL assign a unique identifier to the inquiry
4. WHEN the inquiry is stored THEN the system SHALL set the initial status as "pending"

### Requirement 3

**User Story:** As an admin, I want to view all admission inquiries in my dashboard, so that I can review and manage prospective student applications.

#### Acceptance Criteria

1. WHEN I access the admin dashboard THEN the system SHALL display a section for admission inquiries
2. WHEN viewing admission inquiries THEN the system SHALL show inquiry details including name, email, phone, course, subjects, message, and submission date
3. WHEN viewing admission inquiries THEN the system SHALL display the current status of each inquiry (pending, contacted, resolved)
4. WHEN viewing admission inquiries THEN the system SHALL allow me to update the status of inquiries
5. WHEN viewing admission inquiries THEN the system SHALL show inquiries in reverse chronological order (newest first)

### Requirement 4

**User Story:** As an admin, I want to manage inquiry statuses and take actions on inquiries, so that I can track my follow-up progress with prospective students.

#### Acceptance Criteria

1. WHEN I view an inquiry THEN the system SHALL allow me to change its status between "pending", "contacted", and "resolved"
2. WHEN I update an inquiry status THEN the system SHALL save the status change with a timestamp
3. WHEN I view inquiries THEN the system SHALL provide visual indicators for different status types
4. WHEN I view inquiries THEN the system SHALL show a count of inquiries by status (pending, contacted, resolved)