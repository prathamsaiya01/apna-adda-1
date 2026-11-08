// test-batch-1-semantic.cjs
const assert = require('assert');
const { semanticMatchAnswer } = require('./apna-adda-backend/services/answerMatcher');
const { getBatch } = require('./apna-adda-backend/games/whatsTheMajorityBank');

console.log("==================================================");
console.log("   BATCH 1 (CRICKET_001-015) SEMANTIC TEST SUITE");
console.log("==================================================\n");

const cricketBatch = getBatch(101);
assert(cricketBatch, "Cricket Batch 101 must be registered");
assert.strictEqual(cricketBatch.questions.length, 15, "Batch 101 must have exactly 15 questions");

let passed = 0;
let total = 0;

function testCase(qId, input, expectedCanonical, expectedRank, minConfidence = 0.75) {
  total++;
  const q = cricketBatch.questions.find(item => item.id === qId);
  assert(q, `Question ${qId} must exist in batch`);

  const result = semanticMatchAnswer(input, q);
  console.log(`[${qId}] Input: "${input}"`);
  console.log(`  -> Status: ${result.status}, Matched: "${result.canonicalAnswer}", Rank: ${result.matchedRank}, Confidence: ${result.confidence}, Method: ${result.matchingMethod}`);

  assert.strictEqual(result.status, "MATCHED", `Input "${input}" should match`);
  assert.strictEqual(result.canonicalAnswer, expectedCanonical, `Input "${input}" should map to "${expectedCanonical}"`);
  assert.strictEqual(result.matchedRank, expectedRank, `Input "${input}" should have rank ${expectedRank}`);
  assert(result.confidence >= minConfidence, `Confidence (${result.confidence}) should be >= ${minConfidence}`);
  passed++;
  console.log(`  ✓ PASSED\n`);
}

// 15 Representative Semantic Examples across all 15 Questions
testCase("CRICKET_001", "Dhoni's team", "CSK", 1);
testCase("CRICKET_002", "Yellow jersey", "CSK", 1);
testCase("CRICKET_003", "El Clasico of IPL", "MI vs CSK", 1);
testCase("CRICKET_004", "King Kohli", "Virat Kohli", 1);
testCase("CRICKET_005", "Captain Cool", "MS Dhoni", 1);
testCase("CRICKET_006", "Thala", "MS Dhoni", 2);
testCase("CRICKET_007", "Twenty-Twenty", "T20", 1);
testCase("CRICKET_008", "Play Bold", "RCB", 1);
testCase("CRICKET_009", "Gabbar", "Shikhar Dhawan", 2);
testCase("CRICKET_010", "Wankhede", "Wankhede Stadium", 2);
testCase("CRICKET_011", "Whistle Podu", "CSK", 1);
testCase("CRICKET_012", "Straight cover drive", "Cover Drive", 1);
testCase("CRICKET_013", "Paltan", "MI", 2);
testCase("CRICKET_014", "Tracer bullet", "Ravi Shastri", 1);
testCase("CRICKET_015", "Dhoni's World Cup-winning six", "India winning the 2011 World Cup", 1);

// Additional Edge Cases
console.log("--- Testing Ambiguity and Unmatched Fallbacks ---");
const q1 = cricketBatch.questions.find(item => item.id === "CRICKET_001");
const unmatched = semanticMatchAnswer("quantum physics theory", q1);
assert.strictEqual(unmatched.status, "UNMATCHED", "Unrelated input must be UNMATCHED");
assert.strictEqual(unmatched.points || 0, 0, "Unmatched input awards 0 points");
passed++;
console.log("  ✓ Unmatched input rejected with 0 points\n");

console.log("==================================================");
console.log(`TEST RESULTS: ${passed} / ${total + 1} PASSED (0 FAILED)`);
console.log("==================================================");
