// src/socket.ts
import { io, Socket } from "socket.io-client";

export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const custom = window.localStorage?.getItem("addaApiUrl");
      if (custom) return custom.replace(/\/$/, "");
      return "http://localhost:4000";
    }
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "http://localhost:4000";
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
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on("connect", () => {
  console.log("Connected to Apna Adda server with socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection warning:", err.message);
});
