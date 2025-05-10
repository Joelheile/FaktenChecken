import { fetchTikTokTranscript } from './apify';
import { askFollowupQuestion as askOpenAIFollowup, performFactCheck, resetConversation } from './openai';

/**
 * Response structure for fact checking operations
 */
export interface FactCheckResponse {
  /** The transcript text extracted from the TikTok video */
  transcript: string;
  /** The fact-checking analysis performed on the transcript */
  factCheck: string;
  /** Optional conversation ID to maintain context across requests */
  conversationId?: string;
}

/**
 * Error types that can occur during API operations
 */
export enum ApiErrorType {
  TRANSCRIPTION_ERROR = 'transcription_error',
  FACT_CHECK_ERROR = 'fact_check_error',
  FOLLOWUP_ERROR = 'followup_error',
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
}

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  type: ApiErrorType;
  
  constructor(message: string, type: ApiErrorType) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
  }
}

/**
 * Main function to transcribe a TikTok video and perform fact checking on its content
 * 
 * @param tiktokUrl - The URL of the TikTok video to analyze (kann leer sein, wenn nur statement angegeben ist)
 * @param statement - Optional statement to be fact-checked alongside or instead of the video content
 * @returns A promise that resolves to a FactCheckResponse
 * @throws ApiError if the transcription or fact-checking fails
 */
export async function transcribeAndFactCheck(tiktokUrl: string, statement?: string): Promise<FactCheckResponse> {
  if (tiktokUrl) {
    console.log(`Analyzing TikTok URL: ${tiktokUrl}`);
  }
  
  if (statement) {
    console.log(`Statement to check: ${statement}`);
  }
  
  // Reset conversation context for new request
  resetConversation();
  
  try {
    let transcript = "";
    
    // Nur TikTok Video transkribieren wenn eine URL angegeben wurde
    if (tiktokUrl) {
      // Get transcript from Apify API
      transcript = await fetchTikTokTranscript(tiktokUrl);
      
      if (!transcript || transcript.trim().length < 5) {
        console.warn('Retrieved empty or very short transcript');
      }
    }
    
    // Get fact check from OpenAI
    const factCheck = await performFactCheck(transcript, statement);
    
    return {
      transcript,
      factCheck
    };
  } catch (error) {
    // Determine error type and rethrow with appropriate context
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('TikTok') || errorMessage.includes('transcription')) {
        throw new ApiError(
          `Failed to transcribe TikTok video: ${errorMessage}`, 
          ApiErrorType.TRANSCRIPTION_ERROR
        );
      } else if (errorMessage.includes('ChatGPT') || errorMessage.includes('fact check')) {
        throw new ApiError(
          `Failed to perform fact check: ${errorMessage}`, 
          ApiErrorType.FACT_CHECK_ERROR
        );
      } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        throw new ApiError(
          `Authentication error: ${errorMessage}`, 
          ApiErrorType.AUTH_ERROR
        );
      }
      
      // Generic error fallback
      throw new ApiError(
        `Error during analysis: ${errorMessage}`,
        ApiErrorType.NETWORK_ERROR
      );
    }
    
    // For non-Error objects
    throw new ApiError(
      'An unknown error occurred during analysis',
      ApiErrorType.NETWORK_ERROR
    );
  }
}

/**
 * Handles follow-up questions about a previously performed fact check
 * 
 * @param question - The follow-up question to ask
 * @returns A promise that resolves to the answer string
 * @throws ApiError if the follow-up question processing fails
 */
export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    // Get the answer from OpenAI
    const answer = await askOpenAIFollowup(question);
    
    // Format and return the answer with the follow-up question marker for UI display
    return `--- Folgende Frage ---\n\n${question}\n\n${answer}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      `Failed to answer follow-up question: ${errorMessage}`,
      ApiErrorType.FOLLOWUP_ERROR
    );
  }
}
