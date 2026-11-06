import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../server.js";

let server;

test.before(() => new Promise(resolve => {
  server = app.listen(0, "127.0.0.1", resolve);
}));

test.after(() => new Promise(resolve => server.close(resolve)));

test("health endpoint exposes application status without a secret", async () => {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.ownerMode, "single-user");
  assert.equal("apiKey" in body, false);
});

test("workspace endpoint rejects malformed payloads", async () => {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/workspace`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: "[]"
  });
  assert.equal(response.status, 400);
});

test("AI endpoint rejects unknown tasks before contacting a provider", async () => {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: "unknown" })
  });
  assert.equal(response.status, 400);
});
