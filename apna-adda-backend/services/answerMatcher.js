// apna-adda-backend/services/answerMatcher.js

/**
 * Universal Semantic Answer Matching Service
 * Layered matching architecture:
 *  Layer 1: Text normalization (lowercase, trim, whitespace collapse, punctuation stripping)
 *  Layer 2: Exact canonical match (Confidence = 1.0)
 *  Layer 3: Direct aliases and accepted phrases (Confidence = 0.95 - 0.98)
 *  Layer 4: Word-boundary keyword & synonym matching (Confidence = 0.85 - 0.92)
 *  Layer 5: Contextual & Hinglish semantic matching (Confidence = 0.80 - 0.90)
 *  Layer 6: Confidence threshold evaluation (threshold >= 0.75)
 *  Layer 7: Deterministic ambiguity and conflict resolution
 */

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes text:
 * 1. Convert to lowercase
 * 2. Strip unnecessary punctuation while preserving alphanumeric characters and spaces
 * 3. Collapse multiple whitespaces
 * 4. Trim leading/trailing whitespace
 */
function normalizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/['’]/g, "") // Remove contractions apostrophe cleanly e.g. "Dhoni's" -> "dhonis"
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Evaluates match with word-boundary awareness.
 * Returns { matched: boolean, isExact: boolean, matchLength: number }
 */
function evaluateWordBoundaryMatch(inputNorm, targetRaw) {
  const targetNorm = normalizeText(targetRaw);
  if (!targetNorm) return { matched: false, isExact: false, matchLength: 0 };

  if (inputNorm === targetNorm) {
    return { matched: true, isExact: true, matchLength: targetNorm.length };
  }

  const pattern = new RegExp(`(^|\\b)${escapeRegExp(targetNorm)}(\\b|$)`, "i");
  if (pattern.test(inputNorm)) {
    return { matched: true, isExact: false, matchLength: targetNorm.length };
  }

  return { matched: false, isExact: false, matchLength: 0 };
}

/**
 * Common Indian English / Hinglish cricket & party contractions mapping
 */
const HINGLISH_EXPANSIONS = {
  "thala": "ms dhoni",
  "mahi": "ms dhoni",
  "msd": "ms dhoni",
  "captain cool": "ms dhoni",
  "king kohli": "virat kohli",
  "cheeku": "virat kohli",
  "hitman": "rohit sharma",
  "rohit": "rohit sharma",
  "boom boom": "jasprit bumrah",
  "jb": "jasprit bumrah",
  "kung fu pandya": "hardik pandya",
  "kingku": "rinku singh",
  "gabbar": "shikhar dhawan",
  "viru": "virender sehwag",
  "bhajji": "harbhajan singh",
  "sunny g": "sunil gavaskar",
  "little master": "sunil gavaskar",
  "yellow army": "csk",
  "whistle podu": "csk",
  "dhonis team": "csk",
  "dhoni team": "csk",
  "thalas team": "csk",
  "play bold": "rcb",
  "ee sala cup namde": "rcb",
  "virats team": "rcb",
  "kohli team": "rcb",
  "paltan": "mi",
  "mumbai paltan": "mi",
  "rohits team": "mi",
  "korbo lorbo": "kkr",
  "srks team": "kkr",
  "halla bol": "rr",
  "pink city": "rr",
  "sanjus team": "rr",
  "motera": "narendra modi stadium",
  "ahmedabad stadium": "narendra modi stadium",
  "wankhede": "wankhede stadium",
  "chinnaswamy": "m chinnaswamy stadium",
  "eden": "eden gardens",
  "twenty twenty": "t20",
  "20 overs": "t20",
  "twenty 20": "t20",
  "50 overs": "odi",
  "one day": "odi",
  "5 day": "test cricket",
  "five day": "test cricket",
  "red ball": "test cricket",
  "tracer bullet": "ravi shastri",
  // Bollywood & Entertainment expansions
  "srk": "shah rukh khan",
  "king khan": "shah rukh khan",
  "rk": "ranbir kapoor",
  "bebo": "kareena kapoor",
  "big b": "amitabh bachchan",
  "rancho": "aamir khan",
  "virus": "boman irani",
  "baburao": "hera pheri",
  "baburao apte": "hera pheri",
  "yjhd": "yeh jawaani hai deewani",
  "znmd": "zindagi na milegi dobara",
  "aaa": "andaz apna apna",
  "mcu": "marvel cinematic universe",
  "mere paas maa hai": "deewar",
  "kitne aadmi the": "sholay",
  "don ko pakadna": "don",
  "all is well": "3 idiots",
  "tum hi ho": "aashiqui 2",
  "kun faya kun": "rockstar",
  "bekhayali": "kabir singh",
  "balam pichkari": "yeh jawaani hai deewani",
  "spidey": "spider-man",
  "peter parker": "spider-man",
  "himym": "how i met your mother",
  "ted mosby": "ted mosby",
  "kishore da": "kishore kumar",
  "gogo": "crime master gogo",
  "crime master gogo": "crime master gogo",
  "mogambo": "mogambo",
  "mogambo khush hua": "mogambo",
  "kancha": "kancha cheena",
  "kancha cheena": "kancha cheena"
};

/**
 * Expand Hinglish and colloquial shorthand
 */
function expandHinglishContext(normalizedInput) {
  let expanded = normalizedInput;
  for (const [shortForm, longForm] of Object.entries(HINGLISH_EXPANSIONS)) {
    const pattern = new RegExp(`(^|\\b)${escapeRegExp(shortForm)}(\\b|$)`, "i");
    if (pattern.test(normalizedInput)) {
      expanded += " " + longForm;
    }
  }
  return expanded;
}

/**
 * Centralized Semantic Answer Matching Engine
 *
 * @param {string} rawInput - The user's typed response
 * @param {Object} question - The full question object containing canonical answers, keywords, aliases, etc.
 * @param {Object} options - Configurable threshold overrides
 * @returns {Object} Structured matching result
 */
function semanticMatchAnswer(rawInput, question, options = {}) {
  const minConfidenceThreshold = options.threshold || 0.75;

  if (!rawInput || typeof rawInput !== "string") {
    return {
      originalAnswer: rawInput || "",
      normalizedAnswer: "",
      canonicalAnswerId: null,
      canonicalAnswer: null,
      matchedRank: null,
      confidence: 0,
      matchingMethod: "NONE",
      status: "UNMATCHED",
      reason: "EMPTY_INPUT"
    };
  }

  const normalizedInput = normalizeText(rawInput);
  if (!normalizedInput) {
    return {
      originalAnswer: rawInput,
      normalizedAnswer: "",
      canonicalAnswerId: null,
      canonicalAnswer: null,
      matchedRank: null,
      confidence: 0,
      matchingMethod: "NONE",
      status: "UNMATCHED",
      reason: "EMPTY_INPUT"
    };
  }

  const answersList = question?.answers || question?.options;
  if (!Array.isArray(answersList) || answersList.length === 0) {
    return {
      originalAnswer: rawInput,
      normalizedAnswer,
      canonicalAnswerId: null,
      canonicalAnswer: null,
      matchedRank: null,
      confidence: 0,
      matchingMethod: "NONE",
      status: "UNMATCHED",
      reason: "NO_ANSWER_KEY"
    };
  }

  const candidateScores = [];
  const expandedInput = expandHinglishContext(normalizedInput);

  for (const ans of answersList) {
    const answerId = ans.id || `${question.id || "Q"}_A${ans.rank}`;
    const canonicalText = ans.canonicalAnswer || ans.answer || ans.text;
    const rank = Number(ans.rank);
    const points = ans.points || (rank === 1 ? 40 : rank === 2 ? 30 : rank === 3 ? 20 : 10);

    let bestScore = 0;
    let bestMethod = "NONE";
    let bestTerm = null;

    // ----------------------------------------------------
    // LAYER 2: Exact Canonical Match (Confidence = 1.0)
    // ----------------------------------------------------
    const canonicalMatch = evaluateWordBoundaryMatch(normalizedInput, canonicalText);
    if (canonicalMatch.matched) {
      if (canonicalMatch.isExact) {
        bestScore = 1.0;
        bestMethod = "EXACT_CANONICAL";
        bestTerm = canonicalText;
      } else {
        const score = 0.94 + Math.min(0.04, canonicalMatch.matchLength / 50);
        if (score > bestScore) {
          bestScore = score;
          bestMethod = "CANONICAL_PHRASE";
          bestTerm = canonicalText;
        }
      }
    }

    // ----------------------------------------------------
    // LAYER 3: Aliases & Accepted Phrases (Confidence = 0.92 - 0.98)
    // ----------------------------------------------------
    const aliases = [
      ...(Array.isArray(ans.aliases) ? ans.aliases : []),
      ...(Array.isArray(ans.acceptedPhrases) ? ans.acceptedPhrases : [])
    ];

    for (const alias of aliases) {
      const match = evaluateWordBoundaryMatch(normalizedInput, alias);
      if (match.matched) {
        const score = match.isExact
          ? 0.98
          : 0.92 + Math.min(0.05, match.matchLength / 40);
        if (score > bestScore) {
          bestScore = score;
          bestMethod = "ACCEPTED_PHRASE";
          bestTerm = alias;
        }
      }
    }

    // ----------------------------------------------------
    // LAYER 4: Keywords & Synonyms with Word Boundary (Confidence = 0.85 - 0.92)
    // ----------------------------------------------------
    const keywords = [
      ...(Array.isArray(ans.keywords) ? ans.keywords : []),
      ...(Array.isArray(ans.synonyms) ? ans.synonyms : [])
    ];

    for (const kw of keywords) {
      const match = evaluateWordBoundaryMatch(normalizedInput, kw);
      if (match.matched) {
        const score = match.isExact ? 0.91 : 0.85 + Math.min(0.04, match.matchLength / 40);
        if (score > bestScore) {
          bestScore = score;
          bestMethod = "KEYWORD_SYNONYM";
          bestTerm = kw;
        }
      }
    }

    // ----------------------------------------------------
    // LAYER 5: Contextual & Hinglish Semantic Matching (Confidence = 0.80 - 0.90)
    // ----------------------------------------------------
    const hinglishList = [
      ...(Array.isArray(ans.hinglish) ? ans.hinglish : []),
      ...(Array.isArray(ans.hinglishExamples) ? ans.hinglishExamples : []),
      ...(Array.isArray(ans.spellingVariations) ? ans.spellingVariations : []),
      ...(Array.isArray(ans.commonVariations) ? ans.commonVariations : []),
      ...(Array.isArray(ans.semanticExamples) ? ans.semanticExamples : [])
    ];

    for (const h of hinglishList) {
      const match = evaluateWordBoundaryMatch(normalizedInput, h);
      if (match.matched) {
        const score = match.isExact ? 0.90 : 0.82 + Math.min(0.04, match.matchLength / 40);
        if (score > bestScore) {
          bestScore = score;
          bestMethod = "SEMANTIC_CONTEXT";
          bestTerm = h;
        }
      }
    }

    // Also check expanded Hinglish representation against canonical / aliases
    if (expandedInput !== normalizedInput) {
      const expandedCanonicalMatch = evaluateWordBoundaryMatch(expandedInput, canonicalText);
      if (expandedCanonicalMatch.matched && bestScore < 0.88) {
        bestScore = 0.88;
        bestMethod = "SEMANTIC_CONTEXT";
        bestTerm = "hinglish_expansion";
      }
    }

    if (bestScore > 0) {
      candidateScores.push({
        canonicalAnswerId: answerId,
        canonicalAnswer: canonicalText,
        rank,
        points,
        confidence: Math.round(bestScore * 100) / 100,
        matchingMethod: bestMethod,
        matchedTerm: bestTerm
      });
    }
  }

  // ----------------------------------------------------
  // LAYER 6: Threshold Evaluation
  // ----------------------------------------------------
  if (candidateScores.length === 0) {
    return {
      originalAnswer: rawInput,
      normalizedAnswer: normalizedInput,
      canonicalAnswerId: null,
      canonicalAnswer: null,
      matchedRank: null,
      confidence: 0,
      matchingMethod: "NONE",
      status: "UNMATCHED",
      reason: "NO_MATCH"
    };
  }

  // Sort candidates by confidence descending
  candidateScores.sort((a, b) => b.confidence - a.confidence);
  const topCandidate = candidateScores[0];

  if (topCandidate.confidence < minConfidenceThreshold) {
    return {
      originalAnswer: rawInput,
      normalizedAnswer: normalizedInput,
      canonicalAnswerId: null,
      canonicalAnswer: null,
      matchedRank: null,
      confidence: topCandidate.confidence,
      matchingMethod: topCandidate.matchingMethod,
      status: "UNMATCHED",
      reason: "BELOW_CONFIDENCE_THRESHOLD"
    };
  }

  // ----------------------------------------------------
  // LAYER 7: Ambiguity & Conflict Resolution
  // ----------------------------------------------------
  if (candidateScores.length > 1) {
    const secondCandidate = candidateScores[1];
    const diff = topCandidate.confidence - secondCandidate.confidence;

    // If two different categories match with indistinguishable confidence (diff < 0.04)
    if (diff < 0.04 && topCandidate.canonicalAnswerId !== secondCandidate.canonicalAnswerId) {
      return {
        originalAnswer: rawInput,
        normalizedAnswer: normalizedInput,
        canonicalAnswerId: null,
        canonicalAnswer: null,
        matchedRank: null,
        confidence: topCandidate.confidence,
        matchingMethod: "AMBIGUITY_CHECK",
        status: "AMBIGUOUS",
        reason: "MULTIPLE_CATEGORIES_PLAUSIBLE",
        ambiguousCandidates: [topCandidate.canonicalAnswer, secondCandidate.canonicalAnswer]
      };
    }
  }

  return {
    originalAnswer: rawInput,
    normalizedAnswer: normalizedInput,
    canonicalAnswerId: topCandidate.canonicalAnswerId,
    canonicalAnswer: topCandidate.canonicalAnswer,
    matchedRank: topCandidate.rank,
    confidence: topCandidate.confidence,
    matchingMethod: topCandidate.matchingMethod,
    status: "MATCHED",
    reason: null,
    points: topCandidate.points
  };
}

module.exports = {
  normalizeText,
  evaluateWordBoundaryMatch,
  semanticMatchAnswer,
  // Maintain backward compatibility with matchAnswer
  matchAnswer: (rawInput, answersList) => {
    const res = semanticMatchAnswer(rawInput, { answers: answersList });
    const legacyReason = res.status === "AMBIGUOUS" ? "AMBIGUOUS_MATCH" : (res.status === "UNMATCHED" ? "UNMATCHED" : res.reason);
    return {
      matched: res.status === "MATCHED",
      answerId: res.canonicalAnswerId,
      rank: res.matchedRank,
      points: res.points || 0,
      canonicalAnswer: res.canonicalAnswer,
      reason: legacyReason,
      status: res.status,
      confidence: res.confidence,
      matchingMethod: res.matchingMethod,
      originalAnswer: res.originalAnswer,
      normalizedAnswer: res.normalizedAnswer
    };
  }
};
