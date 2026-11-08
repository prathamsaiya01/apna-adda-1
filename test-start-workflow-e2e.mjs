// test-start-workflow-e2e.mjs
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
    throw new Error(`Test failed: ${testName}`);
  }
}

function createClientSocket() {
  return io(SERVER_URL, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
  });
}

function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   APNA ADDA MULTIPLAYER START WORKFLOW & GAME AUDIT");
  console.log("=======================================================\n");

  // ---------------------------------------------------------
  // TEST SUITE 1: REST & CATALOG AUDIT
  // ---------------------------------------------------------
  console.log("SUITE 1: Catalog & REST Room Creation");
  const catRes = await fetch(`${SERVER_URL}/api/games/catalog`);
  const catalog = await catRes.json();
  assert(Array.isArray(catalog) && catalog.length >= 7, "API returns catalog with all 7 party games");

  const mafiaMeta = catalog.find(g => g.id === "mafia");
  assert(mafiaMeta && mafiaMeta.minPlayers === 5 && mafiaMeta.maxPlayers === 16, "Mafia catalog specifies 5-16 players");

  // ---------------------------------------------------------
  // TEST SUITE 2: MAFIA EXACT PLAYER COUNT VALIDATION (5 to 16)
  // ---------------------------------------------------------
  console.log("\nSUITE 2: Mafia Start Validation (5 to 16 Players)");

  // 2A: 5-Player Mafia with 2 players (Blocked)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 5, hostId: "host-m5", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-m5", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "Player 2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    // Try start with 2/5 players
    const startRes = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-m5" }, r));
    assert(startRes && startRes.error && startRes.error.includes("5 players"), "5-player Mafia with 2 players cannot start");

    s1.disconnect();
    s2.disconnect();
  }

  // 2B: 5-Player Mafia with 4 players (Blocked)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 5, hostId: "host-m5-4", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 4; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m5-4" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) {
        await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
      }
    }

    const startRes = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m5-4" }, r));
    assert(startRes && startRes.error && startRes.error.includes("Waiting for 1 more player"), "5-player Mafia with 4 players cannot start (waiting for 1 more)");

    sockets.forEach(s => s.disconnect());
  }

  // 2C: 5-Player Mafia with 5 players (Can Start!)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 5, hostId: "host-m5-ok", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 5; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m5-ok" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) {
        await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
      }
    }

    const startRes = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m5-ok" }, r));
    assert(startRes && startRes.ok && startRes.success, "5-player Mafia with 5 players starts successfully!");

    sockets.forEach(s => s.disconnect());
  }

  // 2D: 6-Player Mafia with 2 players (Blocked)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 6, hostId: "host-m6", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-m6", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "Player 2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const startRes = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-m6" }, r));
    assert(startRes && startRes.error && startRes.error.includes("Waiting for 4 more players"), "6-player Mafia with 2 players cannot start (waiting for 4 more)");

    s1.disconnect();
    s2.disconnect();
  }

  // 2E: 6-Player Mafia with 5 players (Blocked)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 6, hostId: "host-m6-5", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 5; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m6-5" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
    }

    const startRes = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m6-5" }, r));
    assert(startRes && startRes.error && startRes.error.includes("Waiting for 1 more player"), "6-player Mafia with 5 players cannot start");

    sockets.forEach(s => s.disconnect());
  }

  // 2F: 6-Player Mafia with 6 players (Can Start!)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 6, hostId: "host-m6-ok", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 6; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m6-ok" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
    }

    const startRes = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m6-ok" }, r));
    assert(startRes && startRes.ok && startRes.success, "6-player Mafia with 6 players starts successfully!");

    sockets.forEach(s => s.disconnect());
  }

  // 2G: 8-Player Mafia with 7 players (Blocked) vs 8 players (Can Start!)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 8, hostId: "host-m8", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 7; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m8" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
    }

    const res7 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m8" }, r));
    assert(res7 && res7.error && res7.error.includes("Waiting for 1 more player"), "8-player Mafia with 7 players cannot start");

    // Add 8th player
    const s8 = createClientSocket();
    sockets.push(s8);
    await new Promise(r => s8.emit("joinRoom", { roomId: room._id, userId: "u8", name: "Player 8" }, r));
    await new Promise(r => s8.emit("toggleReady", { roomId: room._id, userId: "u8" }, r));

    const res8 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m8" }, r));
    assert(res8 && res8.ok && res8.success, "8-player Mafia with 8 players starts successfully!");

    sockets.forEach(s => s.disconnect());
  }

  // 2H: 10-Player Mafia with 9 players (Blocked) vs 10 players (Can Start!)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 10, hostId: "host-m10", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 9; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m10" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
    }

    const res9 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m10" }, r));
    assert(res9 && res9.error && res9.error.includes("Waiting for 1 more player"), "10-player Mafia with 9 players cannot start");

    const s10 = createClientSocket();
    sockets.push(s10);
    await new Promise(r => s10.emit("joinRoom", { roomId: room._id, userId: "u10", name: "Player 10" }, r));
    await new Promise(r => s10.emit("toggleReady", { roomId: room._id, userId: "u10" }, r));

    const res10 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m10" }, r));
    assert(res10 && res10.ok && res10.success, "10-player Mafia with 10 players starts successfully!");

    sockets.forEach(s => s.disconnect());
  }

  // 2I: 16-Player Mafia with 15 players (Blocked) vs 16 players (Can Start!)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "Mafia", maxPlayers: 16, hostId: "host-m16", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sockets = [];
    for (let i = 1; i <= 15; i++) {
      const s = createClientSocket();
      sockets.push(s);
      const uid = i === 1 ? "host-m16" : `u${i}`;
      await new Promise(r => s.emit("joinRoom", { roomId: room._id, userId: uid, name: `Player ${i}` }, r));
      if (i > 1) await new Promise(r => s.emit("toggleReady", { roomId: room._id, userId: uid }, r));
    }

    const res15 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m16" }, r));
    assert(res15 && res15.error && res15.error.includes("Waiting for 1 more player"), "16-player Mafia with 15 players cannot start");

    const s16 = createClientSocket();
    sockets.push(s16);
    await new Promise(r => s16.emit("joinRoom", { roomId: room._id, userId: "u16", name: "Player 16" }, r));
    await new Promise(r => s16.emit("toggleReady", { roomId: room._id, userId: "u16" }, r));

    const res16 = await new Promise(r => sockets[0].emit("startRoom", { roomId: room._id, userId: "host-m16" }, r));
    assert(res16 && res16.ok && res16.success, "16-player Mafia with 16 players starts successfully!");

    sockets.forEach(s => s.disconnect());
  }

  // ---------------------------------------------------------
  // TEST SUITE 3: SECURITY & PERMISSION VALIDATION
  // ---------------------------------------------------------
  console.log("\nSUITE 3: Security & Host Permissions");
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "CricketersAtlas", maxPlayers: 4, hostId: "host-sec", hostName: "Host" })
    });
    const room = await hostRes.json();
    const sHost = createClientSocket();
    const sGuest = createClientSocket();

    await new Promise(r => sHost.emit("joinRoom", { roomId: room._id, userId: "host-sec", name: "Host" }, r));
    await new Promise(r => sGuest.emit("joinRoom", { roomId: room._id, userId: "guest-sec", name: "Guest" }, r));
    await new Promise(r => sGuest.emit("toggleReady", { roomId: room._id, userId: "guest-sec" }, r));

    // Non-host attempts to start
    const nonHostRes = await new Promise(r => sGuest.emit("startRoom", { roomId: room._id, userId: "guest-sec" }, r));
    assert(nonHostRes && nonHostRes.error && nonHostRes.error.includes("host"), "Non-host player cannot start the game");

    // Concurrent duplicate clicks from host (Atomic start lock)
    const [click1, click2] = await Promise.all([
      new Promise(r => sHost.emit("startRoom", { roomId: room._id, userId: "host-sec" }, r)),
      new Promise(r => sHost.emit("startRoom", { roomId: room._id, userId: "host-sec" }, r))
    ]);

    const oneSucceeded = (click1.ok && !click2.ok) || (!click1.ok && click2.ok);
    assert(oneSucceeded, "Concurrent start requests: exactly ONE request succeeds; second is rejected atomically");

    sHost.disconnect();
    sGuest.disconnect();
  }

  // ---------------------------------------------------------
  // TEST SUITE 4: ALL 6 OTHER EXISTING GAMES START & SYNC
  // ---------------------------------------------------------
  console.log("\nSUITE 4: All Other Existing Games Audit");

  // 4A: Mr. White (min 3 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "MrWhite", maxPlayers: 6, hostId: "host-mw", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-mw", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res2 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-mw" }, r));
    assert(res2 && res2.error && res2.error.includes("at least 3 players"), "Mr. White with 2 players cannot start (min 3 required)");

    const s3 = createClientSocket();
    await new Promise(r => s3.emit("joinRoom", { roomId: room._id, userId: "u3", name: "P3" }, r));
    await new Promise(r => s3.emit("toggleReady", { roomId: room._id, userId: "u3" }, r));

    const res3 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-mw" }, r));
    assert(res3 && res3.ok, "Mr. White with 3 players starts successfully!");

    s1.disconnect();
    s2.disconnect();
    s3.disconnect();
  }

  // 4B: Spy Game (min 3 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "SpyGame", maxPlayers: 6, hostId: "host-spy", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-spy", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res2 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-spy" }, r));
    assert(res2 && res2.error && res2.error.includes("at least 3 players"), "Spy Game with 2 players cannot start (min 3 required)");

    const s3 = createClientSocket();
    await new Promise(r => s3.emit("joinRoom", { roomId: room._id, userId: "u3", name: "P3" }, r));
    await new Promise(r => s3.emit("toggleReady", { roomId: room._id, userId: "u3" }, r));

    const res3 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-spy" }, r));
    assert(res3 && res3.ok, "Spy Game with 3 players starts successfully!");

    s1.disconnect();
    s2.disconnect();
    s3.disconnect();
  }

  // 4C: Cricketers Atlas (min 2 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "CricketersAtlas", maxPlayers: 4, hostId: "host-ca", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-ca", name: "Host" }, r));
    const res1 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-ca" }, r));
    assert(res1 && res1.error && res1.error.includes("at least 2 players"), "Cricketers Atlas with 1 player cannot start");

    const s2 = createClientSocket();
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res2 = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-ca" }, r));
    assert(res2 && res2.ok, "Cricketers Atlas with 2 players starts successfully!");

    s1.disconnect();
    s2.disconnect();
  }

  // 4D: Dumb Charades (min 2 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "DumbCharades", maxPlayers: 6, hostId: "host-dc", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-dc", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-dc" }, r));
    assert(res && res.ok, "Dumb Charades with 2 ready players starts successfully!");

    s1.disconnect();
    s2.disconnect();
  }

  // 4E: Hollywood-Bollywood (min 2 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "HollywoodBollywoodGame", maxPlayers: 6, hostId: "host-hb", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-hb", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-hb" }, r));
    assert(res && res.ok, "Hollywood-Bollywood with 2 ready players starts successfully!");

    s1.disconnect();
    s2.disconnect();
  }

  // 4F: Who Am I? (min 2 players required)
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "WhoAmI", maxPlayers: 6, hostId: "host-wai", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-wai", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    const res = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-wai" }, r));
    assert(res && res.ok, "Who Am I? with 2 ready players starts successfully!");

    s1.disconnect();
    s2.disconnect();
  }

  // ---------------------------------------------------------
  // TEST SUITE 5: READY STATUS & DISCONNECTION AUDIT
  // ---------------------------------------------------------
  console.log("\nSUITE 5: Ready Status & Reconnection Handling");
  {
    const hostRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "CricketersAtlas", maxPlayers: 4, hostId: "host-rdy", hostName: "Host" })
    });
    const room = await hostRes.json();
    const s1 = createClientSocket();
    const s2 = createClientSocket();

    await new Promise(r => s1.emit("joinRoom", { roomId: room._id, userId: "host-rdy", name: "Host" }, r));
    await new Promise(r => s2.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));

    // Try start when P2 is NOT ready
    const notReadyRes = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-rdy" }, r));
    assert(notReadyRes && notReadyRes.error && notReadyRes.error.includes("Ready"), "Host cannot start if non-host players are not marked as Ready");

    // P2 marks Ready
    await new Promise(r => s2.emit("toggleReady", { roomId: room._id, userId: "u2" }, r));

    // Simulate P2 temporary socket disconnect
    s2.disconnect();
    await waitFor(100);

    // Host tries to start while P2 is disconnected
    const disconnRes = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-rdy" }, r));
    assert(disconnRes && disconnRes.error && disconnRes.error.includes("disconnected"), "Host cannot start while a player is disconnected");

    // P2 reconnects with same userId
    const s2Reconn = createClientSocket();
    const reconnJoin = await new Promise(r => s2Reconn.emit("joinRoom", { roomId: room._id, userId: "u2", name: "P2" }, r));
    assert(reconnJoin && reconnJoin.ok, "Disconnected player reconnected successfully without losing identity");

    // P2 reconnected with isReady preserved
    assert(reconnJoin?.room?.players?.find(p => p.userId === "u2")?.isReady, "Player isReady status was preserved across reconnection");
    const finalStart = await new Promise(r => s1.emit("startRoom", { roomId: room._id, userId: "host-rdy" }, r));
    assert(finalStart && finalStart.ok, "Game starts cleanly after player reconnects");

    s1.disconnect();
    s2Reconn.disconnect();
  }

  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("FATAL ERROR in test execution:", err);
  process.exit(1);
});
