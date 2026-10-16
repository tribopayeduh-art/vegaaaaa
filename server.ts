// @ts-nocheck
process.on("unhandledRejection", (reason) => {
  console.warn("[Process Warning] Unhandled Rejection:", reason?.message || reason);
});

process.on("uncaughtException", (err) => {
  console.warn("[Process Warning] Uncaught Exception:", err?.message || err);
});

import "./server/index.mjs";

