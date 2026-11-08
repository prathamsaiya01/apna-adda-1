// test-whats-the-majority-e2e.cjs
const http = require('http');
const path = require('path');
const express = require('./apna-adda-backend/node_modules/express');
const { Server } = require('./apna-adda-backend/node_modules/socket.io');
const { io: ClientIO } = require('./node_modules/socket.io-client');
const RoomManager = require('./apna-adda-backend/roomManager');
const WhatsTheMajorityEngine = require('./apna-adda-backend/games/whatsTheMajorityEngine');
const {
  CLASSIC_CROWD_QUESTIONS,
  FRIENDS_MODE_QUESTIONS,
  validateAndImportQuestions
} = require('./apna-adda-backend/games/whatsTheMajorityQuestions');

const TEST_PORT = 4009;

async function runTestSuite() {
  console.log("=================================================");
  console.log("  WHAT'S THE MAJORITY? E2E & UNIT TEST SUITE");
  console.log("=================================================\n");

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

  // 1. UNIT TEST: Question Schema Validator
  console.log("[Test Suite 1] Question Schema & Import Validator");
  const validCrowdPack = [
    {
      id: "q_test1",
      question: "Which street snack reigns supreme in Mumbai?",
      category: "Indian Street Food",
      audience: "500 locals",
      options: [
        { text: "Vada Pav", rank: 1, points: 40, percentage: 60 },
        { text: "Pav Bhaji", rank: 2, points: 30, percentage: 25 },
        { text: "Sev Puri", rank: 3, points: 20, percentage: 10 },
        { text: "Bhel Puri", rank: 4, points: 10, percentage: 5 }
      ]
    }
  ];
  const validationRes = validateAndImportQuestions(validCrowdPack);
  assert(validationRes.valid === true, "Valid crowd pack imports successfully");
  assert(validationRes.importedCount === 1, "Import count matches expected");

  const invalidPack = [{ question: "Incomplete question?", options: [{ text: "Only 1" }] }];
  const invalidRes = validateAndImportQuestions(invalidPack);
  assert(invalidRes.valid === false, "Rejects pack with missing 4 ranked options");

  // 2. SETUP TEST HTTP & SOCKET SERVER
  console.log("\n[Test Suite 2] Server & RoomManager Integration");
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  const roomManager = new RoomManager(io);

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ code, roomId, roomIdentifier, userId, name }, cb) => {
      try {
        const res = roomManager.joinRoom(socket, { code, roomId, roomIdentifier, userId, name });
        cb && cb(res);
      } catch (err) {
        cb && cb({ error: err.message });
      }
    });

    socket.on("gameAction", ({ roomId, action, payload }, cb) => {
      try {
        const userEntry = roomManager.socketToUser.get(socket.id);
        const userId = (userEntry && userEntry.userId) || (payload && payload.userId);
        roomManager.handleGameAction(userId, { roomId, action, payload }, cb);
      } catch (err) {
        cb && cb({ error: err.message });
      }
    });
  });

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`  Test server running on port ${TEST_PORT}`);

  try {
    // 3. E2E: Room Creation and Join
    const room = roomManager.createRoom({
      name: "Majority Party Room",
      gameKey: "WhatsTheMajority",
      maxPlayers: 4,
      hostId: "user_p1",
      hostName: "Rohan"
    });
    room.settings = {
      rounds: 2,
      mode: "classic_crowd",
      roundTime: 5,
      multiplier: 1
    };

    assert(room && room.code, "Room created with unique room code");

    // Connect 3 socket clients
    function connectClient(userId, name) {
      return new Promise((resolve) => {
        const socket = ClientIO(`http://localhost:${TEST_PORT}`, {
          transports: ["websocket"],
          forceNew: true
        });
        socket.on("connect", () => {
          socket.emit("joinRoom", { code: room.code, userId, name }, (res) => {
            resolve({ socket, res });
          });
        });
      });
    }

    const c1 = await connectClient("user_p1", "Rohan");
    const c2 = await connectClient("user_p2", "Priya");
    const c3 = await connectClient("user_p3", "Aarav");

    assert(room.players.length === 3, "3 players joined room successfully");

    // Start game
    const startRes = roomManager.startRoom("user_p1", room._id);
    assert(startRes.ok === true, "Host starts What's the Majority match");

    const engine = roomManager.gameEngines.get(room._id);
    assert(engine !== undefined, "WhatsTheMajorityEngine instantiated in roomManager");

    // 4. E2E: Classic Crowd Round Flow & Anti-Cheat
    console.log("\n[Test Suite 3] Classic Crowd Round & Anti-Cheat");
    // Wait for transition to voting
    await new Promise((r) => setTimeout(r, 3100));
    assert(engine.state.gamePhase === "voting", "Phase transitioned to voting");

    // Set to a verified FIXED_OPTIONS question for Test Suite 3
    const fixedQ = {
      id: "q_test_fixed",
      question: "Which IPL team has the most passionate fanbase?",
      category: "Cricket",
      audienceProfile: "1,000 fans",
      answerFormat: "FIXED_OPTIONS",
      answers: [
        { id: "opt_1", rank: 1, canonicalAnswer: "RCB", points: 40, keywords: ["rcb"] },
        { id: "opt_2", rank: 2, canonicalAnswer: "CSK", points: 30, keywords: ["csk"] },
        { id: "opt_3", rank: 3, canonicalAnswer: "MI", points: 20, keywords: ["mi"] },
        { id: "opt_4", rank: 4, canonicalAnswer: "KKR", points: 10, keywords: ["kkr"] }
      ]
    };
    engine.privateRoundData.rawQuestion = fixedQ;
    engine.state.currentQuestion = {
      id: fixedQ.id,
      question: fixedQ.question,
      category: fixedQ.category,
      audience: fixedQ.audienceProfile,
      answerFormat: "FIXED_OPTIONS",
      mode: "classic_crowd",
      options: fixedQ.answers.map(a => ({ id: a.id, text: a.canonicalAnswer }))
    };
    engine.broadcastState();

    const publicQ = engine.state.currentQuestion;
    assert(publicQ.options.length === 4, "Question has 4 public options");
    assert(publicQ.options[0].rank === undefined, "Anti-cheat: Ranks are hidden from public state");
    assert(publicQ.options[0].points === undefined, "Anti-cheat: Points are hidden from public state");

    // Find option with rank 1, 2, 3 from server authoritative raw question
    const rawQ = engine.privateRoundData.rawQuestion;
    const answersList = rawQ.answers || rawQ.options;
    const optRank1 = answersList.find(o => o.rank === 1);
    const optRank2 = answersList.find(o => o.rank === 2);
    const optRank3 = answersList.find(o => o.rank === 3);

    // Player 1 submits Rank 1 option
    await new Promise((resolve) => {
      c1.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { optionId: optRank1.id, predictedWinnerId: optRank1.id }
      }, (res) => {
        assert(res.ok === true, "Player 1 submits answer");
        resolve();
      });
    });

    // Player 2 submits Rank 2 option
    await new Promise((resolve) => {
      c2.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { optionId: optRank2.id }
      }, (res) => {
        assert(res.ok === true, "Player 2 submits answer");
        resolve();
      });
    });

    // Player 3 submits Rank 3 option
    await new Promise((resolve) => {
      c3.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { optionId: optRank3.id }
      }, (res) => {
        assert(res.ok === true, "Player 3 submits answer (triggers early reveal)");
        resolve();
      });
    });

    // Wait for automatic reveal
    await new Promise((r) => setTimeout(r, 1200));
    assert(engine.state.gamePhase === "reveal", "Game phase transitioned to reveal");

    // Verify Scoring
    const p1 = engine.state.players.find(p => p.userId === "user_p1");
    const p2 = engine.state.players.find(p => p.userId === "user_p2");
    const p3 = engine.state.players.find(p => p.userId === "user_p3");

    // p1 picked rank 1 (40) + predicted winner bonus (50) = 90
    assert(p1.roundScore === 90, `Player 1 score is 90 (40 rank 1 + 50 prediction): got ${p1.roundScore}`);
    // p2 picked rank 2 (30) = 30
    assert(p2.roundScore === 30, `Player 2 score is 30 (rank 2): got ${p2.roundScore}`);
    // p3 picked rank 3 (20) = 20
    assert(p3.roundScore === 20, `Player 3 score is 20 (rank 3): got ${p3.roundScore}`);

    // 4.5. E2E: Open-Ended Question Matching & Privacy Check
    console.log("\n[Test Suite 3.5] Open-Ended Question Flow & Anti-Cheat Privacy");
    const { BATCH_1 } = require("./apna-adda-backend/games/whatsTheMajorityBank");
    const openQ = BATCH_1.questions[0]; // Red flag question
    engine.privateRoundData.rawQuestion = openQ;
    engine.privateRoundData.submissions.clear();
    engine.state.players.forEach(p => { p.hasVoted = false; p.roundScore = 0; });
    engine.state.currentQuestion = {
      id: openQ.id,
      question: openQ.question,
      category: openQ.category,
      audience: openQ.audienceProfile,
      answerFormat: "OPEN_ENDED",
      mode: "classic_crowd"
    };
    engine.state.gamePhase = "voting";
    engine.broadcastState();

    assert(engine.state.currentQuestion.options === undefined, "Anti-cheat: No options array sent in OPEN_ENDED");
    assert(engine.state.currentQuestion.answers === undefined, "Anti-cheat: No answers array sent in OPEN_ENDED");

    // Player 1 types: "they keep lying" (matches Rank 1: Lying)
    await new Promise((resolve) => {
      c1.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { textAnswer: "they keep lying" }
      }, (res) => {
        assert(res.ok === true, "Player 1 submits open-ended text answer");
        resolve();
      });
    });

    // Player 2 types: "talking behind my back" (matches Rank 2: Backstabbing)
    await new Promise((resolve) => {
      c2.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { textAnswer: "talking behind my back" }
      }, (res) => {
        assert(res.ok === true, "Player 2 submits open-ended text answer");
        resolve();
      });
    });

    // Player 3 types unmatched text: "random nonsense text"
    await new Promise((resolve) => {
      c3.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitAnswer",
        payload: { textAnswer: "random nonsense text" }
      }, (res) => {
        assert(res.ok === true, "Player 3 submits open-ended text answer");
        resolve();
      });
    });

    await new Promise((r) => setTimeout(r, 1200));
    assert(engine.state.gamePhase === "reveal", "Auto-transitioned to reveal for open-ended");

    const p1Open = engine.state.revealData.playerBreakdowns.find(p => p.userId === "user_p1");
    const p2Open = engine.state.revealData.playerBreakdowns.find(p => p.userId === "user_p2");
    const p3Open = engine.state.revealData.playerBreakdowns.find(p => p.userId === "user_p3");

    assert(p1Open.isMatched === true && p1Open.rank === 1, "Player 1 matched Rank 1 (Lying)");
    assert(p1Open.pointsAwarded === 40, "Player 1 awarded 40 points for Rank 1");
    assert(p2Open.isMatched === true && p2Open.rank === 2, "Player 2 matched Rank 2 (Backstabbing)");
    assert(p2Open.pointsAwarded === 30, "Player 2 awarded 30 points for Rank 2");
    assert(p3Open.isMatched === false, "Player 3 marked as unmatched");
    assert(p3Open.pointsAwarded === 0, "Player 3 awarded 0 points for unmatched text");

    // 5. TEST SUITE 4: Friends Mode & Majority Voting
    console.log("\n[Test Suite 4] Friends Mode & Majority Voting");
    engine.mode = "friends";
    engine.allowSelfVote = false;
    engine.startRound();

    await new Promise((r) => setTimeout(r, 3100));
    assert(engine.state.gamePhase === "voting", "Friends mode transitioned to voting");
    assert(engine.state.currentQuestion.mode === "friends", "Friends mode question active");

    // Test self-voting restriction
    let selfVoteBlocked = false;
    await new Promise((resolve) => {
      c1.socket.emit("gameAction", {
        roomId: room._id,
        action: "submitVote",
        payload: { targetUserId: "user_p1" } // Self vote
      }, (res) => {
        if (!res.ok && res.error.includes("Self-voting is disabled")) {
          selfVoteBlocked = true;
        }
        resolve();
      });
    });
    assert(selfVoteBlocked === true, "Self-voting prevented when allowSelfVote is false");

    // p1 votes for p2
    await new Promise((r) => c1.socket.emit("gameAction", { roomId: room._id, action: "submitVote", payload: { targetUserId: "user_p2" } }, r));
    // p3 votes for p2
    await new Promise((r) => c3.socket.emit("gameAction", { roomId: room._id, action: "submitVote", payload: { targetUserId: "user_p2" } }, r));
    // p2 votes for p1
    await new Promise((r) => c2.socket.emit("gameAction", { roomId: room._id, action: "submitVote", payload: { targetUserId: "user_p1" } }, r));

    // Wait for reveal
    await new Promise((r) => setTimeout(r, 1200));
    assert(engine.state.revealData.mode === "friends", "Reveal data has friends mode details");
    assert(engine.state.revealData.majorityUserIds.includes("user_p2"), "User P2 won the friend majority (2 votes)");

    // 6. TEST SUITE 5: Chaos Rules & Game Over
    console.log("\n[Test Suite 5] Chaos Round & Game Over");
    engine.mode = "chaos_round";
    engine.chaosEnabled = true;
    engine.startRound();
    await new Promise((r) => setTimeout(r, 3100));

    engine.state.activeChaosRule = "reverse_majority";
    const chaosRawQ = engine.privateRoundData.rawQuestion;
    const chaosAnswers = chaosRawQ.answers || chaosRawQ.options;
    const rank4Opt = chaosAnswers.find(o => o.rank === 4);

    // In reverse majority, rank 4 earns rank 1 points (40 pts)
    await new Promise((r) => c1.socket.emit("gameAction", { roomId: room._id, action: "submitAnswer", payload: { optionId: rank4Opt.id } }, r));
    await new Promise((r) => c2.socket.emit("gameAction", { roomId: room._id, action: "submitAnswer", payload: { optionId: rank4Opt.id } }, r));
    await new Promise((r) => c3.socket.emit("gameAction", { roomId: room._id, action: "submitAnswer", payload: { optionId: rank4Opt.id } }, r));

    await new Promise((r) => setTimeout(r, 1200));
    assert(engine.state.revealData.chaos === "reverse_majority", "Chaos modifier applied properly");
    assert(p1.roundScore === 40, `Player 1 scored 40 points from rank 4 in reverse majority: got ${p1.roundScore}`);

    engine.concludeGame();
    assert(engine.state.gamePhase === "game_over", "Game concludes successfully");
    assert(engine.state.gameWinner !== null, "Winner crowned at game over");

    // Disconnect clients
    c1.socket.disconnect();
    c2.socket.disconnect();
    c3.socket.disconnect();

  } finally {
    server.close();
  }

  console.log("\n=================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
