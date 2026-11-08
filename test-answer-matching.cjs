// test-answer-matching.cjs
const { matchAnswer, normalizeText, evaluatePhraseMatch } = require("./apna-adda-backend/services/answerMatcher");
const {
  validateQuestionBatch,
  importQuestionBatch,
  getBatch,
  getAllBatchedQuestions,
  BATCH_1,
  BATCH_2
} = require("./apna-adda-backend/games/whatsTheMajorityBank");

console.log("==================================================");
console.log("   ANSWER MATCHER & BATCHED BANK TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

// ----------------------------------------------------
// TEST SUITE 1: Text Normalization
// ----------------------------------------------------
console.log("[Test Suite 1] Text Normalization");
assert(normalizeText("  HELLO   WORLD!  ") === "hello world", "Lowercases and strips exclamation / whitespace");
assert(normalizeText("Lying, cheating... & being fake?!") === "lying cheating being fake", "Removes multiple punctuation marks");
assert(normalizeText("") === "", "Handles empty string");
assert(normalizeText(null) === "", "Handles null gracefully");
assert(normalizeText(undefined) === "", "Handles undefined gracefully");

// ----------------------------------------------------
// TEST SUITE 2: Answer Matching on Question 1 (Red Flags)
// ----------------------------------------------------
console.log("\n[Test Suite 2] Word-Boundary & Specificity Matching");
const q1 = BATCH_1.questions[0]; // "What is the biggest red flag in a friendship?"
const answers = q1.answers;

// 1. Exact Keyword Match
const resLying = matchAnswer("lying", answers);
assert(resLying.matched === true, "Matches exact keyword 'lying'");
assert(resLying.rank === 1, "Matched category has Rank 1");
assert(resLying.points === 40, "Base points for Rank 1 is 40");
assert(resLying.canonicalAnswer === "Lying", "Canonical answer is 'Lying'");

// 2. Case Insensitive & Punctuation
const resCase = matchAnswer("  LYING!!! ", answers);
assert(resCase.matched === true && resCase.rank === 1, "Matches uppercase with spaces and punctuation");

// 3. Accepted Phrase Match
const resPhrase = matchAnswer("talking behind my back", answers);
assert(resPhrase.matched === true, "Matches accepted phrase 'talking behind my back'");
assert(resPhrase.rank === 2, "Rank 2 matched (Backstabbing)");
assert(resPhrase.canonicalAnswer === "Backstabbing", "Canonical answer is 'Backstabbing'");

// 4. Word-Boundary Awareness ("lie" should NOT match "client" or "relied")
const resClient = matchAnswer("client meeting", answers);
assert(resClient.matched === false, "Word-boundary: 'lie' does NOT match 'client'");
assert(resClient.points === 0, "Unmatched returns 0 points");

const resBelieve = matchAnswer("i believe in you", answers);
assert(resBelieve.matched === false, "Word-boundary: 'lie' does NOT match 'believe'");

// 5. Specificity Resolution: "fake friend" vs "lying"
const resFake = matchAnswer("she is a fake friend", answers);
assert(resFake.matched === true, "Matches 'fake friend'");
assert(resFake.rank === 4, "Matches Rank 4 (Being Fake)");

// 6. Ambiguous Answer Handling:
const ambiguousKey = [
  {
    id: "a1",
    rank: 1,
    canonicalAnswer: "Cat",
    points: 40,
    keywords: ["pet"],
    acceptedPhrases: []
  },
  {
    id: "a2",
    rank: 2,
    canonicalAnswer: "Dog",
    points: 30,
    keywords: ["pet"],
    acceptedPhrases: []
  }
];
const resAmbig = matchAnswer("pet", ambiguousKey);
assert(resAmbig.matched === false, "Ambiguous answer with equal specificity across categories is safely rejected");
assert(resAmbig.reason === "AMBIGUOUS_MATCH", "Identified reason as AMBIGUOUS_MATCH");
assert(resAmbig.points === 0, "Ambiguous answer receives 0 points");

// 7. Unmatched random text
const resRandom = matchAnswer("completely unrelated astronaut on moon", answers);
assert(resRandom.matched === false, "Unrelated text returns matched: false");
assert(resRandom.points === 0, "Unmatched random text returns 0 points");
assert(resRandom.reason === "UNMATCHED", "Reports reason: UNMATCHED");

// ----------------------------------------------------
// TEST SUITE 3: Question 2 (College Bunking) & Question 3 (Food)
// ----------------------------------------------------
console.log("\n[Test Suite 3] Relatable Indian Slang & Aliases");
const q2 = BATCH_1.questions[1]; // College Bunking
const resNeend = matchAnswer("neend nahi khuli", q2.answers);
assert(resNeend.matched === true && resNeend.rank === 1, "Matches Hindi slang 'neend nahi khuli' to Rank 1");

const resTapri = matchAnswer("tapri pe chai sutta", q2.answers);
assert(resTapri.matched === true && resTapri.rank === 3, "Matches 'tapri pe chai' to Rank 3 Canteen / Chai Tapri");

const q3 = BATCH_1.questions[2]; // Midnight Snack
const resMaggi = matchAnswer("2 minute maggi", q3.answers);
assert(resMaggi.matched === true && resMaggi.rank === 1, "Matches '2 minute maggi' to Rank 1 (Maggi)");

const resBiryani = matchAnswer("swiggying chicken biryani", q3.answers);
assert(resBiryani.matched === true && resBiryani.rank === 2, "Matches 'swiggying biryani' to Rank 2 (Biryani)");

// ----------------------------------------------------
// TEST SUITE 4: Batched Question Bank Validation
// ----------------------------------------------------
console.log("\n[Test Suite 4] Batched Question Bank Validation");
const val1 = validateQuestionBatch(BATCH_1);
assert(val1.valid === true, "Batch 1 passes all 15-question validation checks");
assert(val1.count === 15, "Batch 1 contains exactly 15 questions");

const val2 = validateQuestionBatch(BATCH_2);
assert(val2.valid === true, "Batch 2 passes all 15-question validation checks");
assert(val2.count === 15, "Batch 2 contains exactly 15 questions");

// Test validation failure on < 15 questions
const invalidBatchCount = {
  batchId: 99,
  questions: [{ id: "q1", question: "Short?", answerFormat: "OPEN_ENDED", answers: [] }]
};
const valFailCount = validateQuestionBatch(invalidBatchCount);
assert(valFailCount.valid === false, "Rejects batch with fewer than 15 questions");

// Test validation failure on duplicate ID
const invalidDupId = {
  batchId: 98,
  questions: Array(15).fill(null).map((_, i) => ({
    id: i === 1 ? "classic_friendship_001" : `q_${i}`,
    question: `Question ${i}?`,
    answerFormat: "OPEN_ENDED",
    answers: [
      { rank: 1, canonicalAnswer: "A", points: 40, keywords: ["a"] },
      { rank: 2, canonicalAnswer: "B", points: 30, keywords: ["b"] },
      { rank: 3, canonicalAnswer: "C", points: 20, keywords: ["c"] },
      { rank: 4, canonicalAnswer: "D", points: 10, keywords: ["d"] }
    ]
  }))
};
invalidDupId.questions[0].id = "classic_friendship_001";
const valFailDup = validateQuestionBatch(invalidDupId);
assert(valFailDup.valid === false, "Rejects batch with duplicate question IDs");

// Test Batch Registry
assert(getBatch(1) !== null, "getBatch(1) retrieves Batch 1");
assert(getBatch(2) !== null, "getBatch(2) retrieves Batch 2");
const allBatched = getAllBatchedQuestions();
assert(allBatched.length >= 30, `getAllBatchedQuestions() aggregates all questions (found ${allBatched.length})`);

console.log("\n==================================================");
console.log(`TOTAL AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) process.exit(1);
