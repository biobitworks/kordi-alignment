'use strict';
/* Offline JSONL bridge: one request per line; no network or shell execution. */
const { assess } = require('../src/core.cjs');
const readline = require('node:readline');

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', line => {
  try {
    const input = JSON.parse(line);
    process.stdout.write(JSON.stringify({ ok: true, result: assess(input) }) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({
      ok: false, error: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Non-error rejection',
    }) + '\n');
  }
});
