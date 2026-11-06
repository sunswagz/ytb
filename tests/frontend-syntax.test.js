import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

test("inline frontend JavaScript is syntactically valid and loads the Vietnamese enhancement", async () => {
  const html = await fs.readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new vm.Script(scripts[0]));
  assert.match(html, /<script defer src="\/app\.js\?v=3\.1\.1"><\/script>/);
  const vietnameseUi = await fs.readFile(new URL("../public/app.js", import.meta.url), "utf8");
  for (const label of ["Xưởng nội dung", "Viết kịch bản", "Tiêu đề / chủ đề video", "Khán giả", "Định dạng", "Sao chép"]) {
    assert.match(vietnameseUi, new RegExp(label));
  }
});
