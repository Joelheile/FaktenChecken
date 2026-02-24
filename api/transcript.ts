import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 120,
};

const APIFY_BASE_URL = 'https://api.apify.com/v2';
const ACTOR_ID = 'emQXBCL3xePZYgJyn';
const MAX_RETRIES = 60;
const POLL_DELAY_MS = 2000;

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

interface ApifyDatasetItem {
  transcript?: string;
  subtitles?: string[];
  text?: string;
}

function processWebVTT(vtt: string): string {
  const lines = vtt.split('\n');
  const filtered = lines
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('WEBVTT')) return false;
      if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) return false;
      if (trimmed.includes('-->')) return false;
      return true;
    })
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return filtered.join(' ');
}

function extractTranscript(item: ApifyDatasetItem): string | null {
  // Check transcript (WebVTT format)
  if (item.transcript) {
    const processed = processWebVTT(item.transcript);
    if (processed) return processed;
  }

  // Check subtitles array
  if (item.subtitles && Array.isArray(item.subtitles)) {
    const joined = item.subtitles.join(' ').trim();
    if (joined) return joined;
  }

  // Check text
  if (item.text) {
    return item.text.trim();
  }

  return null;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Validate request body
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid url parameter' });
    return;
  }

  // Check for API token
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    res.status(500).json({ error: 'Server configuration error: missing API token' });
    return;
  }

  try {
    // Start the actor run
    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${apiToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videos: [url],
        }),
      }
    );

    if (!runResponse.ok) {
      throw new Error(`Failed to start actor run: ${runResponse.statusText}`);
    }

    const runData: ApifyRunResponse = await runResponse.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    // Poll for completion
    let status = runData.data.status;
    let retries = 0;

    while (status !== 'SUCCEEDED' && retries < MAX_RETRIES) {
      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Actor run ${status.toLowerCase()}`);
      }

      await delay(POLL_DELAY_MS);
      retries++;

      const statusResponse = await fetch(
        `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs/${runId}?token=${apiToken}`
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.statusText}`);
      }

      const statusData: ApifyRunResponse = await statusResponse.json();
      status = statusData.data.status;
    }

    if (status !== 'SUCCEEDED') {
      throw new Error('Actor run timed out');
    }

    // Fetch dataset items
    const datasetResponse = await fetch(
      `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiToken}`
    );

    if (!datasetResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetResponse.statusText}`);
    }

    const items: ApifyDatasetItem[] = await datasetResponse.json();

    if (!items || items.length === 0) {
      throw new Error('No data returned from actor');
    }

    // Extract transcript from first item
    const transcript = extractTranscript(items[0]);

    if (!transcript) {
      throw new Error('No transcript found in response');
    }

    res.status(200).json({ transcript });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Failed to fetch transcript',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
