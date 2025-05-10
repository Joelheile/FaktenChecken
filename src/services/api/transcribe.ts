import { fetchTikTokTranscript } from '../apify';
import { performFactCheck, resetConversation } from '../openai';
import { ApiError, ApiErrorType, FactCheckResponse } from './types';

/**
 * Main function to transcribe a TikTok video and perform fact checking on its content
 * 
 * @param tiktokUrl - The URL of the TikTok video to analyze
 * @returns A promise that resolves to a FactCheckResponse
 * @throws ApiError if the transcription or fact-checking fails
 */
export async function transcribeAndFactCheck(tiktokUrl: string): Promise<FactCheckResponse> {
  console.log(`Analyzing TikTok URL: ${tiktokUrl}`);
  
  // Reset conversation context for new request
  resetConversation();
  
  try {
    // Get transcript from Apify API
    const transcript = await fetchTikTokTranscript(tiktokUrl);
    
    if (!transcript || transcript.trim().length < 5) {
      console.warn('Retrieved empty or very short transcript');
    }
    
    // Get fact check from OpenAI
    const factCheck = await performFactCheck(transcript);
    
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
        `Error during TikTok analysis: ${errorMessage}`,
        ApiErrorType.NETWORK_ERROR
      );
    }
    
    // For non-Error objects
    throw new ApiError(
      'An unknown error occurred during TikTok analysis',
      ApiErrorType.NETWORK_ERROR
    );
  }
} 