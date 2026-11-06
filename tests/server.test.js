import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp, emptyWorkspace, isSafeHttpUrl } from "../server.js";

let server, dataDirectory, baseUrl;
const password = "test-only-password";
const headers = { "Content-Type": "application/json", "x-app-password": password };
async function request(route, options = {}) { return fetch(`${baseUrl}${route}`, { ...options, headers: { ...headers, ...(options.headers || {}) } }); }

test.before(async () => {
  dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "ytops-test-"));
  server = createApp({ dataFile: path.join(dataDirectory, "workspace.json"), password, openaiApiKey: "" }).listen(0, "127.0.0.1");
  await new Promise(resolve => server.on("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { await new Promise(resolve => server.close(resolve)); await fs.rm(dataDirectory, { recursive: true, force: true }); });

test("health endpoint is password protected and exposes no secret", async () => {
  assert.equal((await fetch(`${baseUrl}/api/health`)).status, 401);
  const response = await request("/api/health");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.passwordProtected, true);
  assert.equal("apiKey" in body, false);
});

test("workspace supports a validated read/write round trip", async () => {
  const workspace = emptyWorkspace();
  workspace.channels.push({ id: "channel-1", name: "Kênh thử nghiệm", niche: "Công nghệ", url: "https://example.com/channel" });
  assert.equal((await request("/api/workspace", { method: "PUT", body: JSON.stringify(workspace) })).status, 200);
  assert.deepEqual((await (await request("/api/workspace")).json()).channels, workspace.channels);
});

test("workspace rejects invalid fields, unsafe URLs, and oversized collections", async () => {
  const invalid = emptyWorkspace(); invalid.channels = {};
  assert.equal((await request("/api/workspace", { method: "PUT", body: JSON.stringify(invalid) })).status, 400);
  const unsafe = emptyWorkspace(); unsafe.channels = [{ id: "1", name: "bad", url: "javascript:alert(1)" }];
  assert.equal((await request("/api/workspace", { method: "PUT", body: JSON.stringify(unsafe) })).status, 400);
  const oversized = emptyWorkspace(); oversized.ideas = Array.from({ length: 501 }, (_, id) => ({ id: String(id) }));
  assert.equal((await request("/api/workspace", { method: "PUT", body: JSON.stringify(oversized) })).status, 400);
});

test("oversized requests and invalid AI input are rejected", async () => {
  assert.equal((await request("/api/ai", { method: "POST", body: JSON.stringify({ task: "script", topic: "x".repeat(50_001) }) })).status, 400);
  assert.equal((await request("/api/ai", { method: "POST", body: JSON.stringify({ task: "unknown" }) })).status, 400);
  assert.equal((await request("/api/workspace", { method: "PUT", body: JSON.stringify({ data: "x".repeat(600_000) }) })).status, 413);
});

test("backup export and restore validate content and preserve the previous workspace", async () => {
  const first = emptyWorkspace(); first.channels.push({ id: "first", name: "Bản gốc", url: "https://example.com/first" });
  await request("/api/workspace", { method: "PUT", body: JSON.stringify(first) });
  const exported = await request("/api/backup"); assert.equal(exported.status, 200);
  const backup = await exported.json();
  const second = emptyWorkspace(); second.channels.push({ id: "second", name: "Bản thay thế", url: "https://example.com/second" });
  assert.equal((await request("/api/restore", { method: "POST", body: JSON.stringify({ workspace: second }) })).status, 200);
  assert.equal((await (await request("/api/workspace")).json()).channels[0].id, "second");
  assert.equal((await request("/api/restore", { method: "POST", body: JSON.stringify({ workspace: { nope: true } }) })).status, 400);
  assert.ok((await fs.readdir(path.join(dataDirectory, "backups"))).length > 0);
  assert.equal(backup.channels[0].id, "first");
});

test("a corrupted workspace is never overwritten or silently reset", async () => {
  const corruptFile = path.join(dataDirectory, "corrupt.json");
  await fs.writeFile(corruptFile, "{ not-json", "utf8");
  const corruptServer = createApp({ dataFile: corruptFile, password: "" }).listen(0, "127.0.0.1");
  await new Promise(resolve => corruptServer.on("listening", resolve));
  assert.equal((await fetch(`http://127.0.0.1:${corruptServer.address().port}/api/workspace`)).status, 503);
  assert.equal(await fs.readFile(corruptFile, "utf8"), "{ not-json");
  await new Promise(resolve => corruptServer.close(resolve));
});

test("only HTTP and HTTPS external links are safe", () => {
  assert.equal(isSafeHttpUrl("https://example.com"), true);
  assert.equal(isSafeHttpUrl("http://example.com"), true);
  assert.equal(isSafeHttpUrl("javascript:alert(1)"), false);
  assert.equal(isSafeHttpUrl("data:text/html,test"), false);
});
