// import { ApifyClient } from 'apify-client'; // Removed

// Get Apify API token from environment variables
const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN || "";
const ACTOR_ID = "emQXBCL3xePZYgJyn";
const APIFY_BASE_URL = "https://api.apify.com/v2";

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to extract video ID from TikTok URL (handles all TikTok domain variants)
export function extractTikTokVideoId(url: string): string {
  // First check for standard TikTok URLs with video ID in path
  const standardRegex = /video\/(\d+)/;
  const standardMatch = url.match(standardRegex);
  
  if (standardMatch) {
    return standardMatch[1];
  }
  
  // If it's a shortened URL (like vm.tiktok.com/ZNd6XGGaP/), 
  // we can't extract the ID directly but can provide a placeholder
  // The actual video ID will be handled after redirect by Apify
  const shortUrlRegex = /vm\.tiktok\.com\/(\w+)/i;
  const shortUrlMatch = url.match(shortUrlRegex);
  
  if (shortUrlMatch) {
    return `shorturl-${shortUrlMatch[1]}`;
  }
  
  return "";
}

// Initialize the ApifyClient with API token - REMOVED
// const client = new ApifyClient({
//   token: APIFY_API_TOKEN,
// });

/**
 * Processes WebVTT transcript format to extract clean text
 */
function processWebVTTTranscript(transcript: string): string {
  const lines = transcript.split('\n');
  const textLines: string[] = [];
  
  // Extract only the text lines (not timestamps)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, WEBVTT header, and timestamp lines
    if (line && 
        !line.startsWith('WEBVTT') && 
        !line.match(/^\d{2}:\d{2}:\d{2}/) && 
        !line.includes('-->')) {
      textLines.push(line);
    }
  }
  
  // Join all the text lines
  return textLines.join(' ');
}

/**
 * Fetches TikTok transcript using Apify API with fetch
 */
export async function fetchTikTokTranscript(tiktokUrl: string): Promise<string> {
  try {
    if (!APIFY_API_TOKEN) {
      console.log("Apify API token not found in environment variables. Returning mock transcript.");
      const videoId = extractTikTokVideoId(tiktokUrl);
      // Simulate a delay and return a mock transcript for testing without a token
      await delay(1000); 
      return `Dies ist ein Beispiel-Transkript für TikTok Video ID: ${videoId}. Stellen Sie sicher, dass VITE_APIFY_API_TOKEN in Ihrer .env Datei konfiguriert ist.`;
    }

    console.log(`Fetching transcript for TikTok video: ${tiktokUrl} using fetch`);
    
    // Prepare Actor input
    const input = {
      // "videos": [{ "url": tiktokUrl }]
      "videos": [tiktokUrl] 
    };

    // 1. Start Actor Run
    console.log(`Calling Apify actor ${ACTOR_ID} via fetch`);
    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }
    );

    if (!runResponse.ok) {
      let errorData;
      try {
        errorData = await runResponse.json();
      } catch (e) {
        errorData = { error: { message: runResponse.statusText } };
      }
      throw new Error(`Failed to start Apify actor: ${errorData.error?.message || runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const run = runData.data; 
    if (!run || !run.id || !run.defaultDatasetId) {
        throw new Error("Failed to get valid run details from Apify actor start response.");
    }
    console.log("Apify actor run initiated. Run ID:", run.id, "Dataset ID:", run.defaultDatasetId);
    
    // 2. Poll Actor Run Status
    let runStatus = run.status;
    const maxRetries = 30; // 30 * 2s = 60s timeout
    let retries = 0;

    console.log(`Polling status for run ID: ${run.id}`);
    while ((runStatus === "READY" || runStatus === "RUNNING") && retries < maxRetries) {
      await delay(2000); // Poll every 2 seconds

      const statusResponse = await fetch(
        `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs/${run.id}?token=${APIFY_API_TOKEN}`
      );
      if (!statusResponse.ok) {
        let errorData;
        try {
          errorData = await statusResponse.json();
        } catch (e) {
          errorData = { error: { message: statusResponse.statusText } };
        }
        console.warn(`Polling failed for run ID ${run.id}, attempt ${retries + 1}: ${errorData.error?.message || statusResponse.statusText}`);
        // Continue polling in case of transient network issues, but log warning
      } else {
        const statusData = await statusResponse.json();
        if (statusData && statusData.data && statusData.data.status) {
          runStatus = statusData.data.status;
          console.log(`Run status for ${run.id}: ${runStatus}`);
        } else {
          console.warn(`Invalid status response for run ID ${run.id}, attempt ${retries + 1}`);
        }
      }
      retries++;
    }

    if (retries >= maxRetries && (runStatus === "READY" || runStatus === "RUNNING")) {
      throw new Error(`Apify actor run timed out for run ID: ${run.id} after ${maxRetries * 2} seconds.`);
    }

    if (runStatus !== "SUCCEEDED") {
      throw new Error(`Apify actor run ${run.id} did not succeed. Final status: ${runStatus}`);
    }
    
    // 3. Fetch Results from the run's dataset
    console.log('Fetching results from dataset:', run.defaultDatasetId);
    const datasetItemsResponse = await fetch(
      `${APIFY_BASE_URL}/datasets/${run.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`
    );
    
    if (!datasetItemsResponse.ok) {
      let errorData;
      try {
        errorData = await datasetItemsResponse.json();
      } catch (e) {
        errorData = { error: { message: datasetItemsResponse.statusText } };
      }
      throw new Error(`Failed to fetch dataset items: ${errorData.error?.message || datasetItemsResponse.statusText}`);
    }
    
    const items = await datasetItemsResponse.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn("No items found in Apify dataset for URL:", tiktokUrl, "Dataset ID:", run.defaultDatasetId);
      const videoId = extractTikTokVideoId(tiktokUrl);
      // return `Video gefunden, aber kein Transkript verfügbar für Video ID: ${videoId}. Überprüfen Sie die Datenstruktur: ${Object.keys(videoData).join(", ")}`;
      return `Video gefunden, aber kein Transkript verfügbar für Video ID: ${videoId}.`;
    }
    
    const videoData = items[0] as any; // Cast to any to access dynamic properties
    console.log("Video data structure received:", Object.keys(videoData));
    
    // Extract transcript from response
    if (videoData.transcript && typeof videoData.transcript === 'string') {
      console.log("Found transcript in WebVTT format");
      return processWebVTTTranscript(videoData.transcript);
    } 
    // Fallback to other potential fields
    else if (videoData.subtitles && Array.isArray(videoData.subtitles) && videoData.subtitles.length > 0) {
      console.log("Found subtitles array");
      return videoData.subtitles.join(" ");
    } else if (videoData.text && typeof videoData.text === 'string') {
      console.log("Found text field");
      return videoData.text;
    } else {
      console.warn("No suitable transcript field found in Apify response:", videoData);
      const videoId = extractTikTokVideoId(tiktokUrl);
      return `Video gefunden, aber kein Transkript verfügbar für Video ID: ${videoId}. Überprüfen Sie die Datenstruktur: ${Object.keys(videoData).join(", ")}`;
    }
  } catch (error: any) {
    console.error("Error in fetchTikTokTranscript:", error);
    // Provide a more specific error message if possible
    const errorMessage = error.message || "Unbekannter Fehler beim Abrufen des Transkripts.";
    throw new Error(`Fehler bei der TikTok-Transkript-Anfrage: ${errorMessage}`);
  }
}