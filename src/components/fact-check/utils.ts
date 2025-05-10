import { ContentItem, StructuredClaim, VerdictStatus } from "./types";

export const determineVerdict = (text: string): string => {
  const lowerText = text.toLowerCase();
  const falseIndicators = [
    "falsch",
    "nicht korrekt",
    "irreführend",
    "fehlinformation",
  ];
  const trueIndicators = ["korrekt", "richtig", "wahr", "stimmt"];

  if (text.includes("**Ergebnis:** WAHR")) {
    return "WAHR";
  } else if (text.includes("**Ergebnis:** FALSCH")) {
    return "FALSCH";
  } else if (text.includes("**Ergebnis:** TEILS-TEILS")) {
    return "TEILS-TEILS";
  }

  const falseCount = falseIndicators.reduce(
    (count, indicator) => count + (lowerText.split(indicator).length - 1),
    0
  );
  const trueCount = trueIndicators.reduce(
    (count, indicator) => count + (lowerText.split(indicator).length - 1),
    0
  );

  if (falseCount > trueCount + 1) {
    return "FALSCH";
  } else if (trueCount > falseCount + 1) {
    return "WAHR";
  } else if (
    lowerText.includes("überwiegend falsch") ||
    lowerText.includes("größtenteils falsch") ||
    lowerText.includes("meistens falsch")
  ) {
    return "FALSCH";
  } else if (
    lowerText.includes("überwiegend wahr") ||
    lowerText.includes("größtenteils wahr") ||
    lowerText.includes("meistens wahr")
  ) {
    return "WAHR";
  } else {
    return "TEILS-TEILS";
  }
};

export const extractSimpleExplanation = (text: string): string => {
  const match = text.match(/\*\*Einfach erklärt:\*\*\s*(.+?)(\n|$)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  const paragraphs = text.split("\n\n");

  const summaryParagraphs = paragraphs.filter(
    (p) =>
      p.toLowerCase().includes("zusammenfass") ||
      p.toLowerCase().includes("fazit") ||
      p.toLowerCase().includes("insgesamt")
  );

  if (summaryParagraphs.length > 0) {
    return summaryParagraphs[0];
  } else {
    return paragraphs.slice(0, 2).join("\n\n");
  }
};

export const parseFactCheckContent = (text: string, hasFollowup: boolean): ContentItem[] => {
  let mainContent = text;

  if (hasFollowup) {
    mainContent = text.split("--- Folgende Frage ---")[0].trim();
  }

  const result: ContentItem[] = [];
  const paragraphs = mainContent.split("\n\n");
  let currentIndex = 0;

  while (currentIndex < paragraphs.length) {
    const paragraph = paragraphs[currentIndex];

    if (
      paragraph.includes("**Behauptung") ||
      paragraph.includes("**Aussage") ||
      /\*\*(Behauptung|Aussage) \d+:/.test(paragraph)
    ) {
      const label = paragraph.replace(/\*\*/g, "").trim();
      const content =
        currentIndex + 1 < paragraphs.length
          ? paragraphs[currentIndex + 1]
          : "";

      let verdictIndex = -1;
      let verdict = "";
      let status: VerdictStatus = "unknown";

      for (
        let i = currentIndex + 2;
        i < paragraphs.length && i < currentIndex + 5;
        i++
      ) {
        const p = paragraphs[i].toLowerCase();

        if (
          p.includes("**bewertung") ||
          p.includes("**ergebnis") ||
          p.includes("**fazit")
        ) {
          verdictIndex = i;
          verdict = paragraphs[i]
            .replace(/\*\*/g, "")
            .replace(/^(Bewertung|Ergebnis|Fazit):\s*/i, "")
            .trim();

          if (
            verdict.toLowerCase().includes("wahr") ||
            verdict.toLowerCase().includes("korrekt") ||
            verdict.toLowerCase().includes("stimmt")
          ) {
            status = "true";
          } else if (
            verdict.toLowerCase().includes("falsch") ||
            verdict.toLowerCase().includes("nicht korrekt") ||
            verdict.toLowerCase().includes("irreführend")
          ) {
            status = "false";
          } else if (
            verdict.toLowerCase().includes("teils") ||
            verdict.toLowerCase().includes("teilweise")
          ) {
            status = "partial";
          }

          break;
        }
      }

      let explanation = "";
      if (verdictIndex > 0) {
        let nextClaimIndex = paragraphs.length;

        for (let i = verdictIndex + 1; i < paragraphs.length; i++) {
          if (
            paragraphs[i].includes("**Behauptung") ||
            paragraphs[i].includes("**Aussage")
          ) {
            nextClaimIndex = i;
            break;
          }
        }

        explanation = paragraphs
          .slice(verdictIndex + 1, nextClaimIndex)
          .join("\n\n");

        currentIndex = nextClaimIndex - 1;
      } else {
        let nextClaimIndex = paragraphs.length;

        for (let i = currentIndex + 2; i < paragraphs.length; i++) {
          if (
            paragraphs[i].includes("**Behauptung") ||
            paragraphs[i].includes("**Aussage")
          ) {
            nextClaimIndex = i;
            break;
          }
        }

        explanation = paragraphs
          .slice(currentIndex + 2, nextClaimIndex)
          .join("\n\n");

        if (!verdict) {
          verdict = determineVerdict(explanation);

          if (verdict === "WAHR") status = "true";
          else if (verdict === "FALSCH") status = "false";
          else if (verdict === "TEILS-TEILS") status = "partial";
        }

        currentIndex = nextClaimIndex - 1;
      }

      result.push({
        type: "claim",
        label,
        content,
        verdict,
        explanation,
        status,
      });
    } else {
      result.push({
        type: "text",
        content: paragraph,
      });
    }

    currentIndex++;
  }

  return result;
};

export const getOverallVerdict = (factCheck: string, hasFollowup: boolean): { verdict: string; status: VerdictStatus } => {
  const parsedContent = parseFactCheckContent(factCheck, hasFollowup);
  const claims = parsedContent.filter(
    (item): item is StructuredClaim => item.type === "claim"
  );

  if (claims.length === 0) {
    const verdict = determineVerdict(factCheck);
    let status: VerdictStatus = "unknown";

    if (verdict === "WAHR") status = "true";
    else if (verdict === "FALSCH") status = "false";
    else if (verdict === "TEILS-TEILS") status = "partial";

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

  if (
    verdictCounts.true > verdictCounts.false &&
    verdictCounts.true > verdictCounts.partial
  ) {
    return { verdict: "WAHR", status: "true" };
  } else if (
    verdictCounts.false > verdictCounts.true &&
    verdictCounts.false > verdictCounts.partial
  ) {
    return { verdict: "FALSCH", status: "false" };
  } else {
    return { verdict: "TEILS-TEILS", status: "partial" };
  }
}; 