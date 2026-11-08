// src/socket.ts
import { io, Socket } from "socket.io-client";

export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const custom = window.localStorage?.getItem("addaApiUrl");
    if (custom) return custom.replace(/\/$/, "");

    const host = window.location.hostname;
    // Local dev: localhost, 127.0.0.1, or local LAN IP (e.g. 192.168.x.x, 10.x.x.x, 172.x.x.x)
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return `http://${host}:4000`;
    }
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "https://apna-adda-backend.onrender.com";
};

export const getUserId = (): string => {
  const existing = localStorage.getItem("addaUserId");
  if (existing) return existing;
  const id = "user-" + Math.random().toString(36).substring(2, 9);
  localStorage.setItem("addaUserId", id);
  return id;
};

export const socket: Socket = io(getApiUrl(), {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on("connect", () => {
  console.log("Connected to Apna Adda server with socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection warning:", err.message);
});
