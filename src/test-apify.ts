/**
 * Test script for Apify TikTok transcription integration using direct fetch API
 */

// Get the Apify API token from environment or use the one provided
const token = process.env.APIFY_TOKEN || 'apify_api_OXPkNHp4pulK6sKVWinei9kzvHxkD94rTFLw';

// The Actor ID for the TikTok scraper
const ACTOR_ID = "emQXBCL3xePZYgJyn";

// TikTok URL to test
const testUrl = "https://www.tiktok.com/@stoolpresidente/video/7488736374602927402";

async function testApify() {
  console.log('Starting Apify test script...');
  
  try {
    const runData = await runActor();
    const datasetId = await waitForRunCompletion(runData.id);
    await fetchAndAnalyzeResults(datasetId);
  } catch (error) {
    console.error('Error during Apify test:', error);
  }
}

async function runActor() {
  console.log('Running actor...');
  
  const response = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "startUrls": [{ "url": testUrl }] })
  });
  
  if (!response.ok) {
    throw new Error(`Apify run error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Actor run started', 'Run ID:', data.id);
  
  return data;
}

async function waitForRunCompletion(runId: string): Promise<string> {
  console.log('\nWaiting for run to complete...');
  let attempt = 0;
  
  while (attempt < 20) {
    attempt++;
    console.log(`Checking run status, attempt ${attempt}...`);
    
    const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    if (!response.ok) {
      throw new Error(`Apify status check error: ${response.status}`);
    }
    
    const statusData = await response.json();
    console.log(`Run status: ${statusData.status}`);
    
    if (statusData.status === "SUCCEEDED") {
      console.log(`Run succeeded, dataset ID: ${statusData.defaultDatasetId}`);
      return statusData.defaultDatasetId;
    } 
    
    if (["FAILED", "TIMED-OUT", "ABORTED"].includes(statusData.status)) {
      throw new Error(`Apify run failed with status: ${statusData.status}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error("Timed out waiting for Apify run to complete");
}

async function fetchAndAnalyzeResults(datasetId: string) {
  console.log('\nFetching items from dataset...');
  
  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
  if (!response.ok) {
    throw new Error(`Apify dataset error: ${response.status}`);
  }
  
  const items = await response.json();
  console.log(`Found ${items.length} items in the dataset`);
  
  if (items.length > 0) {
    console.log('\nFirst item structure:', Object.keys(items[0]));
    
    const item = items[0] as Record<string, any>;
    analyzeField(item, 'subtitles', isArray);
    analyzeField(item, 'transcript', isString);
    analyzeField(item, 'text', isString);
    
    console.log('\nFull item data:');
    console.dir(item, { depth: 5 });
  }
}

function analyzeField(item: Record<string, any>, fieldName: string, typeCheck: (val: any) => boolean) {
  if (item[fieldName] && typeCheck(item[fieldName])) {
    console.log(`\n${fieldName} found:`, typeof item[fieldName]);
    
    if (Array.isArray(item[fieldName])) {
      console.log(`\nSample ${fieldName}:`, item[fieldName][0]);
    } else if (typeof item[fieldName] === 'string') {
      console.log(`\nSample ${fieldName} (first 100 chars):`, item[fieldName].substring(0, 100));
    }
  } else {
    console.log(`\nNo ${fieldName} field found`);
  }
}

function isArray(val: any): boolean {
  return Array.isArray(val);
}

function isString(val: any): boolean {
  return typeof val === 'string';
}

// Run the test if this file is executed directly
if (import.meta.url.includes(process.argv[1])) {
  testApify().then(() => console.log('Test completed'));
}
