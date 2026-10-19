// 抽出 zh-TW/src 底下所有 js / jsx / ts / tsx 程式碼區塊，用 esbuild 檢查語法。
// 只檢查語法，不檢查型別。片段或故意寫錯的範例加上 ignore，例如 ```jsx,ignore
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { transform } from "esbuild";

const LOADERS = { js: "js", mjs: "js", jsx: "jsx", ts: "ts", tsx: "tsx" };
const ROOT = new URL("../zh-TW/src/", import.meta.url).pathname;

async function* markdownFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(path);
    else if (entry.name.endsWith(".md")) yield path;
  }
}

function* codeBlocks(markdown) {
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^```(\S*)/);
    if (!open) continue;
    const [lang, ...attrs] = open[1].split(",");
    const start = i;
    const body = [];
    while (++i < lines.length && !lines[i].startsWith("```")) body.push(lines[i]);
    if (attrs.includes("ignore") || !LOADERS[lang]) continue;
    yield { line: start + 1, loader: LOADERS[lang], code: body.join("\n") };
  }
}

let checked = 0;
let failed = 0;
for await (const file of markdownFiles(ROOT)) {
  const relative = file.slice(ROOT.length);
  for (const block of codeBlocks(await readFile(file, "utf8"))) {
    checked++;
    try {
      await transform(block.code, { loader: block.loader, logLevel: "silent" });
    } catch (error) {
      failed++;
      for (const { text, location } of error.errors) {
        const line = location ? block.line + location.line : block.line;
        console.error(`${relative}:${line}: ${text}`);
      }
    }
  }
}

console.log(`checked ${checked} code blocks, ${failed} failed`);
process.exit(failed ? 1 : 0);
