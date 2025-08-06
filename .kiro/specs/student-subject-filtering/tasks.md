# Implementation Plan

- [x] 1. Set up backend models and database structure


  - Create StudentMark model in students app for storing student marks by subject
  - Create BookRecommendation model in recommendations app for subject-specific book recommendations
  - Generate and run database migrations for new models
  - _Requirements: 1.1, 3.1, 5.1_



- [x] 2. Implement backend API endpoints for marks system


  - Create api_get_student_marks endpoint that returns marks filtered by student's selected subjects
  - Add proper error handling for cases where no subjects are selected
  - Include percentage calculations and exam type filtering in the response


  - Write unit tests for the marks API endpoint
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement backend API endpoints for book recommendations
  - Create api_get_book_recommendations endpoint that returns recommendations filtered by selected subjects


  - Add logic to consider student's grade level when filtering recommendations
  - Handle empty state when no recommendations exist for selected subjects
  - Write unit tests for the book recommendations API endpoint
  - _Requirements: 3.1, 3.2, 3.3_



- [ ] 4. Create subject selection management API
  - Implement api_update_student_subjects endpoint to allow students to modify their subject selection
  - Add validation to ensure only valid subject IDs are accepted
  - Include proper error handling and success responses
  - Write unit tests for subject selection updates


  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Create SubjectFilterContext for frontend state management
  - Implement React context to manage selected subjects state across dashboard components
  - Add functions for updating subjects and handling loading states
  - Include error handling for API failures during subject updates


  - Write unit tests for the context provider
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Build SubjectSelectionManager component
  - Create reusable component for displaying and managing subject selection
  - Implement checkbox/toggle interface for selecting/deselecting subjects


  - Add save functionality that calls the backend API to persist changes
  - Include loading states and error handling for the selection interface
  - Write component tests for various selection scenarios
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Enhance marks section with subject filtering



  - Modify the marks table to display only subjects that the student has selected
  - Add empty state message when no subjects are selected or no marks exist
  - Implement loading skeleton while marks data is being fetched
  - Update marks section to use the new api_get_student_marks endpoint
  - Write tests for marks section with various data states
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 8. Enhance practice questions section with better filtering
  - Improve empty state handling when no questions exist for selected subjects
  - Add loading states while questions are being fetched
  - Ensure the subject dropdown only shows selected subjects
  - Update error handling for cases where practice questions API fails
  - Write tests for practice questions section edge cases
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9. Implement book recommendations section
  - Create new book recommendations section in the student dashboard
  - Display recommendations filtered by student's selected subjects
  - Add empty state message encouraging subject selection when no recommendations exist
  - Include book details like title, author, and description in the display
  - Write tests for book recommendations section with various data states
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 10. Add subject selection interface to dashboard
  - Integrate SubjectSelectionManager component into the student dashboard
  - Add a dedicated section or modal for managing subject preferences
  - Ensure subject changes immediately update all dashboard sections
  - Include visual feedback when subjects are being saved
  - Write integration tests for subject selection flow
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Implement unified dashboard loading and error states
  - Add consistent loading states across all dashboard sections
  - Implement error boundaries for graceful error handling
  - Show appropriate messages when no subjects are selected
  - Add retry functionality for failed API calls
  - Write tests for error scenarios and loading states
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12. Add dashboard integration and final testing
  - Integrate all enhanced sections into the main StudentDashboard component
  - Ensure all sections consistently reflect subject filtering
  - Add subject count display in the dashboard header
  - Implement session persistence for subject selection
  - Write end-to-end tests for complete dashboard functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4_