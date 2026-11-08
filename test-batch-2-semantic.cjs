// test-batch-2-semantic.cjs
const assert = require('assert');
const { semanticMatchAnswer } = require('./apna-adda-backend/services/answerMatcher');
const {
  getBatch,
  validateQuestionBatch,
  BATCH_BOLLYWOOD_2
} = require('./apna-adda-backend/games/whatsTheMajorityBank');

console.log("==================================================");
console.log("   BATCH 2 (BOLLYWOOD_016-030) SEMANTIC TEST SUITE");
console.log("==================================================\n");

// 1. Validation Test
const batch = getBatch(2);
assert(batch, "Batch 2 must be registered and retrievable via getBatch(2)");
assert.strictEqual(batch.questions.length, 15, "Batch 2 must have exactly 15 questions");

const validation = validateQuestionBatch(batch);
assert.strictEqual(validation.valid, true, `Batch 2 must pass validation: ${validation.error}`);
console.log("  ✓ Batch 2 schema validation PASSED (15 questions, ranks 1-4, unique IDs)\n");

let passed = 0;
let total = 0;

function testCase(qId, input, expectedCanonical, expectedRank, minConfidence = 0.75) {
  total++;
  const q = batch.questions.find(item => item.id === qId);
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

// Representative Semantic Tests across all 15 Questions in Batch 2
testCase("BOLLYWOOD_016", "RK", "Ranbir Kapoor", 1);
testCase("BOLLYWOOD_016", "King Khan", "Shah Rukh Khan", 2);
testCase("BOLLYWOOD_016", "Simba", "Ranveer Singh", 3);
testCase("BOLLYWOOD_016", "Vicky", "Vicky Kaushal", 4);

testCase("BOLLYWOOD_017", "Deepika", "Deepika Padukone", 1);
testCase("BOLLYWOOD_017", "Alia", "Alia Bhatt", 2);
testCase("BOLLYWOOD_017", "Bebo", "Kareena Kapoor", 3);
testCase("BOLLYWOOD_017", "Kat", "Katrina Kaif", 4);

testCase("BOLLYWOOD_018", "All is well", "3 Idiots", 1);
testCase("BOLLYWOOD_018", "Baburao wali movie", "Hera Pheri", 2);
testCase("BOLLYWOOD_018", "YJHD", "Yeh Jawaani Hai Deewani", 3);
testCase("BOLLYWOOD_018", "ZNMD", "Zindagi Na Milegi Dobara", 4);

testCase("BOLLYWOOD_019", "Comedy", "Comedy", 1);
testCase("BOLLYWOOD_019", "Action", "Action", 2);
testCase("BOLLYWOOD_019", "Suspense", "Thriller", 3);
testCase("BOLLYWOOD_019", "Love stories", "Romance", 4);

testCase("BOLLYWOOD_020", "Tum Hi Ho", "Aashiqui 2", 1);
testCase("BOLLYWOOD_020", "Kun Faya Kun", "Rockstar", 2);
testCase("BOLLYWOOD_020", "Balam Pichkari", "Yeh Jawaani Hai Deewani", 3);
testCase("BOLLYWOOD_020", "Bekhayali", "Kabir Singh", 4);

testCase("BOLLYWOOD_021", "Rancho", "Aamir Khan", 1);
testCase("BOLLYWOOD_021", "SRK", "Shah Rukh Khan", 2);
testCase("BOLLYWOOD_021", "Virus", "Boman Irani", 3);
testCase("BOLLYWOOD_021", "Big B", "Amitabh Bachchan", 4);

testCase("BOLLYWOOD_022", "Chandler", "Chandler Bing", 1);
testCase("BOLLYWOOD_022", "Joey", "Joey Tribbiani", 2);
testCase("BOLLYWOOD_022", "Sheldon", "Sheldon Cooper", 3);
testCase("BOLLYWOOD_022", "Harry Potter", "Harry Potter", 4);

testCase("BOLLYWOOD_023", "Kitne aadmi the", "Gabbar Singh", 1);
testCase("BOLLYWOOD_023", "Mogambo khush hua", "Mogambo", 2);
testCase("BOLLYWOOD_023", "Crime Master Gogo", "Crime Master Gogo", 3);
testCase("BOLLYWOOD_023", "Kancha Cheena", "Kancha Cheena", 4);

testCase("BOLLYWOOD_024", "Arijit", "Arijit Singh", 1);
testCase("BOLLYWOOD_024", "Sonu Nigam", "Sonu Nigam", 2);
testCase("BOLLYWOOD_024", "Kishore da", "Kishore Kumar", 3);
testCase("BOLLYWOOD_024", "Shreya Ghoshal", "Shreya Ghoshal", 4);

testCase("BOLLYWOOD_025", "MCU", "Marvel Cinematic Universe", 1);
testCase("BOLLYWOOD_025", "Hogwarts", "Harry Potter", 2);
testCase("BOLLYWOOD_025", "F&F", "Fast & Furious", 3);
testCase("BOLLYWOOD_025", "Tiger Pathaan universe", "YRF Spy Universe", 4);

testCase("BOLLYWOOD_026", "Ranveer Singh", "Ranveer Singh", 1);
testCase("BOLLYWOOD_026", "SRK", "Shah Rukh Khan", 2);
testCase("BOLLYWOOD_026", "Alia Bhatt", "Alia Bhatt", 3);
testCase("BOLLYWOOD_026", "Vicky Kaushal", "Vicky Kaushal", 4);

testCase("BOLLYWOOD_027", "Kitne aadmi the", "Sholay", 1);
testCase("BOLLYWOOD_027", "Mere paas maa hai", "Deewar", 2);
testCase("BOLLYWOOD_027", "Don ko pakadna mushkil hai", "Don", 3);
testCase("BOLLYWOOD_027", "All is well", "3 Idiots", 4);

testCase("BOLLYWOOD_028", "Joey from Friends", "Joey Tribbiani", 1);
testCase("BOLLYWOOD_028", "Harry Potter", "Harry Potter", 2);
testCase("BOLLYWOOD_028", "Ted Mosby", "Ted Mosby", 3);
testCase("BOLLYWOOD_028", "Spidey", "Spider-Man", 4);

testCase("BOLLYWOOD_029", "3 Idiots", "3 Idiots", 1);
testCase("BOLLYWOOD_029", "Baburao", "Hera Pheri", 2);
testCase("BOLLYWOOD_029", "YJHD", "Yeh Jawaani Hai Deewani", 3);
testCase("BOLLYWOOD_029", "ZNMD", "Zindagi Na Milegi Dobara", 4);

testCase("BOLLYWOOD_030", "Andaz Apna Apna", "Andaz Apna Apna", 1);
testCase("BOLLYWOOD_030", "ZNMD 2", "Zindagi Na Milegi Dobara", 2);
testCase("BOLLYWOOD_030", "BMB", "Bhaag Milkha Bhaag", 3);
testCase("BOLLYWOOD_030", "Brahmastra 2", "Brahmastra", 4);

// Additional Edge Cases
console.log("--- Testing Ambiguity and Unmatched Fallbacks ---");
const q16 = batch.questions.find(item => item.id === "BOLLYWOOD_016");
const unmatched = semanticMatchAnswer("quantum mechanical equations", q16);
assert.strictEqual(unmatched.status, "UNMATCHED", "Unrelated input must be UNMATCHED");
assert.strictEqual(unmatched.points || 0, 0, "Unmatched input awards 0 points");
passed++;
console.log("  ✓ Unmatched input rejected with 0 points\n");

console.log("==================================================");
console.log(`TEST RESULTS: ${passed} / ${total + 1} PASSED (0 FAILED)`);
console.log("==================================================");
