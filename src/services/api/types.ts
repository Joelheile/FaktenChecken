export interface FactCheckResponse {
  transcript: string;
  factCheck: string;
  conversationId?: string;
}

export enum ApiErrorType {
  TRANSCRIPTION_ERROR = "transcription_error",
  FACT_CHECK_ERROR = "fact_check_error",
  FOLLOWUP_ERROR = "followup_error",
  NETWORK_ERROR = "network_error",
  AUTH_ERROR = "auth_error",
}

export class ApiError extends Error {
  type: ApiErrorType;

  constructor(message: string, type: ApiErrorType) {
    super(message);
    this.name = "ApiError";
    this.type = type;
  }
}
