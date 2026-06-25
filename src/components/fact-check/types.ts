export type VerdictStatus = "true" | "false" | "partial" | "unknown";

export type Verdict = "wahr" | "falsch" | "teils_teils" | "nicht_pruefbar";

export interface Source {
  titel: string;
  url: string;
}

export interface ReportClaim {
  behauptung: string;
  urteil: Verdict;
  erklaerung: string;
  belege: string;
  manipulation: string | null;
  quellen: Source[];
}

export interface FactCheckReport {
  quelle_sprache: string;
  gesamturteil: Verdict;
  fazit: string;
  vorsicht: string;
  behauptungen: ReportClaim[];
  selbst_pruefen: string;
}

export interface Followup {
  question: string;
  answer: string;
}

export interface VerdictBadgeProps {
  status: VerdictStatus;
  size?: "sm" | "lg";
}

export interface ClaimCardProps {
  claim: ReportClaim;
  index: number;
}

export interface FollowupQuestionProps {
  question: string;
  answer: string;
  index: number;
}

export interface FollowupFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  question: string;
  onChange: (value: string) => void;
  isSubmitting: boolean;
}
