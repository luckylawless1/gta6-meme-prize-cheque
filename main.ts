// Entry program for the make.fun bounty "Post a GTA 6 meme on X"
// (gta6-meme-x-01), v8 — "THE PRIZE CHEQUE".
//
// The entry itself is a post on X: its first picture is the meme and its
// text carries the pitch and our play code. This program's whole job is to
// hand the post's address to the grader: it reads POST.json at the
// repository root, checks the address is well formed, and copies the file
// into the output directory, where the house picks it up and reads the
// post from X itself. Nothing this program prints is judged.
//
// Dry run, the way the grader runs it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// On success it prints nothing and out/POST.json matches POST.json exactly.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const sourcePath = join(botDir, 'POST.json');

if (!existsSync(sourcePath)) {
  console.error(`POST.json not found in ${botDir}`);
  process.exit(1);
}

// The gate wants one JSON object with a string "url" naming an X post.
// Catch a broken file here, in the open, instead of at the gate.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}
const url = (parsed as { url?: unknown } | null)?.url;
if (typeof parsed !== 'object' || parsed === null || typeof url !== 'string') {
  console.error('POST.json must be an object with a "url" string');
  process.exit(1);
}
if (!/^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url) && !url.includes('<handle>')) {
  console.error(`POST.json url does not look like an X post address: ${url}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, join(outputDir, 'POST.json'));
