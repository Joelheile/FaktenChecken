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
    console.log('Using API token:', token);
    
    try {
        // Step 1: Run the Apify actor with the TikTok URL
        console.log('Running actor...');
        const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "startUrls": [{ "url": testUrl }]
            })
        });
        
        if (!runResponse.ok) {
            throw new Error(`Apify run error: ${runResponse.status}`);
        }
        
        const runData = await runResponse.json();
        console.log('Actor run started');
        console.log('Run ID:', runData.id);
        
        // Step 2: Wait for the run to complete and get dataset ID
        console.log('\nWaiting for run to complete...');
        let datasetId = '';
        let attempt = 0;
        
        while (attempt < 20) {
            attempt++;
            console.log(`Checking run status, attempt ${attempt}...`);
            
            const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runData.id}?token=${token}`);
            if (!statusResponse.ok) {
                throw new Error(`Apify status check error: ${statusResponse.status}`);
            }
            
            const statusData = await statusResponse.json();
            console.log(`Run status: ${statusData.status}`);
            
            if (statusData.status === "SUCCEEDED") {
                datasetId = statusData.defaultDatasetId;
                console.log(`Run succeeded, dataset ID: ${datasetId}`);
                break;
            } else if (statusData.status === "FAILED" || statusData.status === "TIMED-OUT" || statusData.status === "ABORTED") {
                throw new Error(`Apify run failed with status: ${statusData.status}`);
            }
            
            // Wait 2 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (!datasetId) {
            throw new Error("Timed out waiting for Apify run to complete");
        }
        
        // Step 3: Get items from the dataset
        console.log('\nFetching items from dataset...');
        const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
        if (!datasetResponse.ok) {
            throw new Error(`Apify dataset error: ${datasetResponse.status}`);
        }
        
        const items = await datasetResponse.json();
        console.log(`Found ${items.length} items in the dataset`);
        
        if (items.length > 0) {
            // Log the structure of the first item (keys only)
            console.log('\nFirst item structure:', Object.keys(items[0]));
            
            // Check for subtitles, transcript, or text fields
            const item = items[0] as Record<string, any>;
            if (item.subtitles && Array.isArray(item.subtitles)) {
                console.log('\nSubtitles found:', item.subtitles.length);
                console.log('\nSample subtitle:', item.subtitles[0]);
            } else {
                console.log('\nNo subtitles array found');
            }
            
            if (item.transcript) {
                console.log('\nTranscript found:', typeof item.transcript);
                console.log('\nSample transcript (first 100 chars):', item.transcript.substring(0, 100));
            } else {
                console.log('\nNo transcript field found');
            }
            
            if (item.text) {
                console.log('\nText field found:', typeof item.text);
                console.log('\nSample text (first 100 chars):', item.text.substring(0, 100));
            } else {
                console.log('\nNo text field found');
            }
            
            // Print full first item for detailed inspection
            console.log('\nFull item data:');
            console.dir(item, { depth: 5 });
        }
    } catch (error) {
        console.error('Error during Apify test:', error);
    }
}

// Run the test if this file is executed directly
if (import.meta.url.includes(process.argv[1])) {
    testApify().then(() => console.log('Test completed'));
} 