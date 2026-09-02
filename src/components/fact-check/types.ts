export type VerdictStatus = "true" | "false" | "partial" | "unknown";

export type Verdict = "wahr" | "falsch" | "teils_teils" | "nicht_pruefbar";

export interface Source {
  titel: string;
  url: string;
}

export interface ReportClaim {
  behauptung: string;
  belege: string;
  erklaerung: string;
  manipulation: string | null;
  quellen: Source[];
  urteil: Verdict;
}

export interface FactCheckReport {
  behauptungen: ReportClaim[];
  fazit: string;
  gesamturteil: Verdict;
  quelle_sprache: string;
  selbst_pruefen: string;
  vorsicht: string;
}

export interface Followup {
  answer: string;
  question: string;
}

export interface VerdictBadgeProps {
  size?: "sm" | "lg";
  status: VerdictStatus;
}

export interface ClaimCardProps {
  claim: ReportClaim;
  index: number;
}

export interface FollowupQuestionProps {
  answer: string;
  index: number;
  question: string;
}

export interface FollowupFormProps {
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  question: string;
}
