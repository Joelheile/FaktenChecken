import { ContentItem, VerdictStatus } from "./types";

export const determineVerdict = (text: string): string => {
  const lowerText = text.toLowerCase();

  if (hasExplicitVerdict(text, "WAHR")) return "WAHR";
  if (hasExplicitVerdict(text, "FALSCH")) return "FALSCH";
  if (
    hasExplicitVerdict(text, "TEILS-TEILS") ||
    hasExplicitVerdict(text, "TEILWEISE WAHR")
  )
    return "TEILS-TEILS";

  const falseIndicators = [
    "falsch",
    "nicht korrekt",
    "irreführend",
    "fehlinformation",
    "unrichtig",
    "fehlerhaft",
    "nicht zutreffend",
    "unwahr",
    "ungenau",
    "fragwürdig",
    "manipulativ",
    "übertrieben",
  ];

  const trueIndicators = [
    "korrekt",
    "richtig",
    "wahr",
    "stimmt",
    "zutreffend",
    "bestätigt",
    "bewiesen",
    "evidenz",
  ];

  const falseCount = falseIndicators.reduce(
    (count, indicator) => count + countOccurrences(lowerText, indicator),
    0,
  );

  const trueCount = trueIndicators.reduce(
    (count, indicator) => count + countOccurrences(lowerText, indicator),
    0,
  );

  if (falseCount >= trueCount) return "FALSCH";
  if (trueCount > falseCount + 2) return "WAHR";

  if (containsPartialTruthIndicator(lowerText)) return "TEILS-TEILS";

  return "TEILS-TEILS";
};

const hasExplicitVerdict = (text: string, verdict: string): boolean => {
  const markers = [
    "**Ergebnis:**",
    "**Bewertung:**",
    "Bewertung:",
    "Ergebnis:",
  ];
  return markers.some((marker) => text.includes(`${marker} ${verdict}`));
};

const containsPartialTruthIndicator = (text: string): boolean => {
  const partialIndicators = [
    "teils-teils",
    "teilweise wahr",
    "teilweise richtig",
    "teilweise falsch",
    "teilweise korrekt",
  ];
  return partialIndicators.some((indicator) => text.includes(indicator));
};

const countOccurrences = (text: string, term: string): number => {
  const regex = new RegExp(`(?<!nicht\\s+)${term}`, "gi");
  const matches = text.match(regex) || [];
  return matches.length;
};

export const extractSimpleExplanation = (text: string): string => {
  const summaryPatterns = [
    /\*\*Einfach erklärt:\*\*\s*(.+?)(\n|$)/,
    /\*\*Zusammenfassung:\*\*\s*(.+?)(\n|$)/,
    /\*\*Fazit:\*\*\s*(.+?)(\n|$)/,
    /Einfach erklärt:\s*(.+?)(\n|$)/i,
    /Zusammenfassung:\s*(.+?)(\n|$)/i,
    /Fazit:\s*(.+?)(\n|$)/i,
    /Insgesamt:\s*(.+?)(\n|$)/i,
  ];

  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }

  const paragraphs = text.split("\n\n");
  const summaryKeywords = [
    "zusammenfass",
    "fazit",
    "insgesamt",
    "schlussfolgerung",
    "ergebnis ist",
  ];

  const summaryParagraphs = paragraphs.filter((p) =>
    summaryKeywords.some((keyword) => p.toLowerCase().includes(keyword)),
  );

  return summaryParagraphs.length > 0
    ? summaryParagraphs[0]
    : paragraphs.slice(0, 2).join("\n\n");
};

export const parseFactCheckContent = (
  text: string,
  hasFollowup: boolean,
): ContentItem[] => {
  const mainContent = hasFollowup
    ? text.split("--- Folgende Frage ---")[0].trim()
    : text;

  const claims = extractClaims(mainContent);

  if (claims.length > 0) {
    return claims.map((claim, index) => ({
      type: "claim",
      label: claim.label || `Behauptung ${index + 1}`,
      content: claim.content || "Keine klare Behauptung erkannt.",
      verdict: claim.verdict || "UNBEKANNT",
      explanation: claim.explanation || "Keine Erklärung verfügbar.",
      status: determineClaimStatus(claim.verdict),
    }));
  }

  return parseByParagraphs(mainContent);
};

const parseByParagraphs = (content: string): ContentItem[] => {
  const paragraphs = content.split("\n\n");
  const result: ContentItem[] = [];
  let currentIndex = 0;

  const claimPatterns = [
    /\*\*Behauptung\s*\d*:?\*\*/i,
    /\*\*Aussage\s*\d*:?\*\*/i,
    /\*\*Behauptung\s*\d*\*\*/i,
    /\*\*Aussage\s*\d*\*\*/i,
    /^Behauptung\s*\d+:/i,
    /^Aussage\s*\d+:/i,
  ];

  const verdictPatterns = [
    /\*\*Bewertung:?\*\*/i,
    /\*\*Ergebnis:?\*\*/i,
    /\*\*Fazit:?\*\*/i,
    /^Bewertung:/i,
    /^Ergebnis:/i,
    /^Fazit:/i,
  ];

  const matchesAnyPattern = (text: string, patterns: RegExp[]): boolean =>
    patterns.some((pattern) => pattern.test(text));

  while (currentIndex < paragraphs.length) {
    const paragraph = paragraphs[currentIndex];
    const isClaimParagraph = matchesAnyPattern(paragraph, claimPatterns);

    if (isClaimParagraph) {
      const label = paragraph.replace(/\*\*/g, "").trim();
      let content = "";
      let nextIndex = currentIndex + 1;

      if (
        nextIndex < paragraphs.length &&
        !matchesAnyPattern(paragraphs[nextIndex], claimPatterns) &&
        !matchesAnyPattern(paragraphs[nextIndex], verdictPatterns)
      ) {
        content = paragraphs[nextIndex];
        nextIndex++;
      }

      let verdict = "UNBEKANNT";
      let explanation = "";
      let foundVerdict = false;

      while (
        nextIndex < paragraphs.length &&
        !matchesAnyPattern(paragraphs[nextIndex], claimPatterns)
      ) {
        const currentPara = paragraphs[nextIndex];
        const isVerdictPara = matchesAnyPattern(currentPara, verdictPatterns);

        if (isVerdictPara) {
          foundVerdict = true;
          verdict = determineVerdict(currentPara);
          explanation = currentPara;
        } else if (foundVerdict) {
          explanation += "\n\n" + currentPara;
        }

        nextIndex++;
      }

      if (!foundVerdict && content) {
        verdict = determineVerdict(content);
      }

      result.push({
        type: "claim",
        label,
        content,
        verdict,
        explanation,
        status: determineClaimStatus(verdict),
      });

      currentIndex = nextIndex;
    } else {
      currentIndex++;
    }
  }

  return result.length > 0
    ? result
    : [
        {
          type: "text",
          content: content,
        },
      ];
};

const extractClaims = (
  text: string,
): {
  label: string;
  content: string;
  verdict: string;
  explanation: string;
}[] => {
  const results = [];
  const claimPatterns = [
    /(?:Behauptung|Aussage)\s*(?:\d+)?:?\s*(.*?)\n(?:Bewertung|Ergebnis|Fazit):?\s*(.*?)\n(?:Erklärung|Begründung):?\s*(.*?)(?:\n\n|$)/gs,
    /\*\*(?:Behauptung|Aussage)\s*(?:\d+)?:?\*\*\s*(.*?)\n\*\*(?:Bewertung|Ergebnis|Fazit):?\*\*\s*(.*?)\n\*\*(?:Erklärung|Begründung):?\*\*\s*(.*?)(?:\n\n|$)/gs,
  ];

  for (const pattern of claimPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [_, content, verdict, explanation] = match;
      if (content && verdict) {
        results.push({
          label: `Behauptung ${results.length + 1}`,
          content: content.trim(),
          verdict: determineVerdict(verdict),
          explanation: explanation ? explanation.trim() : verdict.trim(),
        });
      }
    }
  }

  return results;
};

const determineClaimStatus = (verdict: string): VerdictStatus => {
  if (verdict.includes("WAHR")) return "true";
  if (verdict.includes("FALSCH")) return "false";
  if (verdict.includes("TEILS") || verdict.includes("TEILWEISE"))
    return "partial";
  return "unknown";
};

export const getOverallVerdict = (
  factCheck: string,
  hasFollowup: boolean,
): { verdict: string; status: VerdictStatus } => {
  const mainContent = hasFollowup
    ? factCheck.split("--- Folgende Frage ---")[0]
    : factCheck;

  const verdictStr = determineVerdict(mainContent);
  let status: VerdictStatus;

  if (verdictStr === "WAHR") status = "true";
  else if (verdictStr === "FALSCH") status = "false";
  else if (verdictStr === "TEILS-TEILS") status = "partial";
  else status = "unknown";

  return { verdict: verdictStr, status };
};
