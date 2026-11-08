// test-role-randomization.mjs
import {
  secureRandomInt,
  secureRandomIndex,
  secureFisherYatesShuffle,
  secureSample,
  secureChoice
} from "./apna-adda-backend/utils/secureRandom.js";

import MafiaEngine from "./apna-adda-backend/games/mafiaEngine.js";
import BluffMastersEngine from "./apna-adda-backend/games/bluffMastersEngine.js";
import MrWhiteEngine from "./apna-adda-backend/games/mrWhiteEngine.js";
import SpyGameEngine from "./apna-adda-backend/games/spyGameEngine.js";
import WhoAmIEngine from "./apna-adda-backend/games/whoAmIEngine.js";
import DumbCharadesEngine from "./apna-adda-backend/games/dumbCharadesEngine.js";
import HollywoodBollywoodEngine from "./apna-adda-backend/games/hollywoodBollywoodEngine.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function createMockIo() {
  const emittedEvents = [];
  return {
    to: (roomOrChannel) => ({
      emit: (eventName, data) => {
        emittedEvents.push({ channel: roomOrChannel, eventName, data });
      }
    }),
    emittedEvents
  };
}

function createMockRoom(playerCount, extraSettings = {}) {
  const players = [];
  for (let i = 1; i <= playerCount; i++) {
    players.push({
      _id: `user_p${i}`,
      userId: `user_p${i}`,
      name: `Player_${i}`,
      connected: true
    });
  }
  return {
    _id: `room_${Date.now()}_${playerCount}`,
    code: `R${playerCount}`,
    hostId: 'user_p1',
    players,
    settings: { ...extraSettings }
  };
}

async function runRoleRandomizationTests() {
  console.log("==================================================");
  console.log("   APNA ADDA CRYPTOGRAPHIC ROLE AUDIT TEST SUITE");
  console.log("==================================================\n");

  // ----------------------------------------------------
  // TEST 1: Cryptographic Random Core Engine
  // ----------------------------------------------------
  console.log("--- TEST 1: Cryptographic Random Core Engine ---");
  const randInt = secureRandomInt(10, 20);
  assert(randInt >= 10 && randInt < 20, `secureRandomInt(10, 20) returned ${randInt}`);

  const sampleArr = [1, 2, 3, 4, 5, 6];
  const shuffled = secureFisherYatesShuffle(sampleArr);
  assert(shuffled.length === 6, "Shuffled array preserves length");
  assert(shuffled.slice().sort().join() === sampleArr.join(), "Shuffled array preserves all elements");

  // ----------------------------------------------------
  // TEST 2: Mafia Role Assignment Distributions (5, 6, 10, 16 Players)
  // ----------------------------------------------------
  console.log("\n--- TEST 2: Mafia Role Assignment Exact Distributions ---");
  const mafiaConfigs = [
    { count: 5, expected: { mafia: 1, detective: 1, doctor: 1, villager: 2 } },
    { count: 6, expected: { mafia: 2, detective: 1, doctor: 1, villager: 2 } },
    { count: 10, expected: { mafia: 3, detective: 1, doctor: 1, villager: 5 } },
    { count: 16, expected: { mafia: 4, detective: 1, doctor: 1, villager: 10 } }
  ];

  for (const cfg of mafiaConfigs) {
    const room = createMockRoom(cfg.count);
    const io = createMockIo();
    const engine = new MafiaEngine(room, io);
    engine.assignSecretRoles();

    const rolesTally = { mafia: 0, detective: 0, doctor: 0, villager: 0 };
    room.players.forEach(p => {
      const card = engine.getPrivateCard(p.userId);
      assert(card !== null, `${p.name} in ${cfg.count}-player room received valid private card`);
      assert(card.role in rolesTally, `${p.name} assigned recognized role: ${card.role}`);
      rolesTally[card.role]++;
    });

    assert(
      rolesTally.mafia === cfg.expected.mafia &&
      rolesTally.detective === cfg.expected.detective &&
      rolesTally.doctor === cfg.expected.doctor &&
      rolesTally.villager === cfg.expected.villager,
      `${cfg.count}-player distribution matches exactly: M:${rolesTally.mafia}, Det:${rolesTally.detective}, Doc:${rolesTally.doctor}, Vil:${rolesTally.villager}`
    );
  }

  // ----------------------------------------------------
  // TEST 3: Mafia Monte Carlo Uniformity (No Position Bias)
  // ----------------------------------------------------
  console.log("\n--- TEST 3: Mafia Monte Carlo Uniformity Simulation (300 Rounds) ---");
  const simCount = 300;
  const pCount = 6;
  const mafiaPositionCounts = new Array(pCount).fill(0);
  const detectivePositionCounts = new Array(pCount).fill(0);

  for (let s = 0; s < simCount; s++) {
    const room = createMockRoom(pCount);
    const io = createMockIo();
    const engine = new MafiaEngine(room, io);
    engine.assignSecretRoles();

    room.players.forEach((p, idx) => {
      const card = engine.getPrivateCard(p.userId);
      if (card.role === 'mafia') mafiaPositionCounts[idx]++;
      if (card.role === 'detective') detectivePositionCounts[idx]++;
    });
  }

  // In 6-player Mafia with 2 Mafia per game (1/3 probability per player = ~100 hits in 300 games):
  // Check that every single seat (0 to 5) receives the Mafia role multiple times (no seat is skipped or 100% hardcoded)
  const allSeatsGotMafia = mafiaPositionCounts.every(c => c > 40 && c < 160);
  assert(allSeatsGotMafia, `Every seat received Mafia with uniform variance: [${mafiaPositionCounts.join(', ')}]`);
  assert(mafiaPositionCounts[0] < simCount, `Player 1 (index 0) is NEVER hardcoded as Mafia (got ${mafiaPositionCounts[0]}/${simCount})`);

  const allSeatsGotDetective = detectivePositionCounts.every(c => c > 15 && c < 90);
  assert(allSeatsGotDetective, `Every seat received Detective uniformly: [${detectivePositionCounts.join(', ')}]`);

  // ----------------------------------------------------
  // TEST 4: Mafia Reconnection State Preservation
  // ----------------------------------------------------
  console.log("\n--- TEST 4: Mafia Role Preservation on Reconnect ---");
  const testRoom = createMockRoom(6);
  const testEngine = new MafiaEngine(testRoom, createMockIo());
  testEngine.start();

  const originalCard = testEngine.getPrivateCard('user_p2');
  assert(originalCard && originalCard.role, `Player 2 initial role assigned: ${originalCard?.role}`);

  // Simulate refresh / getPrivateCard
  const reconnectedCard = testEngine.getPrivateCard('user_p2');
  assert(reconnectedCard.role === originalCard.role, `Reconnected player role preserved identically without re-randomizing`);

  // ----------------------------------------------------
  // TEST 5: Bluff Masters Single Bluffer Randomization
  // ----------------------------------------------------
  console.log("\n--- TEST 5: Bluff Masters Single Bluffer Uniformity (300 Rounds) ---");
  const bmRounds = 300;
  const bmPlayerCount = 4;
  const bmBlufferSeats = new Array(bmPlayerCount).fill(0);

  for (let r = 0; r < bmRounds; r++) {
    const room = createMockRoom(bmPlayerCount);
    const io = createMockIo();
    const engine = new BluffMastersEngine(room, io);
    engine.startRound();

    const blufferIds = engine.privateRoundData.blufferUserIds;
    assert(blufferIds.length === 1, `Exactly 1 Bluffer assigned in round ${r + 1}`);

    const blufferId = blufferIds[0];
    const seatIdx = room.players.findIndex(p => p.userId === blufferId);
    assert(seatIdx !== -1, `Bluffer is an authentic player from the room`);
    bmBlufferSeats[seatIdx]++;
  }

  // In 4-player with 1 bluffer (25% = ~75 hits in 300 rounds):
  const allSeatsGotBluffer = bmBlufferSeats.every(c => c > 35 && c < 120);
  assert(allSeatsGotBluffer, `All seats received Bluffer role uniformly: [${bmBlufferSeats.join(', ')}]`);
  assert(bmBlufferSeats[0] < bmRounds, `Player 1 (index 0) is NEVER hardcoded as Bluffer (got ${bmBlufferSeats[0]}/${bmRounds})`);

  // ----------------------------------------------------
  // TEST 6: Bluff Masters Double Trouble Mode (2 Distinct Bluffers)
  // ----------------------------------------------------
  console.log("\n--- TEST 6: Bluff Masters Double Trouble Mode (2 Distinct Bluffers) ---");
  const dtRoom = createMockRoom(6, { doubleTrouble: true });
  const dtIo = createMockIo();
  const dtEngine = new BluffMastersEngine(dtRoom, dtIo);

  let allDistinct = true;
  let exactlyTwo = true;

  for (let i = 0; i < 50; i++) {
    dtEngine.startRound();
    const bIds = dtEngine.privateRoundData.blufferUserIds;
    if (bIds.length !== 2) exactlyTwo = false;
    if (bIds[0] === bIds[1]) allDistinct = false;
  }

  assert(exactlyTwo, "Double Trouble mode assigned exactly 2 Bluffers every round");
  assert(allDistinct, "Double Trouble Bluffers are guaranteed distinct (no player assigned twice)");

  // ----------------------------------------------------
  // TEST 7: Mr. White & Spy Game Secret Role Randomization
  // ----------------------------------------------------
  console.log("\n--- TEST 7: Mr. White & Spy Game Secret Identity Randomization ---");
  const mwSeats = [0, 0, 0, 0];
  const spySeats = [0, 0, 0, 0];

  for (let i = 0; i < 200; i++) {
    const mwRoom = createMockRoom(4);
    const mwEngine = new MrWhiteEngine(mwRoom, createMockIo());
    mwEngine.start();
    const mwIdx = mwRoom.players.findIndex(p => p.userId === mwEngine.mrWhitePlayerId);
    mwSeats[mwIdx]++;

    const spyRoom = createMockRoom(4);
    const spyEngine = new SpyGameEngine(spyRoom, createMockIo());
    spyEngine.start();
    const spyIdx = spyRoom.players.findIndex(p => p.userId === spyEngine.spyPlayerId);
    spySeats[spyIdx]++;
  }

  assert(mwSeats.every(c => c > 20), `Mr. White randomly distributed across all seats: [${mwSeats.join(', ')}]`);
  assert(mwSeats[0] < 200, `Player 1 is not hardcoded as Mr. White`);

  assert(spySeats.every(c => c > 20), `Spy Game randomly distributed across all seats: [${spySeats.join(', ')}]`);
  assert(spySeats[0] < 200, `Player 1 is not hardcoded as Spy`);

  // ----------------------------------------------------
  // TEST 8: Who Am I? & Dumb Charades Initial Performer Randomization
  // ----------------------------------------------------
  console.log("\n--- TEST 8: Who Am I? & Dumb Charades Initial Performer Randomization ---");
  const whoSeats = [0, 0, 0, 0];
  const dcSeats = [0, 0, 0, 0];

  for (let i = 0; i < 200; i++) {
    const whoRoom = createMockRoom(4);
    const whoEngine = new WhoAmIEngine(whoRoom, createMockIo());
    whoEngine.start();
    whoSeats[whoEngine.state.currentPlayerIndex]++;

    const dcRoom = createMockRoom(4);
    const dcEngine = new DumbCharadesEngine(dcRoom, createMockIo());
    dcEngine.start();
    dcSeats[dcEngine.state.currentPlayerIndex]++;
  }

  assert(whoSeats.every(c => c > 20), `Who Am I? celebrity holder initialized randomly across seats: [${whoSeats.join(', ')}]`);
  assert(whoSeats[0] < 200, "Who Am I? does not always start with Player 1");

  assert(dcSeats.every(c => c > 20), `Dumb Charades initial actor initialized randomly across seats: [${dcSeats.join(', ')}]`);
  assert(dcSeats[0] < 200, "Dumb Charades does not always start with Player 1");

  // ----------------------------------------------------
  // TEST 9: Public State Role Masking (Anti-Cheat)
  // ----------------------------------------------------
  console.log("\n--- TEST 9: Strict Public State Masking (Anti-Cheat Audit) ---");
  const antiCheatMafia = new MafiaEngine(createMockRoom(6), createMockIo());
  antiCheatMafia.start();
  assert(antiCheatMafia.state.allRevealedRoles === undefined, "Mafia secret roles strictly hidden in public state before game over");

  const antiCheatBluff = new BluffMastersEngine(createMockRoom(4), createMockIo());
  antiCheatBluff.startRound();
  assert(antiCheatBluff.state.revealData === null, "Bluff Masters bluffer identity masked during answering");

  const antiCheatWhite = new MrWhiteEngine(createMockRoom(4), createMockIo());
  antiCheatWhite.start();
  assert(antiCheatWhite.state.revealedSummary === null, "Mr. White secret identity masked in public state");

  const antiCheatSpy = new SpyGameEngine(createMockRoom(4), createMockIo());
  antiCheatSpy.start();
  assert(antiCheatSpy.state.revealedSummary === null, "Spy identity and secret location masked in public state");

  console.log("\n==================================================");
  console.log(`TOTAL AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runRoleRandomizationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
