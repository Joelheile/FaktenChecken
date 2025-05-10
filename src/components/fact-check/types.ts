export type VerdictStatus = "true" | "false" | "partial" | "unknown";

export interface StructuredClaim {
  type: "claim";
  label: string;
  content: string;
  verdict: string;
  explanation: string;
  status: VerdictStatus;
}

export interface TextContent {
  type: "text";
  content: string;
}

export type ContentItem = StructuredClaim | TextContent;

export interface FollowupQuestionProps {
  question: string;
  answer: string;
  index: number;
}

export interface VerdictBadgeProps {
  verdict: string;
  status: VerdictStatus;
}

export interface ClaimCardProps {
  claim: StructuredClaim;
  index: number;
}

export interface FollowupFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  question: string;
  onChange: (value: string) => void;
  isSubmitting: boolean;
}
