// IMPORTANT: This is a legacy test script kept for reference.
// For the modern implementation using the apify-client package,
// please see src/test-apify-client.ts and src/services/apify.ts

const { ApifyClient } = require("apify-client");

// Get the Apify API token from environment or use the one provided
const token =
  process.env.APIFY_TOKEN || "apify_api_OXPkNHp4pulK6sKVWinei9kzvHxkD94rTFLw";

// Initialize the ApifyClient with API token
const client = new ApifyClient({
  token: token,
});

// Prepare Actor input
const input = {
  videos: ["https://www.tiktok.com/@stoolpresidente/video/7488736374602927402"],
};

// The Actor ID for the TikTok scraper
const ACTOR_ID = "emQXBCL3xePZYgJyn";

async function testApify() {
  console.log("Starting Apify test script...");
  console.log("Using API token:", token);

  try {
    // Run the Actor and wait for it to finish
    console.log("Running actor...");
    const run = await client.actor(ACTOR_ID).call(input);
    console.log("Actor run finished");
    console.log("Run ID:", run.id);
    console.log("Default dataset ID:", run.defaultDatasetId);

    // Fetch and print Actor results from the run's dataset
    console.log("\nFetching results from dataset...");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Found ${items.length} items in the dataset`);

    if (items.length > 0) {
      // Log the structure of the first item (keys only)
      console.log("\nFirst item structure:", Object.keys(items[0]));

      // Check for subtitles, transcript, or text fields
      const item = items[0];
      if (item.subtitles && Array.isArray(item.subtitles)) {
        console.log("\nSubtitles found:", item.subtitles.length);
        console.log("\nSample subtitle:", item.subtitles[0]);
      } else {
        console.log("\nNo subtitles array found");
      }

      if (item.transcript) {
        console.log("\nTranscript found:", typeof item.transcript);
        console.log(
          "\nSample transcript (first 100 chars):",
          item.transcript.substring(0, 100),
        );
      } else {
        console.log("\nNo transcript field found");
      }

      if (item.text) {
        console.log("\nText field found:", typeof item.text);
        console.log(
          "\nSample text (first 100 chars):",
          item.text.substring(0, 100),
        );
      } else {
        console.log("\nNo text field found");
      }

      // Print full first item for detailed inspection
      console.log("\nFull item data:");
      console.dir(item, { depth: 5 });
    }
  } catch (error) {
    console.error("Error during Apify test:", error);
  }
}

// Run the test
testApify().then(() => console.log("Test completed"));
