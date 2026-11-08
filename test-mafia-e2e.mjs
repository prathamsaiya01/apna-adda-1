// test-mafia-e2e.mjs
import { io as Client } from "socket.io-client";
import backend from "./apna-adda-backend/index.js";
const MafiaEngine = (await import("./apna-adda-backend/games/mafiaEngine.js")).default;

const { server, roomManager } = backend;
const TEST_PORT = 4056;
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
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log("   APNA ADDA MAFIA MULTIPLAYER E2E TEST SUITE");
  console.log("==================================================\n");

  await new Promise(resolve => {
    server.listen(TEST_PORT, () => {
      console.log(`Test server running on ${SERVER_URL}\n`);
      resolve();
    });
  });

  try {
    // ---------------- TEST 1: Role Distributions 5 to 16 Players ----------------
    console.log("--- TEST 1: Role Configurations for 5 to 16 Players ---");
    const testCounts = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const expectedConfigs = {
      5: { mafia: 1, detective: 1, doctor: 1, villager: 2 },
      6: { mafia: 2, detective: 1, doctor: 1, villager: 2 },
      7: { mafia: 2, detective: 1, doctor: 1, villager: 3 },
      8: { mafia: 2, detective: 1, doctor: 1, villager: 4 },
      9: { mafia: 2, detective: 1, doctor: 1, villager: 5 },
      10: { mafia: 3, detective: 1, doctor: 1, villager: 5 },
      11: { mafia: 3, detective: 1, doctor: 1, villager: 6 },
      12: { mafia: 3, detective: 1, doctor: 1, villager: 7 },
      13: { mafia: 4, detective: 1, doctor: 1, villager: 7 },
      14: { mafia: 4, detective: 1, doctor: 1, villager: 8 },
      15: { mafia: 4, detective: 1, doctor: 1, villager: 9 },
      16: { mafia: 4, detective: 1, doctor: 1, villager: 10 }
    };

    for (const count of testCounts) {
      const mockPlayers = Array.from({ length: count }, (_, i) => ({
        userId: `user-sim-${i}`,
        name: `SimPlayer ${i + 1}`
      }));
      const mockRoom = { _id: `room-cfg-${count}`, players: mockPlayers };
      const engine = new MafiaEngine(mockRoom, { to: () => ({ emit: () => {} }) });
      engine.assignSecretRoles();

      const roles = Array.from(engine.secretRoles.values()).map(s => s.role);
      const mCount = roles.filter(r => r === "mafia").length;
      const detCount = roles.filter(r => r === "detective").length;
      const docCount = roles.filter(r => r === "doctor").length;
      const vCount = roles.filter(r => r === "villager").length;

      const exp = expectedConfigs[count];
      const matches =
        mCount === exp.mafia &&
        detCount === exp.detective &&
        docCount === exp.doctor &&
        vCount === exp.villager;

      assert(
        matches,
        `${count} Players: ${mCount}M / ${detCount}Det / ${docCount}Doc / ${vCount}Vil (Matches official specs)`
      );
    }

    // ---------------- TEST 2: Multi-Client Lobby, Role Reveal & Teammate Visibility ----------------
    console.log("\n--- TEST 2: Lobby Creation, Start & Private Role Cards ---");
    const p1 = createClient("user-p1-host", "Aakash");
    const p2 = createClient("user-p2", "Priya");
    const p3 = createClient("user-p3", "Rohan");
    const p4 = createClient("user-p4", "Sneha");
    const p5 = createClient("user-p5", "Vikram");
    const p6 = createClient("user-p6", "Ananya");
    const allClients = [p1, p2, p3, p4, p5, p6];

    // Create Mafia Room
    const createRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameKey: "Mafia",
        hostName: p1.name,
        hostId: p1.userId,
        maxPlayers: 6
      })
    }).then(r => r.json());

    const roomId = createRes.room.id;
    const roomCode = createRes.room.code;
    assert(createRes.success && roomCode.length === 4, `Created Mafia room with 4-letter code: ${roomCode}`);

    // All 6 join room and mark ready
    for (const client of allClients) {
      await new Promise(res => {
        client.socket.emit(
          "joinRoom",
          { roomIdentifier: roomCode, userId: client.userId, name: client.name },
          resp => {
            res();
          }
        );
      });
      if (client.userId !== p1.userId) {
        await new Promise(res => {
          client.socket.emit("toggleReady", { roomId, userId: client.userId }, res);
        });
      }
    }

    const cardsReceived = new Map();
    let publicGameState = null;

    allClients.forEach(c => {
      c.socket.on("privateCard", card => {
        cardsReceived.set(c.userId, card);
      });
      c.socket.on("gameStateUpdate", state => {
        publicGameState = state.state || state;
      });
    });

    // Host starts Mafia game
    await new Promise(res => {
      p1.socket.emit("startRoom", { roomId }, resp => {
        assert(resp.success === true, "Host successfully started 6-player Mafia game");
        res();
      });
    });

    await delay(250);
    assert(cardsReceived.size === 6, "All 6 players received private role cards");

    // Verify Anti-Cheat: Public state DOES NOT contain roles!
    const publicExposedRoles = publicGameState.players.map(p => p.role).filter(Boolean);
    assert(
      publicExposedRoles.length === 0,
      "Public state strictly masks roles (Anti-Cheat check passed)"
    );

    // Identify roles of each client
    let mafiaClients = [];
    let detectiveClient = null;
    let doctorClient = null;
    let villagerClients = [];

    allClients.forEach(c => {
      const card = cardsReceived.get(c.userId);
      if (card.role === "mafia") mafiaClients.push(c);
      else if (card.role === "detective") detectiveClient = c;
      else if (card.role === "doctor") doctorClient = c;
      else villagerClients.push(c);
    });

    assert(mafiaClients.length === 2, "Assigned exactly 2 Mafia players");
    assert(detectiveClient !== null, "Assigned exactly 1 Detective");
    assert(doctorClient !== null, "Assigned exactly 1 Doctor");
    assert(villagerClients.length === 2, "Assigned exactly 2 Villagers");

    // Check Mafia teammate visibility
    const mafia1Card = cardsReceived.get(mafiaClients[0].userId);
    const mafia2Card = cardsReceived.get(mafiaClients[1].userId);
    assert(
      mafia1Card.teammates && mafia1Card.teammates.some(t => t.userId === mafiaClients[1].userId),
      "Mafia #1 sees teammate Mafia #2"
    );
    assert(
      mafia2Card.teammates && mafia2Card.teammates.some(t => t.userId === mafiaClients[0].userId),
      "Mafia #2 sees teammate Mafia #1"
    );

    // Detective and Doctor should NOT have teammates list
    const detCard = cardsReceived.get(detectiveClient.userId);
    assert(!detCard.teammates, "Detective private card does not leak teammates");

    // ---------------- TEST 3: Night Phase - Mafia Chat Privacy & Actions ----------------
    console.log("\n--- TEST 3: Night Phase, Private Mafia Chat & Secret Actions ---");
    const engine = roomManager.gameEngines.get(roomId);
    // Transition to night phase
    engine.startNightPhase();
    await delay(150);

    assert(publicGameState.phase === "night", "Game transitioned to Night phase");

    // Mafia sends private mafia chat
    let mafiaChatReceivedByMafia = null;
    let mafiaChatReceivedByTown = null;

    mafiaClients[1].socket.on("mafiaChatMessage", msg => {
      mafiaChatReceivedByMafia = msg;
    });
    detectiveClient.socket.on("mafiaChatMessage", msg => {
      mafiaChatReceivedByTown = msg;
    });

    await new Promise(res => {
      mafiaClients[0].socket.emit(
        "gameAction",
        {
          roomId,
          action: "sendMafiaChat",
          payload: { message: "Let us target Sneha tonight!" }
        },
        resp => {
          assert(resp.success === true, "Mafia #1 sent private night mafia chat");
          res();
        }
      );
    });

    await delay(150);
    assert(mafiaChatReceivedByMafia !== null, "Mafia #2 received private mafia chat");
    assert(mafiaChatReceivedByTown === null, "Town member did NOT receive mafia chat (Privacy check passed)");

    // Town member attempts to send night public chat -> rejected!
    await new Promise(res => {
      villagerClients[0].socket.emit(
        "gameAction",
        {
          roomId,
          action: "sendDayChat",
          payload: { message: "Hello anyone awake?" }
        },
        resp => {
          assert(resp.error && resp.error.includes("closed during Night"), "Day chat correctly disabled at Night");
          res();
        }
      );
    });

    // ---------------- TEST 4: Night Actions & Doctor Save ----------------
    console.log("\n--- TEST 4: Night Actions (Mafia Vote, Detective Investigate, Doctor Heal) ---");
    const targetVictim = villagerClients[0];

    // Both Mafia vote for targetVictim
    await new Promise(res => {
      mafiaClients[0].socket.emit(
        "gameAction",
        {
          roomId,
          action: "submitNightAction",
          payload: { targetUserId: targetVictim.userId }
        },
        resp => {
          assert(resp.success === true, "Mafia #1 voted for target");
          res();
        }
      );
    });

    await new Promise(res => {
      mafiaClients[1].socket.emit(
        "gameAction",
        {
          roomId,
          action: "submitNightAction",
          payload: { targetUserId: targetVictim.userId }
        },
        resp => {
          assert(resp.success === true, "Mafia #2 voted for same target");
          res();
        }
      );
    });

    // Detective investigates Mafia #1
    let detectiveInvestResult = null;
    detectiveClient.socket.on("detectiveResult", data => {
      detectiveInvestResult = data;
    });

    await new Promise(res => {
      detectiveClient.socket.emit(
        "gameAction",
        {
          roomId,
          action: "submitNightAction",
          payload: { targetUserId: mafiaClients[0].userId }
        },
        resp => {
          assert(resp.success === true && resp.result === "Mafia", "Detective investigated Mafia #1 -> correctly returned 'Mafia'");
          res();
        }
      );
    });

    await delay(100);
    assert(detectiveInvestResult && detectiveInvestResult.result === "Mafia", "Detective received private socket event 'detectiveResult: Mafia'");

    // Doctor protects the victim! (Doctor Save)
    await new Promise(res => {
      doctorClient.socket.emit(
        "gameAction",
        {
          roomId,
          action: "submitNightAction",
          payload: { targetUserId: targetVictim.userId }
        },
        resp => {
          assert(resp.success === true, "Doctor protected the victim");
          res();
        }
      );
    });

    await delay(250);
    // Night should automatically resolve because all special roles acted
    assert(
      publicGameState.phase === "night_resolution" ||
      publicGameState.phase === "day_announcement" ||
      publicGameState.phase === "discussion",
      "Night auto-resolved after all night actors submitted"
    );

    assert(publicGameState.eliminatedLastNight === null, "Doctor protection saved the victim (Nobody died tonight)");

    // ---------------- TEST 5: Day Discussion Chat & Voting Tie Revote ----------------
    console.log("\n--- TEST 5: Day Discussion Chat & Voting Tie Revote ---");
    engine.startDiscussionPhase();
    await delay(150);
    assert(publicGameState.phase === "discussion", "Day Discussion phase active");

    let dayChatReceived = null;
    mafiaClients[0].socket.on("dayChatMessage", msg => {
      dayChatReceived = msg;
    });

    // Villager sends day chat
    await new Promise(res => {
      villagerClients[0].socket.emit(
        "gameAction",
        {
          roomId,
          action: "sendDayChat",
          payload: { message: "Detective, did you find any Mafia last night?" }
        },
        resp => {
          assert(resp.success === true, "Day chat message sent successfully");
          res();
        }
      );
    });

    await delay(100);
    assert(dayChatReceived && dayChatReceived.message.includes("Detective"), "Day chat synchronized across all players");

    // Start voting phase
    engine.startVotingPhase(false);
    await delay(150);
    assert(publicGameState.phase === "voting", "Voting phase is open");

    // Intentionally create a TIE:
    // 3 players vote for Mafia #1, 3 players vote for Mafia #2
    // Ensure no player votes for themselves!
    const m1Client = mafiaClients[0];
    const m2Client = mafiaClients[1];
    const otherClients = allClients.filter(c => c.userId !== m1Client.userId && c.userId !== m2Client.userId);

    // Votes for m1: m2 + other0 + other1
    await new Promise(res => m2Client.socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => otherClients[0].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => otherClients[1].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));

    // Votes for m2: m1 + other2 + other3
    await new Promise(res => m1Client.socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m2Client.userId } }, res));
    await new Promise(res => otherClients[2].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m2Client.userId } }, res));
    await new Promise(res => otherClients[3].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m2Client.userId } }, res));

    await delay(250);
    // Since it's a tie, revote phase should be triggered!
    assert(
      publicGameState.phase === "revote" || engine.state.phase === "revote",
      "Tie detected! Engine initiated 'revote' phase among tied candidates"
    );
    assert(
      engine.revoteCandidates.includes(m1Client.userId) && engine.revoteCandidates.includes(m2Client.userId),
      "Revote candidates correctly limited to the tied suspects"
    );

    // ---------------- TEST 6: Decisive Elimination & Town Victory ----------------
    console.log("\n--- TEST 6: Decisive Vote & Elimination ---");
    // In revote, majority votes for Mafia #1 (4 votes vs 2 votes)
    await new Promise(res => m2Client.socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => otherClients[0].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => otherClients[1].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => otherClients[2].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m1Client.userId } }, res));
    await new Promise(res => m1Client.socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m2Client.userId } }, res));
    await new Promise(res => otherClients[3].socket.emit("gameAction", { roomId, action: "submitVote", payload: { targetUserId: m2Client.userId } }, res));

    await delay(250);
    assert(
      publicGameState.eliminatedLastVote && publicGameState.eliminatedLastVote.userId === m1Client.userId,
      `Mafia #1 was eliminated by majority vote (Role: ${publicGameState.eliminatedLastVote?.role})`
    );

    const m1Secret = engine.secretRoles.get(m1Client.userId);
    assert(m1Secret.isAlive === false, "Server authoritatively marked Mafia #1 as dead");

    // Eliminated player attempts to vote -> rejected!
    await new Promise(res => {
      m1Client.socket.emit(
        "gameAction",
        {
          roomId,
          action: "submitVote",
          payload: { targetUserId: m2Client.userId }
        },
        resp => {
          assert(resp.error && resp.error.includes("Eliminated"), "Eliminated player correctly prevented from voting");
          res();
        }
      );
    });

    // ---------------- TEST 7: Win Conditions (Town Victory vs Mafia Victory) ----------------
    console.log("\n--- TEST 7: Win Condition Checks ---");
    // Eliminate the last remaining Mafia (Mafia #2)
    engine.secretRoles.get(m2Client.userId).isAlive = false;
    const townWin = engine.checkWinConditions();
    assert(townWin && townWin.team === "town", "Town Victory correctly triggered when all Mafia eliminated");

    // Test Mafia Victory condition (living Mafia >= living Town)
    engine.secretRoles.get(m1Client.userId).isAlive = true;
    engine.secretRoles.get(m2Client.userId).isAlive = true;
    // Set living town to 2 (2 Mafia vs 2 Town)
    villagerClients.forEach(v => {
      engine.secretRoles.get(v.userId).isAlive = false;
    });
    doctorClient && (engine.secretRoles.get(doctorClient.userId).isAlive = false);

    const mafiaWin = engine.checkWinConditions();
    assert(mafiaWin && mafiaWin.team === "mafia", "Mafia Victory correctly triggered when Mafia >= Town (2 Mafia vs 1 Town)");

    // ---------------- TEST 8: Reconnection Handling ----------------
    console.log("\n--- TEST 8: Reconnection with Persistent Identity & Role ---");
    // Disconnect Detective
    detectiveClient.socket.disconnect();
    await delay(150);

    const roomData = roomManager.getRoom(roomId);
    const detInRoom = roomData.players.find(p => p.userId === detectiveClient.userId);
    assert(detInRoom && detInRoom.connected === false, "Detective marked connected: false upon disconnect");

    // Reconnect Detective with same userId
    const detectiveReconnect = createClient(detectiveClient.userId, detectiveClient.name);
    let reconnectedPrivateCard = null;
    detectiveReconnect.socket.on("privateCard", c => {
      reconnectedPrivateCard = c;
    });

    await new Promise(res => {
      detectiveReconnect.socket.emit(
        "joinRoom",
        { roomIdentifier: roomCode, userId: detectiveReconnect.userId, name: detectiveReconnect.name },
        resp => {
          assert(resp.success === true, "Detective successfully reconnected with same userId");
          res();
        }
      );
    });

    await delay(150);
    const roleRestored = engine.secretRoles.get(detectiveClient.userId).role;
    assert(roleRestored === "detective", "Detective role authoritatively preserved upon reconnection");

    // Clean up sockets
    allClients.forEach(c => c.socket.disconnect());
    detectiveReconnect.socket.disconnect();

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
