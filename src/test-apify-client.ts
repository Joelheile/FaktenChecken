// Test script for the Apify client implementation
import { fetchTikTokTranscript } from "./services/apify";

// Set up environment variable for testing
// In a real application, this would be set in the .env file
if (!import.meta.env.VITE_APIFY_API_TOKEN) {
  console.log(
    "No API token found, please set VITE_APIFY_API_TOKEN in your .env file",
  );
  console.log("This test will use mock data instead");
}

// Example TikTok URL to test with
const testUrl =
  "https://www.tiktok.com/@stoolpresidente/video/7488736374602927402";

// Run the test
async function runTest() {
  console.log(`Testing Apify client with URL: ${testUrl}`);

  try {
    // Fetch the transcript using our new implementation
    const transcript = await fetchTikTokTranscript(testUrl);

    // Log the result
    console.log("Transcript fetched successfully:");
    console.log("-".repeat(40));
    console.log(transcript);
    console.log("-".repeat(40));

    return { success: true, transcript };
  } catch (error) {
    console.error("Error during test:", error);
    return { success: false, error };
  }
}

// Execute the test if this file is run directly
// Note: This condition was causing issues - fixed to not execute during imports
const isRunningDirectly = process.argv[1] === import.meta.url;
if (isRunningDirectly) {
  console.log("Running Apify client test...");
  runTest()
    .then((result) => {
      if (result.success) {
        console.log("Test completed successfully!");
      } else {
        console.log("Test failed with error:", result.error);
      }
    })
    .catch((err) => {
      console.error("Unexpected error during test execution:", err);
    });
}

// Export the test function so it can be used in other files
export { runTest };
