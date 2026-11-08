// apna-adda-backend/services/answerMatcher.js

/**
 * Robust, deterministic, server-side Answer Matching Service
 * Normalizes text, performs word-boundary aware keyword & phrase matching,
 * resolves ambiguity deterministically, and assigns rank-based scoring.
 */

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes text:
 * 1. Convert to lowercase
 * 2. Remove punctuation (preserving alphabets, numbers, and spaces)
 * 3. Collapse multiple whitespaces to single space
 * 4. Trim leading/trailing spaces
 */
function normalizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if candidate is matched with word-boundary awareness.
 * Returns match specificity score or 0 if no match.
 */
function evaluatePhraseMatch(inputNormalized, targetRaw) {
  const targetNormalized = normalizeText(targetRaw);
  if (!targetNormalized) return 0;

  // Exact whole string match (Highest priority)
  if (inputNormalized === targetNormalized) {
    return 1000 + targetNormalized.length;
  }

  // Word-boundary phrase/keyword match
  const pattern = new RegExp(`(^|\\b)${escapeRegExp(targetNormalized)}(\\b|$)`, "i");
  if (pattern.test(inputNormalized)) {
    return 500 + targetNormalized.length;
  }

  return 0;
}

/**
 * Matches a submitted player text against the 4 canonical answer categories.
 *
 * @param {string} rawInput - The user's submitted string.
 * @param {Array} answers - Array of 4 answer categories with keywords & acceptedPhrases.
 * @returns {Object} Match result with matched (boolean), answerId, rank, points, canonicalAnswer, score
 */
function matchAnswer(rawInput, answers) {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      matched: false,
      answerId: null,
      rank: null,
      points: 0,
      canonicalAnswer: null,
      reason: "EMPTY_INPUT"
    };
  }

  const normalizedInput = normalizeText(rawInput);
  if (!normalizedInput) {
    return {
      matched: false,
      answerId: null,
      rank: null,
      points: 0,
      canonicalAnswer: null,
      reason: "EMPTY_INPUT"
    };
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      matched: false,
      answerId: null,
      rank: null,
      points: 0,
      canonicalAnswer: null,
      reason: "NO_ANSWER_KEY"
    };
  }

  const categoryMatches = [];

  for (const cat of answers) {
    let bestScore = 0;
    let bestTerm = null;

    // 1. Check Canonical Answer itself
    const canonicalScore = evaluatePhraseMatch(normalizedInput, cat.canonicalAnswer);
    if (canonicalScore > bestScore) {
      bestScore = canonicalScore + 200; // Bonus for matching canonical name directly
      bestTerm = cat.canonicalAnswer;
    }

    // 2. Check Accepted Phrases
    if (Array.isArray(cat.acceptedPhrases)) {
      for (const phrase of cat.acceptedPhrases) {
        const score = evaluatePhraseMatch(normalizedInput, phrase);
        if (score > bestScore) {
          bestScore = score + 100; // Accepted phrases carry high specificity
          bestTerm = phrase;
        }
      }
    }

    // 3. Check Keywords
    if (Array.isArray(cat.keywords)) {
      for (const kw of cat.keywords) {
        const score = evaluatePhraseMatch(normalizedInput, kw);
        if (score > bestScore) {
          bestScore = score;
          bestTerm = kw;
        }
      }
    }

    if (bestScore > 0) {
      categoryMatches.push({
        answerId: cat.id,
        rank: cat.rank,
        canonicalAnswer: cat.canonicalAnswer,
        basePoints: cat.points || (cat.rank === 1 ? 40 : cat.rank === 2 ? 30 : cat.rank === 3 ? 20 : 10),
        score: bestScore,
        matchedTerm: bestTerm
      });
    }
  }

  // No match
  if (categoryMatches.length === 0) {
    return {
      matched: false,
      answerId: null,
      rank: null,
      points: 0,
      canonicalAnswer: null,
      reason: "UNMATCHED",
      normalizedInput
    };
  }

  // Sort by specificity score descending
  categoryMatches.sort((a, b) => b.score - a.score);

  const topMatch = categoryMatches[0];

  // Check for ambiguous tie with another category at the exact same specificity
  if (categoryMatches.length > 1) {
    const secondMatch = categoryMatches[1];
    if (topMatch.score === secondMatch.score && topMatch.answerId !== secondMatch.answerId) {
      // Ambiguous match without clear specificity resolution: resolve as unmatched safely
      return {
        matched: false,
        answerId: null,
        rank: null,
        points: 0,
        canonicalAnswer: null,
        reason: "AMBIGUOUS_MATCH",
        ambiguousCategories: [topMatch.canonicalAnswer, secondMatch.canonicalAnswer],
        normalizedInput
      };
    }
  }

  return {
    matched: true,
    answerId: topMatch.answerId,
    rank: topMatch.rank,
    points: topMatch.basePoints,
    canonicalAnswer: topMatch.canonicalAnswer,
    matchedTerm: topMatch.matchedTerm,
    normalizedInput
  };
}

module.exports = {
  normalizeText,
  matchAnswer,
  evaluatePhraseMatch
};
