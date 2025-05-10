import { ContentItem, StructuredClaim, VerdictStatus } from "./types";

export const determineVerdict = (text: string): string => {
  const lowerText = text.toLowerCase();

  // Prüfe zuerst auf explizite Bewertungsmarker
  // Format: "**Bewertung:** WAHR" oder "Ergebnis: FALSCH" etc.
  const explicitWahr = [
    "**ergebnis:** wahr", 
    "**bewertung:** wahr", 
    "bewertung: wahr", 
    "ergebnis: wahr",
    "**ergebnis:** wahr",
    "**bewertung:** wahr"
  ];
  
  const explicitFalsch = [
    "**ergebnis:** falsch", 
    "**bewertung:** falsch", 
    "bewertung: falsch", 
    "ergebnis: falsch",
    "**ergebnis:** falsch",
    "**bewertung:** falsch"
  ];
  
  const explicitTeilsTeils = [
    "**ergebnis:** teils-teils", 
    "**bewertung:** teils-teils",
    "**ergebnis:** teilweise wahr", 
    "**bewertung:** teilweise wahr",
    "bewertung: teils-teils", 
    "ergebnis: teils-teils",
    "bewertung: teilweise wahr", 
    "ergebnis: teilweise wahr",
    "**ergebnis:** teils-teils",
    "**bewertung:** teils-teils"
  ];

  for (const marker of explicitWahr) {
    if (lowerText.includes(marker)) {
      return "WAHR";
    }
  }
  
  for (const marker of explicitFalsch) {
    if (lowerText.includes(marker)) {
      return "FALSCH";
    }
  }
  
  for (const marker of explicitTeilsTeils) {
    if (lowerText.includes(marker)) {
      return "TEILS-TEILS";
    }
  }

  // Überprüfe auf "Bewertung: " oder "Ergebnis: " gefolgt von (wahr/falsch/teils-teils)
  const bewertungPattern = /(?:bewertung|ergebnis):\s*(wahr|falsch|teils-teils|teilweise wahr)/i;
  const bewertungMatch = lowerText.match(bewertungPattern);
  
  if (bewertungMatch && bewertungMatch[1]) {
    const verdict = bewertungMatch[1].toLowerCase();
    if (verdict.includes("wahr") && !verdict.includes("teilweise") && !verdict.includes("teils")) {
      return "WAHR";
    } else if (verdict.includes("falsch")) {
      return "FALSCH";
    } else if (verdict.includes("teils") || verdict.includes("teilweise")) {
      return "TEILS-TEILS";
    }
  }

  // Analysiere Indikatorwörter für unterschiedliche Verdikttypen
  const falseIndicators = [
    "falsch", "nicht korrekt", "irreführend", "fehlinformation",
    "unrichtig", "fehlerhaft", "nicht zutreffend", "unwahr",
    "ungenau", "fragwürdig", "manipulativ", "übertrieben",
    "stimmt nicht", "ist nicht wahr", "trifft nicht zu", "ist falsch"
  ];
  
  const trueIndicators = [
    "korrekt", "richtig", "wahr", "stimmt", "zutreffend",
    "bestätigt", "bewiesen", "evidenz", "trifft zu", "ist wahr",
    "stimmt überein", "ist korrekt", "belegt"
  ];

  const falseCount = falseIndicators.reduce(
    (count, indicator) => count + countOccurrences(lowerText, indicator),
    0
  );
  
  const trueCount = trueIndicators.reduce(
    (count, indicator) => count + countOccurrences(lowerText, indicator),
    0
  );

  // Kritische Bewertung basierend auf Indikatoren
  if (falseCount >= trueCount) {
    return "FALSCH";
  } else if (trueCount > falseCount + 2) {
    return "WAHR";
  } else if (
    lowerText.includes("teils-teils") ||
    lowerText.includes("teilweise wahr") ||
    lowerText.includes("teilweise richtig") ||
    lowerText.includes("teilweise falsch") ||
    lowerText.includes("teilweise korrekt") ||
    lowerText.includes("in teilen wahr") ||
    lowerText.includes("in teilen falsch")
  ) {
    return "TEILS-TEILS";
  }

  // Fallback bei Unklarheit
  return "TEILS-TEILS";
};

// Zähle Vorkommen eines Terms (Negationen werden ausgeschlossen)
function countOccurrences(text: string, term: string): number {
  const regex = new RegExp(`(?<!nicht\\s+)${term}`, "gi");
  const matches = text.match(regex) || [];
  return matches.length;
}

export const extractSimpleExplanation = (text: string): string => {
  // Try to find an explicit summary section
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
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Look for paragraphs with summary keywords
  const paragraphs = text.split("\n\n");

  const summaryParagraphs = paragraphs.filter(
    (p) =>
      p.toLowerCase().includes("zusammenfass") ||
      p.toLowerCase().includes("fazit") ||
      p.toLowerCase().includes("insgesamt") ||
      p.toLowerCase().includes("schlussfolgerung") ||
      p.toLowerCase().includes("ergebnis ist"),
  );

  if (summaryParagraphs.length > 0) {
    return summaryParagraphs[0];
  } else {
    return paragraphs.slice(0, 2).join("\n\n");
  }
};

export const parseFactCheckContent = (
  text: string,
  hasFollowup: boolean,
): ContentItem[] => {
  let mainContent = text;

  if (hasFollowup) {
    mainContent = text.split("--- Folgende Frage ---")[0].trim();
  }

  const result: ContentItem[] = [];

  // Split text into individual claims if possible
  const claims = extractClaims(mainContent);

  if (claims.length > 0) {
    // If we were able to extract clear claims, use those
    claims.forEach((claim, index) => {
      const status = determineClaimStatus(claim.verdict);
      result.push({
        type: "claim",
        label: claim.label || `Behauptung ${index + 1}`,
        content: claim.content || "Keine klare Behauptung erkannt.",
        verdict: claim.verdict || "UNBEKANNT",
        explanation: claim.explanation || "Keine Erklärung verfügbar.",
        status,
      });
    });
  } else {
    // Fallback to paragraph-based processing
    const paragraphs = mainContent.split("\n\n");
    let currentIndex = 0;

    // Various patterns to identify claims in different formats
    const claimPatterns = [
      /\*\*Behauptung\s*\d*:?\*\*/i,
      /\*\*Aussage\s*\d*:?\*\*/i,
      /\*\*Behauptung\s*\d*\*\*/i,
      /\*\*Aussage\s*\d*\*\*/i,
      /^Behauptung\s*\d+:/i,
      /^Aussage\s*\d+:/i,
    ];

    // Patterns to identify verdict sections
    const verdictPatterns = [
      /\*\*Bewertung:?\*\*/i,
      /\*\*Ergebnis:?\*\*/i,
      /\*\*Fazit:?\*\*/i,
      /^Bewertung:/i,
      /^Ergebnis:/i,
      /^Fazit:/i,
    ];

    // Helper function to check if a paragraph matches any pattern
    const matchesAnyPattern = (text: string, patterns: RegExp[]): boolean => {
      return patterns.some((pattern) => pattern.test(text));
    };

    while (currentIndex < paragraphs.length) {
      const paragraph = paragraphs[currentIndex];

      // Check if this paragraph contains a claim marker
      const isClaimParagraph = matchesAnyPattern(paragraph, claimPatterns);

      if (isClaimParagraph) {
        // Extract label (remove ** formatting)
        const label = paragraph.replace(/\*\*/g, "").trim();

        // The content is usually in the next paragraph, but OpenAI might include it in the same paragraph
        let content = "";
        let nextIndex = currentIndex + 1;

        if (currentIndex + 1 < paragraphs.length) {
          const nextParagraph = paragraphs[currentIndex + 1];
          // If the next paragraph is not a verdict marker or another claim, it's likely the claim content
          if (
            !matchesAnyPattern(nextParagraph, verdictPatterns) &&
            !matchesAnyPattern(nextParagraph, claimPatterns)
          ) {
            content = nextParagraph;
            nextIndex = currentIndex + 2;
          } else {
            // If no clear content paragraph, extract content from the label if possible
            const colonIndex = label.indexOf(":");
            if (colonIndex > -1) {
              content = label.substring(colonIndex + 1).trim();
            }
          }
        }

        // If we still couldn't extract content
        if (!content && label.includes(":")) {
          const parts = label.split(":");
          if (parts.length > 1) {
            content = parts.slice(1).join(":").trim();
          }
        }

        let verdictIndex = -1;
        let verdict = "";
        let status: VerdictStatus = "unknown";
        let explanation = "";

        // Look for verdict and explanation
        for (
          let i = nextIndex;
          i < paragraphs.length && i < nextIndex + 5;
          i++
        ) {
          const currentParagraph = paragraphs[i];

          // Check if this paragraph contains a verdict marker
          if (matchesAnyPattern(currentParagraph, verdictPatterns)) {
            verdictIndex = i;

            // Extract the verdict text, removing the prefix
            verdict = currentParagraph
              .replace(/\*\*/g, "")
              .replace(/^(Bewertung|Ergebnis|Fazit):?\s*/i, "")
              .trim();

            status = determineClaimStatus(verdict);
            break;
          }
        }

        // Collect explanation paragraphs
        if (verdictIndex > 0) {
          // Find the next claim to know where this explanation ends
          let nextClaimIndex = paragraphs.length;

          for (let i = verdictIndex + 1; i < paragraphs.length; i++) {
            if (matchesAnyPattern(paragraphs[i], claimPatterns)) {
              nextClaimIndex = i;
              break;
            }
          }

          explanation = paragraphs
            .slice(verdictIndex + 1, nextClaimIndex)
            .join("\n\n");

          currentIndex = nextClaimIndex - 1;
        } else {
          // If we couldn't find an explicit verdict paragraph,
          // collect all content until the next claim
          let nextClaimIndex = paragraphs.length;

          for (let i = nextIndex; i < paragraphs.length; i++) {
            if (matchesAnyPattern(paragraphs[i], claimPatterns)) {
              nextClaimIndex = i;
              break;
            }
          }

          // Collect all text between the content and the next claim as explanation
          explanation = paragraphs
            .slice(nextIndex, nextClaimIndex)
            .join("\n\n");

          // If no explicit verdict was found, determine it from the explanation
          if (!verdict) {
            verdict = determineVerdict(explanation);
            status = determineClaimStatus(verdict);
          }

          currentIndex = nextClaimIndex - 1;
        }

        // Try to extract "Warum:" section if it exists
        const whyMatch = explanation.match(/Warum:?\s*(.*?)(\n\n|$)/is);
        if (whyMatch && whyMatch[1]) {
          explanation = whyMatch[1].trim();
        }

        result.push({
          type: "claim",
          label,
          content: content || "Keine spezifische Behauptung gefunden.",
          verdict,
          explanation,
          status,
        });
      } else {
        // This is not a claim, treat as additional text content
        result.push({
          type: "text",
          content: paragraph,
        });
      }

      currentIndex++;
    }
  }

  return result;
};

// Extract claims in a more robust way
function extractClaims(text: string): {
  label: string;
  content: string;
  verdict: string;
  explanation: string;
}[] {
  const claims = [];

  // Try to find claim sections with clear structure
  const claimSections = text.match(
    /Behauptung\s*\d+:.*?(?=(Behauptung\s*\d+:|$))/gs,
  );

  if (claimSections && claimSections.length > 0) {
    claimSections.forEach((section, index) => {
      // Try to extract structured parts
      const labelMatch = section.match(/Behauptung\s*\d+:(.*?)(?=\n|$)/);
      const verdictMatch = section.match(
        /Bewertung:\s*(WAHR|FALSCH|TEILS-TEILS)/i,
      );
      const whyMatch = section.match(/Warum:?\s*(.*?)(\n\n|$)/is);

      let content = "";
      let verdict = "";
      let explanation = "";

      // Extract content - look for content between label and verdict
      if (labelMatch && labelMatch[1].trim()) {
        content = labelMatch[1].trim();
      } else {
        // Try to extract content from the first paragraph after the label
        const firstPara = section.split("\n\n")[0];
        if (
          firstPara &&
          !firstPara.includes("Bewertung:") &&
          !firstPara.includes("Warum:")
        ) {
          content = firstPara.replace(/Behauptung\s*\d+:/, "").trim();
        }
      }

      // Extract verdict
      if (verdictMatch) {
        verdict = verdictMatch[1].trim();
      } else {
        // Try to determine from the content
        const verdictMarkers = [
          { pattern: /falsch/i, result: "FALSCH" },
          { pattern: /wahr/i, result: "WAHR" },
          { pattern: /teils-teils/i, result: "TEILS-TEILS" },
        ];

        for (const marker of verdictMarkers) {
          if (marker.pattern.test(section)) {
            verdict = marker.result;
            break;
          }
        }

        if (!verdict) {
          verdict = determineVerdict(section);
        }
      }

      // Extract explanation
      if (whyMatch && whyMatch[1].trim()) {
        explanation = whyMatch[1].trim();
      } else {
        // Try to find any explanation after the verdict
        const parts = section.split(/(Bewertung:|WAHR|FALSCH|TEILS-TEILS)/i);
        if (parts.length > 1) {
          explanation = parts.slice(1).join("").trim();
        }
      }

      claims.push({
        label: `Behauptung ${index + 1}`,
        content,
        verdict,
        explanation: explanation || "Keine detaillierte Erklärung verfügbar.",
      });
    });
  }

  return claims;
}

// Determine status from verdict text
function determineClaimStatus(verdict: string): VerdictStatus {
  const lowerVerdict = verdict.toLowerCase();

  if (
    lowerVerdict.includes("wahr") &&
    !lowerVerdict.includes("falsch") &&
    !lowerVerdict.includes("teils")
  ) {
    return "true";
  } else if (lowerVerdict.includes("falsch")) {
    return "false";
  } else if (
    lowerVerdict.includes("teils") ||
    lowerVerdict.includes("teilweise")
  ) {
    return "partial";
  } else {
    return "unknown";
  }
}

export const getOverallVerdict = (
  factCheck: string,
  hasFollowup: boolean,
): { verdict: string; status: VerdictStatus } => {
  const parsedContent = parseFactCheckContent(factCheck, hasFollowup);
  const claims = parsedContent.filter(
    (item): item is StructuredClaim => item.type === "claim",
  );

  if (claims.length === 0) {
    const verdict = determineVerdict(factCheck);
    let status = determineClaimStatus(verdict);
    return { verdict, status };
  }

  const verdictCounts = {
    true: 0,
    false: 0,
    partial: 0,
    unknown: 0,
  };

  claims.forEach((claim) => {
    verdictCounts[claim.status]++;
  });

  // Be more critical - if there are any false claims, the overall verdict should lean toward false
  if (verdictCounts.false > 0) {
    if (verdictCounts.true > verdictCounts.false * 2) {
      // Only if there are clearly more true claims should it be partial
      return { verdict: "TEILS-TEILS", status: "partial" };
    } else {
      // Otherwise, consider it false
      return { verdict: "FALSCH", status: "false" };
    }
  } else if (verdictCounts.true > 0 && verdictCounts.partial === 0) {
    return { verdict: "WAHR", status: "true" };
  } else if (verdictCounts.true > 0 || verdictCounts.partial > 0) {
    return { verdict: "TEILS-TEILS", status: "partial" };
  } else {
    return { verdict: "UNBEKANNT", status: "unknown" };
  }
};
