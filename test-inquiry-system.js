// Simple test script to verify the inquiry system works
const testInquirySubmission = async () => {
  const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    course: "12th",
    previousEducation: "High School (12th Grade)",
    subjects: ["Physics", "Chemistry", "Maths"],
    message: "I am interested in joining your institute."
  };

  try {
    console.log("Testing inquiry submission...");
    
    // Test submission
    const response = await fetch('http://localhost:3000/api/enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Submission result:", result);

    if (result.success) {
      console.log("✅ Inquiry submission test passed");
      
      // Test fetching inquiries
      console.log("Testing inquiry retrieval...");
      const inquiriesResponse = await fetch('http://localhost:3000/api/admin/inquiries');
      const inquiriesResult = await inquiriesResponse.json();
      
      console.log("Inquiries result:", inquiriesResult);
      
      if (inquiriesResult.success) {
        console.log("✅ Inquiry retrieval test passed");
        console.log(`Found ${inquiriesResult.inquiries.length} inquiries`);
        console.log("Stats:", inquiriesResult.stats);
        
        // Test status update if we have inquiries
        if (inquiriesResult.inquiries.length > 0) {
          const firstInquiry = inquiriesResult.inquiries[0];
          console.log("Testing status update...");
          
          const statusResponse = await fetch(`http://localhost:3000/api/admin/inquiries/${firstInquiry.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'contacted' }),
          });
          
          const statusResult = await statusResponse.json();
          console.log("Status update result:", statusResult);
          
          if (statusResult.success) {
            console.log("✅ Status update test passed");
          } else {
            console.log("❌ Status update test failed");
          }
        }
      } else {
        console.log("❌ Inquiry retrieval test failed");
      }
    } else {
      console.log("❌ Inquiry submission test failed");
    }
  } catch (error) {
    console.error("Test error:", error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testInquirySubmission();
}

module.exports = { testInquirySubmission };