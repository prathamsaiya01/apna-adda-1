// test-bluff-masters-e2e.mjs
import { io as Client } from "socket.io-client";
import backend from "./apna-adda-backend/index.js";
const BluffMastersEngine = (await import("./apna-adda-backend/games/bluffMastersEngine.js")).default || (await import("./apna-adda-backend/games/bluffMastersEngine.js"));
const { BLUFF_MASTERS_QUESTIONS, CATEGORIES } = (await import("./apna-adda-backend/games/bluffMastersQuestions.js")).default || (await import("./apna-adda-backend/games/bluffMastersQuestions.js"));

const { server, roomManager } = backend;
const TEST_PORT = 4005;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

function createClient(userId, name) {
  const socket = Client(SERVER_URL, {
    transports: ["websocket", "polling"],
    forceNew: true,
    reconnection: false
  });
  return { socket, userId, name };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function runTests() {
  console.log("==================================================");
  console.log("   BLUFF MASTERS MULTIPLAYER E2E TEST SUITE");
  console.log("==================================================\n");

  if (!server.listening) {
    await new Promise((resolve) => {
      server.listen(TEST_PORT, () => {
        console.log(`Test server running on ${SERVER_URL}\n`);
        resolve();
      });
    });
  } else {
    console.log(`Test server running on ${SERVER_URL}\n`);
  }

  try {
    // ---------------- TEST 1: Question Bank Integrity ----------------
    console.log("--- TEST 1: Question Bank Integrity (100 Pairs) ---");
    assert(BLUFF_MASTERS_QUESTIONS.length === 100, `Exactly 100 question pairs present (found ${BLUFF_MASTERS_QUESTIONS.length})`);
    assert(CATEGORIES.length === 9, `All 8 specific categories + 'All Categories' present (found ${CATEGORIES.length})`);

    const ids = new Set(BLUFF_MASTERS_QUESTIONS.map(q => q.id));
    assert(ids.size === 100, "All 100 question IDs are unique (1 to 100)");

    const allHaveQuestions = BLUFF_MASTERS_QUESTIONS.every(q => q.regularQuestion && q.blufferQuestion && q.category);
    assert(allHaveQuestions === true, "Every question pair has regularQuestion, blufferQuestion, and category");

    // ---------------- TEST 2: Room Creation & Multi-Player Lobby ----------------
    console.log("\n--- TEST 2: Room Creation & 4-Player Lobby Setup ---");
    const p1 = createClient("user-bm-host", "Pratham");
    const p2 = createClient("user-bm-guest1", "Aakash");
    const p3 = createClient("user-bm-guest2", "Jiya");
    const p4 = createClient("user-bm-guest3", "Rohit");

    const createRoomRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: "bluff-masters",
        hostName: p1.name,
        hostUserId: p1.userId,
        maxPlayers: 8
      })
    }).then(r => r.json());

    assert(createRoomRes.success === true, "Bluff Masters room created successfully");
    const roomCode = createRoomRes.room.code;
    const roomId = createRoomRes.room._id || createRoomRes.room.id;
    assert(typeof roomCode === "string" && roomCode.length === 4, `Generated 4-letter room code: ${roomCode}`);

    // Players join room
    await new Promise(res => p1.socket.emit("joinRoom", { roomIdentifier: roomCode, userId: p1.userId, name: p1.name }, res));
    await new Promise(res => p2.socket.emit("joinRoom", { roomIdentifier: roomCode, userId: p2.userId, name: p2.name }, res));
    await new Promise(res => p3.socket.emit("joinRoom", { roomIdentifier: roomCode, userId: p3.userId, name: p3.name }, res));
    await new Promise(res => p4.socket.emit("joinRoom", { roomIdentifier: roomCode, userId: p4.userId, name: p4.name }, res));

    const roomAfterJoins = roomManager.getRoom(roomId);
    assert(roomAfterJoins.players.length === 4, `All 4 players joined room (players: ${roomAfterJoins.players.length})`);

    // ---------------- TEST 3: Secret Question & Anti-Cheat Role Masking ----------------
    console.log("\n--- TEST 3: Secret Question & Anti-Cheat Distribution ---");
    let card1 = null, card2 = null, card3 = null, card4 = null;
    let publicState1 = null;

    p1.socket.on("privateCard", (c) => { card1 = c; });
    p2.socket.on("privateCard", (c) => { card2 = c; });
    p3.socket.on("privateCard", (c) => { card3 = c; });
    p4.socket.on("privateCard", (c) => { card4 = c; });
    p1.socket.on("gameStateUpdate", (s) => { publicState1 = s.state || s; });

    // Host starts room
    await new Promise(res => p1.socket.emit("startRoom", { roomId }, res));
    await delay(200);

    assert(card1 && card2 && card3 && card4, "All 4 players received private role & question cards");
    const cards = [card1, card2, card3, card4];
    const bluffers = cards.filter(c => c.role === "bluffer");
    const regulars = cards.filter(c => c.role === "regular");

    assert(bluffers.length === 1, `Exactly 1 Bluffer assigned for 4 players (found ${bluffers.length})`);
    assert(regulars.length === 3, `Exactly 3 Regular players assigned (found ${regulars.length})`);

    // Anti-Cheat: Bluffer has different question, regulars have same question
    const regQuestions = new Set(regulars.map(r => r.question));
    assert(regQuestions.size === 1, "All regular players received the exact same regular question");
    assert(bluffers[0].question !== regulars[0].question, "Bluffer received a different, secret question");

    // Public state verification: DOES NOT leak bluffer identity or answers
    assert(!publicState1.revealData, "Public state masks reveal data during answering phase");
    assert(!publicState1.blufferUserId, "Public state masks blufferUserId (Anti-Cheat check passed)");

    // ---------------- TEST 4: Answer Submission & Anonymous Reveal ----------------
    console.log("\n--- TEST 4: Private Answer Submission & Anonymization ---");
    const clients = [p1, p2, p3, p4];
    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];
      const card = [card1, card2, card3, card4][i];
      const answerText = card.isBluffer ? "Answer from secret bluffer" : `Genuine answer from ${c.name}`;

      await new Promise(res => {
        c.socket.emit("gameAction", {
          roomId,
          action: "submitAnswer",
          payload: { answer: answerText, userId: c.userId }
        }, (resp) => {
          assert(resp.ok && resp.success, `${c.name} submitted answer privately`);
          res();
        });
      });
    }

    await delay(200);

    // After all 4 submitted, engine should automatically transition to 'discussion'
    assert(publicState1.gamePhase === "discussion", `Game automatically transitioned to 'discussion' phase (current: ${publicState1.gamePhase})`);
    assert(publicState1.anonymousAnswers.length === 4, `All 4 answers revealed anonymously (count: ${publicState1.anonymousAnswers.length})`);

    // Verify answers do NOT contain author metadata
    const authorsLeaked = publicState1.anonymousAnswers.some(a => a.userId || a.author || a.name || a.isBluffer !== undefined);
    assert(!authorsLeaked, "Anonymous answers contain NO author metadata or bluffer flags (Anti-Cheat check passed)");

    // ---------------- TEST 5: Real-time Discussion Chat ----------------
    console.log("\n--- TEST 5: Real-time Discussion Chat ---");
    let p2ReceivedMsg = null;
    p2.socket.on("discussionMessage", (msg) => { p2ReceivedMsg = msg; });

    await new Promise(res => {
      p1.socket.emit("gameAction", {
        roomId,
        action: "sendDiscussionMessage",
        payload: { message: "Answer B sounds completely out of place!", userId: p1.userId }
      }, (resp) => {
        assert(resp.ok && resp.success, "Host sent discussion chat message");
        res();
      });
    });

    await delay(150);
    assert(p2ReceivedMsg && p2ReceivedMsg.text.includes("Answer B"), `Other players received real-time chat: '${p2ReceivedMsg?.text}'`);

    // ---------------- TEST 6: Host Advances to Voting & Accusations ----------------
    console.log("\n--- TEST 6: Voting Phase & Accusations ---");
    await new Promise(res => {
      p1.socket.emit("gameAction", {
        roomId,
        action: "startVoting",
        payload: { userId: p1.userId }
      }, (resp) => {
        assert(resp.ok, "Host advanced to voting phase");
        res();
      });
    });

    await delay(150);
    assert(publicState1.gamePhase === "voting", "Phase transitioned to 'voting'");

    // Test Self-Voting Prohibition
    await new Promise(res => {
      p2.socket.emit("gameAction", {
        roomId,
        action: "submitVote",
        payload: { targetUserId: p2.userId, userId: p2.userId }
      }, (resp) => {
        assert(resp.error && resp.error.includes("cannot vote for yourself"), `Self-voting correctly blocked: "${resp.error}"`);
        res();
      });
    });

    // Determine who the Bluffer is
    const blufferClient = cards[0].isBluffer ? p1 : (cards[1].isBluffer ? p2 : (cards[2].isBluffer ? p3 : p4));
    const regularClients = clients.filter(c => c !== blufferClient);

    // Regular players vote for the Bluffer (catching the bluffer)
    for (const reg of regularClients) {
      await new Promise(res => {
        reg.socket.emit("gameAction", {
          roomId,
          action: "submitVote",
          payload: { targetUserId: blufferClient.userId, userId: reg.userId }
        }, (resp) => {
          assert(resp.ok && resp.success, `${reg.name} voted for suspected bluffer`);
          res();
        });
      });
    }

    // Bluffer votes for a regular player
    await new Promise(res => {
      blufferClient.socket.emit("gameAction", {
        roomId,
        action: "submitVote",
        payload: { targetUserId: regularClients[0].userId, userId: blufferClient.userId }
      }, (resp) => {
        assert(resp.ok && resp.success, `Bluffer ${blufferClient.name} voted for ${regularClients[0].name}`);
        res();
      });
    });

    await delay(200);

    // ---------------- TEST 7: The Reveal & Score Calculation ----------------
    console.log("\n--- TEST 7: Reveal Phase & Authoritative Scoring ---");
    assert(publicState1.gamePhase === "reveal", `Game automatically transitioned to 'reveal' phase (current: ${publicState1.gamePhase})`);
    assert(publicState1.revealData !== null, "revealData provided in state");
    assert(publicState1.revealData.blufferUserIds.includes(blufferClient.userId), `Bluffer correctly identified: ${publicState1.revealData.blufferNames.join(', ')}`);
    assert(publicState1.revealData.roundWinner === "town", `Town won round because Bluffer was caught (winner: ${publicState1.revealData.roundWinner})`);

    // Check scores
    const updatedBluffer = publicState1.players.find(p => p.userId === blufferClient.userId);
    const updatedRegular = publicState1.players.find(p => p.userId === regularClients[0].userId);

    assert(updatedBluffer.roundScore === 1, `Bluffer received +1 consolation point for being caught (got ${updatedBluffer.roundScore})`);
    assert(updatedRegular.roundScore === 2, `Regular player received +2 points for correctly voting Bluffer (got ${updatedRegular.roundScore})`);

    // ---------------- TEST 8: Next Round Progression ----------------
    console.log("\n--- TEST 8: Next Round Progression ---");
    await new Promise(res => {
      p1.socket.emit("gameAction", {
        roomId,
        action: "nextRound",
        payload: { userId: p1.userId }
      }, (resp) => {
        assert(resp.ok && resp.startedNextRound, "Host advanced to Round 2");
        res();
      });
    });

    await delay(200);
    assert(publicState1.roundNumber === 2, `Round number advanced to 2 (current: ${publicState1.roundNumber})`);
    assert(publicState1.gamePhase === "answering", "Round 2 started in answering phase");

    // Clean up sockets
    p1.socket.disconnect();
    p2.socket.disconnect();
    p3.socket.disconnect();
    p4.socket.disconnect();

  } catch (err) {
    console.error("Test execution failed with unhandled exception:", err);
    failed++;
  } finally {
    console.log("\n==================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");
    server.close();
    process.exit(failed === 0 ? 0 : 1);
  }
}

runTests();
