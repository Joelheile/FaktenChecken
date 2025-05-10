import { askFollowupQuestion as askOpenAIFollowup } from '../openai';
import { ApiError, ApiErrorType } from './types';

export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    const answer = await askOpenAIFollowup(question);
    
    return `--- Folgende Frage ---\n\n${question}\n\n${answer}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      `Failed to answer follow-up question: ${errorMessage}`,
      ApiErrorType.FOLLOWUP_ERROR
    );
  }
}