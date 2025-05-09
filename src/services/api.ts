// API service for TikTok transcription and fact-checking with ChatGPT

/**
 * SETUP INSTRUCTIONS:
 * 
 * This application now uses environment variables for API keys:
 * - VITE_APIFY_API_TOKEN: For Apify TikTok transcripts
 * - VITE_OPENAI_API_KEY: For ChatGPT fact checking
 */

import { fetchTikTokTranscript } from './apify';
import { askFollowupQuestion as askOpenAIFollowup, performFactCheck, resetConversation } from './openai';

export interface FactCheckResponse {
  transcript: string;
  factCheck: string;
  conversationId?: string; // Add conversation ID to maintain context
}

// Main function to transcribe and fact check
export async function transcribeAndFactCheck(tiktokUrl: string): Promise<FactCheckResponse> {
  console.log(`Prüfe TikTok URL: ${tiktokUrl}`);
  
  // Reset conversation for new request
  resetConversation();
  
  // Get transcript from Apify API (or mock)
  const transcript = await fetchTikTokTranscript(tiktokUrl);
  
  // Get fact check from ChatGPT 3.5 Turbo
  const factCheck = await performFactCheck(transcript);
  
  return {
    transcript,
    factCheck
  };
}

// Handle follow-up questions
export async function askFollowupQuestion(question: string): Promise<string> {
  // Get the answer from OpenAI
  const answer = await askOpenAIFollowup(question);
  
  // Format the answer with the follow-up question marker
  return `--- Folgende Frage ---\n\n${question}\n\n${answer}`;
}
