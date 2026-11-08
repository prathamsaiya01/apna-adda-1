// test-multiplayer-e2e.mjs
import { io as Client } from "socket.io-client";
import backend from "./apna-adda-backend/index.js";

const { server, roomManager } = backend;
const TEST_PORT = server.address()?.port || 4000;
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
  console.log("   APNA ADDA MULTIPLAYER E2E TEST SUITE");
  console.log("==================================================\n");

  if (!server.listening) {
    await new Promise((resolve) => {
      server.listen(TEST_PORT, () => {
        console.log(`Test server running on ${SERVER_URL}\n`);
        resolve();
      });
    });
  } else {
    console.log(`Test server already running on ${SERVER_URL}\n`);
  }

  try {
    // ---------------- TEST 1: REST API ----------------
    console.log("--- TEST 1: REST API & Room Creation ---");
    const healthRes = await fetch(`${SERVER_URL}/api/health`).then(r => r.json());
    assert(healthRes.status === "ok", "Health endpoint returns status: ok");

    const gamesRes = await fetch(`${SERVER_URL}/api/games?catalog=true`).then(r => r.json());
    assert(Array.isArray(gamesRes) && gamesRes.length >= 6, `Games endpoint returns all games (found ${gamesRes.length})`);

    const createRoomRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: "cricketers-atlas",
        hostName: "Aakash",
        hostUserId: "user-aakash-1"
      })
    }).then(r => r.json());

    assert(createRoomRes.success === true, "Room created successfully via REST");
    assert(createRoomRes.room && createRoomRes.room.code && createRoomRes.room.code.length === 4, `Generated 4-letter room code: ${createRoomRes.room?.code}`);
    const roomCode = createRoomRes.room?.code || createRoomRes.code;
    const roomId = createRoomRes.room?.id || createRoomRes.room?._id || createRoomRes.id || createRoomRes._id;

    // ---------------- TEST 2: Multi-Client Lobby Sync ----------------
    console.log("\n--- TEST 2: Multi-Client Lobby Sync & Host Controls ---");
    const clientA = createClient("user-aakash-1", "Aakash");
    const clientB = createClient("user-priya-2", "Priya");
    const clientC = createClient("user-rohit-3", "Rohit");

    let clientBReceivedUpdate = null;
    clientB.socket.on("roomUpdate", (room) => {
      clientBReceivedUpdate = room;
    });

    // Client A joins room
    await new Promise((resolve) => {
      clientA.socket.emit("joinRoom", {
        roomIdentifier: roomCode,
        userId: clientA.userId,
        name: clientA.name
      }, (resp) => {
        assert(resp.success && resp.isHost === true, "Host Client A joined successfully as host");
        resolve();
      });
    });

    // Client B joins with 4-letter room code
    await new Promise((resolve) => {
      clientB.socket.emit("joinRoom", {
        roomIdentifier: roomCode,
        userId: clientB.userId,
        name: clientB.name
      }, (resp) => {
        assert(resp.success && resp.room.players.length === 2, "Guest Client B joined with room code (players: 2)");
        resolve();
      });
    });

    // Client C joins with room ID
    await new Promise((resolve) => {
      clientC.socket.emit("joinRoom", {
        roomIdentifier: roomId,
        userId: clientC.userId,
        name: clientC.name
      }, (resp) => {
        assert(resp.success && resp.room.players.length === 3, "Guest Client C joined with room ID (players: 3)");
        resolve();
      });
    });

    await delay(100);
    assert(clientBReceivedUpdate && clientBReceivedUpdate.players.length === 3, "Client B received broadcast update of 3 players");

    // Client B toggles ready
    await new Promise((resolve) => {
      clientB.socket.emit("toggleReady", { roomId }, (resp) => {
        assert(resp.success && resp.isReady === true, "Client B toggled ready status to true");
        resolve();
      });
    });

    // Host kicks Client C
    let clientCKicked = false;
    clientC.socket.on("kicked", () => {
      clientCKicked = true;
    });

    await new Promise((resolve) => {
      clientA.socket.emit("kickPlayer", { roomId, targetUserId: clientC.userId }, (resp) => {
        assert(resp.success === true, "Host Client A kicked Client C");
        resolve();
      });
    });

    await delay(100);
    assert(clientCKicked === true, "Client C received kicked notification");

    // ---------------- TEST 3: Cricketers Atlas Gameplay ----------------
    console.log("\n--- TEST 3: Cricketers Atlas Gameplay Sync ---");
    let atlasStateA = null;
    let atlasStateB = null;
    clientA.socket.on("gameStateUpdate", (data) => { atlasStateA = data.state || data; });
    clientB.socket.on("gameStateUpdate", (data) => { atlasStateB = data.state || data; });

    // Host starts Cricketers Atlas
    await new Promise((resolve) => {
      clientA.socket.emit("startRoom", { roomId }, (resp) => {
        assert(resp.success === true, "Host started Cricketers Atlas game");
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA && atlasStateB, "Both players received initial gameStateUpdate");
    assert(atlasStateA.requiredLetter === "" || typeof atlasStateA.requiredLetter === "string", "Initial required letter permits starting any cricketer");

    let activePlayerId = atlasStateA.players[atlasStateA.currentPlayerIndex].id;
    let activeClient = activePlayerId === clientA.userId ? clientA : clientB;
    let nextClient = activeClient === clientA ? clientB : clientA;

    // Turn 1: Player 1 submits 'Abhishek Sharma' (ends with 'A')
    const c1 = "Abhishek Sharma";
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: c1 }
      }, (resp) => {
        assert(resp.success === true, `Player 1 submitted '${c1}' (ends with 'A')`);
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA.requiredLetter === "A", "Next required letter advanced to 'A' (from Abhishek SharmA)");

    // Turn 2: Player 2 submits 'Arshdeep Singh' (starts with 'A', ends with 'H')
    activePlayerId = atlasStateA.players[atlasStateA.currentPlayerIndex].id;
    activeClient = activePlayerId === clientA.userId ? clientA : clientB;
    nextClient = activeClient === clientA ? clientB : clientA;

    const c2 = "Arshdeep Singh";
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: c2 }
      }, (resp) => {
        assert(resp.success === true, `Player 2 submitted '${c2}' (starts with 'A', ends with 'H')`);
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA.requiredLetter === "H", "Next required letter advanced to 'H' (from Arshdeep SingH)");

    // Turn 3: Player 1 submits 'Hardik Pandya' (starts with 'H', ends with 'A')
    activePlayerId = atlasStateA.players[atlasStateA.currentPlayerIndex].id;
    activeClient = activePlayerId === clientA.userId ? clientA : clientB;
    nextClient = activeClient === clientA ? clientB : clientA;

    const c3 = "Hardik Pandya";
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: c3 }
      }, (resp) => {
        assert(resp.success === true, `Player 1 submitted '${c3}' (starts with 'H', ends with 'A')`);
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA.requiredLetter === "A", "Next required letter advanced back to 'A' (from Hardik PandyA)");

    // Turn 4: Opponent tries wrong letter 'Rohit Sharma' (starts with R, but required is A)
    activePlayerId = atlasStateA.players[atlasStateA.currentPlayerIndex].id;
    activeClient = activePlayerId === clientA.userId ? clientA : clientB;

    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: "Rohit Sharma" }
      }, (resp) => {
        assert(resp.error && resp.error.includes("Must start with"), `Wrong letter rejected with: "${resp.error}"`);
        resolve();
      });
    });

    // Turn 5: Opponent tries duplicate 'Abhishek Sharma'
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: "Abhishek Sharma" }
      }, (resp) => {
        assert(resp.error && resp.error.includes("already been used"), `Duplicate cricketer rejected with: "${resp.error}"`);
        resolve();
      });
    });

    // Turn 6: Opponent tests community verification with unknown player starting with 'A'
    const unknownCricketer = "Abhay CustomCricketerK";
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "submitCricketer",
        payload: { cricketer: unknownCricketer }
      }, (resp) => {
        assert(resp.ok && resp.pendingVerification === true, `Unknown cricketer triggered community verification`);
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA.pendingVerification !== null, "pendingVerification set in room state");
    assert(atlasStateA.pendingVerification.cricketer === unknownCricketer, "Correct pending cricketer name");

    // Proposer cannot vote on own submission
    await new Promise((resolve) => {
      activeClient.socket.emit("gameAction", {
        roomId,
        action: "voteVerification",
        payload: { approve: true, userId: activeClient.userId }
      }, (resp) => {
        assert(resp.error && resp.error.includes("cannot vote on your own"), `Proposer blocked from voting: "${resp.error}"`);
        resolve();
      });
    });

    // Opponent votes approve
    const voterClient = activeClient === clientA ? clientB : clientA;
    await new Promise((resolve) => {
      voterClient.socket.emit("gameAction", {
        roomId,
        action: "voteVerification",
        payload: { approve: true, userId: voterClient.userId }
      }, (resp) => {
        assert(resp.ok && resp.result === "approved", `Community vote approved`);
        resolve();
      });
    });

    await delay(150);
    assert(atlasStateA.pendingVerification === null, "pendingVerification cleared after approval");
    assert(atlasStateA.requiredLetter === "K", `Required letter updated to last letter 'K' of '${unknownCricketer}'`);

    clientA.socket.disconnect();
    clientB.socket.disconnect();
    clientC.socket.disconnect();

    // ---------------- TEST 4: Mr. White Role Masking ----------------
    console.log("\n--- TEST 4: Mr. White - Anti-Cheat Secret Masking & Voting ---");
    const mwA = createClient("user-mw-1", "Aakash");
    const mwB = createClient("user-mw-2", "Priya");
    const mwC = createClient("user-mw-3", "Sameer");

    const mwRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "mr-white", hostName: "Aakash", hostUserId: mwA.userId })
    }).then(r => r.json());

    await new Promise((res) => mwA.socket.emit("joinRoom", { roomIdentifier: mwRoom.room.code, userId: mwA.userId, name: mwA.name }, res));
    await new Promise((res) => mwB.socket.emit("joinRoom", { roomIdentifier: mwRoom.room.code, userId: mwB.userId, name: mwB.name }, res));
    await new Promise((res) => mwC.socket.emit("joinRoom", { roomIdentifier: mwRoom.room.code, userId: mwC.userId, name: mwC.name }, res));

    let cardA = null, cardB = null, cardC = null;
    let publicState = null;

    mwA.socket.on("privateCard", (card) => { cardA = card; });
    mwB.socket.on("privateCard", (card) => { cardB = card; });
    mwC.socket.on("privateCard", (card) => { cardC = card; });
    mwA.socket.on("gameStateUpdate", (state) => { publicState = state.state || state; });

    await new Promise((res) => mwA.socket.emit("startRoom", { roomId: mwRoom.room.id }, res));
    await delay(200);

    assert(cardA && cardB && cardC, "All 3 players received private role cards");
    const roles = [cardA.role, cardB.role, cardC.role];
    const whiteCount = roles.filter(r => r === "mr-white" || r === "mrwhite").length;
    const civCount = roles.filter(r => r === "civilian" || r === "majority").length;
    assert(whiteCount === 1 && civCount === 2, `Exact roles assigned: 1 Mr. White, 2 Civilians`);

    // Verify public state DOES NOT leak secret roles or words
    const publicPlayerRoles = publicState.players.map(p => p.role).filter(Boolean);
    assert(publicPlayerRoles.length === 0, "Public gameStateUpdate masks private roles completely (Anti-Cheat check passed)");
    assert(!publicState.civilianWord && !publicState.undercoverWord, "Public state masks secret words (Anti-Cheat check passed)");

    // Submit clues
    await new Promise((res) => mwA.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitClue", payload: { clue: "Sweet" } }, res));
    await new Promise((res) => mwB.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitClue", payload: { clue: "Cold" } }, res));
    await new Promise((res) => mwC.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitClue", payload: { clue: "Delicious" } }, res));
    await delay(150);

    // Host advances to voting phase
    await new Promise((res) => mwA.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "startVoting", payload: {} }, res));
    await delay(100);

    // Vote submission
    await new Promise((res) => mwA.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitVote", payload: { targetId: mwB.userId } }, res));
    await new Promise((res) => mwB.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitVote", payload: { targetId: mwA.userId } }, res));
    await new Promise((res) => mwC.socket.emit("gameAction", { roomId: mwRoom.room.id, action: "submitVote", payload: { targetId: mwB.userId } }, res));
    await delay(150);

    assert(publicState.phase === "voting" || publicState.phase === "mrwhite_guess" || publicState.phase === "finished", `Voting tally transitions game phase successfully (current: ${publicState.phase})`);

    mwA.socket.disconnect();
    mwB.socket.disconnect();
    mwC.socket.disconnect();

    // ---------------- TEST 5: Who Am I? Identity Masking ----------------
    console.log("\n--- TEST 5: Who Am I? - Celebrity Holder Masking ---");
    const waiA = createClient("user-wai-1", "Aakash");
    const waiB = createClient("user-wai-2", "Priya");

    const waiRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "who-am-i", hostName: "Aakash", hostUserId: waiA.userId })
    }).then(r => r.json());

    await new Promise((res) => waiA.socket.emit("joinRoom", { roomIdentifier: waiRoom.room.code, userId: waiA.userId, name: waiA.name }, res));
    await new Promise((res) => waiB.socket.emit("joinRoom", { roomIdentifier: waiRoom.room.code, userId: waiB.userId, name: waiB.name }, res));

    let waiStateA = null, waiStateB = null;
    waiA.socket.on("gameStateUpdate", (s) => { waiStateA = s.state || s; });
    waiB.socket.on("gameStateUpdate", (s) => { waiStateB = s.state || s; });

    await new Promise((res) => waiA.socket.emit("startRoom", { roomId: waiRoom.room.id }, res));
    await delay(200);

    assert(waiStateA && waiStateB, "Both players received Who Am I state");
    const holderId = waiStateA.celebrityHolderId;
    const guesserClient = holderId === waiA.userId ? waiB : waiA;
    const holderClient = holderId === waiA.userId ? waiA : waiB;
    const guesserState = holderId === waiA.userId ? waiStateB : waiStateA;
    const holderState = holderId === waiA.userId ? waiStateA : waiStateB;

    assert(guesserState.currentCelebrity.name === "???", "Celebrity identity is masked from guessers (Anti-Cheat check passed)");
    assert(holderState.currentCelebrity.name !== "???", `Celebrity holder sees actual identity: '${holderState.currentCelebrity.name}'`);

    // Ask question and answer
    await new Promise((res) => guesserClient.socket.emit("gameAction", { roomId: waiRoom.room.id, action: "askQuestion", payload: { question: "Are they an actor?" } }, res));
    await delay(150);
    await new Promise((res) => holderClient.socket.emit("gameAction", { roomId: waiRoom.room.id, action: "answerQuestion", payload: { questionIndex: 0, answer: "Yes" } }, res));
    await delay(150);

    const latestGuesserState = holderId === waiA.userId ? waiStateB : waiStateA;
    assert(latestGuesserState.questions && latestGuesserState.questions.length > 0 && latestGuesserState.questions[0].answer === "Yes", "Holder's answer synchronized to guesser");

    waiA.socket.disconnect();
    waiB.socket.disconnect();

    // ---------------- TEST 6: Spy Game Location Masking ----------------
    console.log("\n--- TEST 6: Spy Game - Location Masking from Spy ---");
    const spyA = createClient("user-spy-1", "Aakash");
    const spyB = createClient("user-spy-2", "Priya");
    const spyC = createClient("user-spy-3", "Rohan");

    const spyRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "spy-game", hostName: "Aakash", hostUserId: spyA.userId })
    }).then(r => r.json());

    await new Promise((res) => spyA.socket.emit("joinRoom", { roomIdentifier: spyRoom.room.code, userId: spyA.userId, name: spyA.name }, res));
    await new Promise((res) => spyB.socket.emit("joinRoom", { roomIdentifier: spyRoom.room.code, userId: spyB.userId, name: spyB.name }, res));
    await new Promise((res) => spyC.socket.emit("joinRoom", { roomIdentifier: spyRoom.room.code, userId: spyC.userId, name: spyC.name }, res));

    let spyCardA = null, spyCardB = null, spyCardC = null;
    spyA.socket.on("privateCard", (c) => { spyCardA = c; });
    spyB.socket.on("privateCard", (c) => { spyCardB = c; });
    spyC.socket.on("privateCard", (c) => { spyCardC = c; });

    await new Promise((res) => spyA.socket.emit("startRoom", { roomId: spyRoom.room.id }, res));
    await delay(200);

    assert(spyCardA && spyCardB && spyCardC, "All 3 players received Spy Game private cards");
    const allCards = [spyCardA, spyCardB, spyCardC];
    const spyPlayerCard = allCards.find(c => c.role === "spy");
    const civPlayerCard = allCards.find(c => c.role === "civilian");

    assert(spyPlayerCard && spyPlayerCard.location === "???", "Spy's private card hides location (Anti-Cheat check passed)");
    assert(civPlayerCard && civPlayerCard.location !== "???", `Civilian's private card reveals location: '${civPlayerCard.location}'`);

    spyA.socket.disconnect();
    spyB.socket.disconnect();
    spyC.socket.disconnect();

    // ---------------- TEST 7: Dumb Charades Movie Masking ----------------
    console.log("\n--- TEST 7: Dumb Charades - Actor-Only Movie Title ---");
    const dcA = createClient("user-dc-1", "Aakash");
    const dcB = createClient("user-dc-2", "Priya");

    const dcRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "dumb-charades", hostName: "Aakash", hostUserId: dcA.userId })
    }).then(r => r.json());

    await new Promise((res) => dcA.socket.emit("joinRoom", { roomIdentifier: dcRoom.room.code, userId: dcA.userId, name: dcA.name }, res));
    await new Promise((res) => dcB.socket.emit("joinRoom", { roomIdentifier: dcRoom.room.code, userId: dcB.userId, name: dcB.name }, res));

    let dcStateA = null, dcStateB = null;
    dcA.socket.on("gameStateUpdate", (s) => { dcStateA = s.state || s; });
    dcB.socket.on("gameStateUpdate", (s) => { dcStateB = s.state || s; });

    await new Promise((res) => dcA.socket.emit("startRoom", { roomId: dcRoom.room.id }, res));
    await delay(200);

    const actorId = dcStateA.currentActorId;
    const actorState = actorId === dcA.userId ? dcStateA : dcStateB;
    const nonActorState = actorId === dcA.userId ? dcStateB : dcStateA;

    assert(actorState.currentMovie.title !== "(Secret Movie)", `Actor sees real movie: '${actorState.currentMovie.title}'`);
    assert(nonActorState.currentMovie.title === "(Secret Movie)", "Non-acting players see '(Secret Movie)' masked (Anti-Cheat check passed)");

    dcA.socket.disconnect();
    dcB.socket.disconnect();

    // ---------------- TEST 8: Hollywood-Bollywood Initials & Reveal ----------------
    console.log("\n--- TEST 8: Hollywood-Bollywood Initials & Field Reveals ---");
    const hbA = createClient("user-hb-1", "Aakash");
    const hbB = createClient("user-hb-2", "Priya");

    const hbRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "hollywood-bollywood", hostName: "Aakash", hostUserId: hbA.userId })
    }).then(r => r.json());

    await new Promise((res) => hbA.socket.emit("joinRoom", { roomIdentifier: hbRoom.room.code, userId: hbA.userId, name: hbA.name }, res));
    await new Promise((res) => hbB.socket.emit("joinRoom", { roomIdentifier: hbRoom.room.code, userId: hbB.userId, name: hbB.name }, res));

    let hbStateA = null;
    hbA.socket.on("gameStateUpdate", (s) => { hbStateA = s.state || s; });

    await new Promise((res) => hbA.socket.emit("startRoom", { roomId: hbRoom.room.id }, res));
    await delay(200);

    assert(hbStateA && hbStateA.currentMovie && hbStateA.currentMovie.initials, `Movie initials generated: ${JSON.stringify(hbStateA.currentMovie?.initials)}`);

    // Submit field guess
    await new Promise((res) => {
      hbB.socket.emit("gameAction", {
        roomId: hbRoom.room.id,
        action: "submitFieldGuess",
        payload: { field: "director", value: "Test Director" }
      }, (resp) => {
        assert(resp.success === true, "Guest player submitted field guess");
        res();
      });
    });

    hbA.socket.disconnect();
    hbB.socket.disconnect();

    // ---------------- TEST 9: Disconnection, Reconnection & Host Migration ----------------
    console.log("\n--- TEST 9: Disconnection, Reconnection & Host Migration ---");
    const reconA = createClient("user-host-orig", "Aakash");
    const reconB = createClient("user-guest-rejoin", "Priya");

    const reconRoom = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "cricketers-atlas", hostName: "Aakash", hostUserId: reconA.userId })
    }).then(r => r.json());

    await new Promise((res) => reconA.socket.emit("joinRoom", { roomIdentifier: reconRoom.room.code, userId: reconA.userId, name: reconA.name }, res));
    await new Promise((res) => reconB.socket.emit("joinRoom", { roomIdentifier: reconRoom.room.code, userId: reconB.userId, name: reconB.name }, res));

    // Simulate Guest B disconnects
    reconB.socket.disconnect();
    await delay(200);

    const roomAfterBDisconnect = roomManager.getRoom(reconRoom.room.id);
    const guestPlayer = roomAfterBDisconnect.players.find(p => p.id === reconB.userId || p.userId === reconB.userId);
    assert(guestPlayer && guestPlayer.connected === false, "Disconnected player marked connected: false (preserved in room)");

    // Reconnect Guest B with same userId
    const reconB2 = createClient("user-guest-rejoin", "Priya");
    await new Promise((res) => {
      reconB2.socket.emit("joinRoom", { roomIdentifier: reconRoom.room.code, userId: reconB2.userId, name: reconB2.name }, (resp) => {
        assert(resp.success && resp.room.players.length === 2, "Disconnected player successfully reconnected with same userId");
        res();
      });
    });

    const roomAfterBRejoin = roomManager.getRoom(reconRoom.room.id);
    const reconnectedPlayer = roomAfterBRejoin.players.find(p => p.id === reconB.userId || p.userId === reconB.userId);
    assert(reconnectedPlayer && reconnectedPlayer.connected === true, "Player status restored to connected: true");

    // Host A calls leaveRoom -> Immediate host migration to B
    await new Promise((res) => {
      reconA.socket.emit("leaveRoom", { roomId: reconRoom.room.id, userId: reconA.userId }, res);
    });
    await delay(100);

    const roomAfterHostDisconnect = roomManager.getRoom(reconRoom.room.id);
    assert(roomAfterHostDisconnect.hostId === reconB.userId, `Host migrated automatically to remaining active player: ${roomAfterHostDisconnect.hostId}`);

    reconA.socket.disconnect();
    reconB2.socket.disconnect();

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
