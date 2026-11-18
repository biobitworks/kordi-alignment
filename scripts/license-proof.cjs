#!/usr/bin/env node
'use strict';
/**
 * Deterministic searchable license checkpoint.
 * Recomputes exact bytes from LICENSE and package.json, with domain-separated
 * Merkle leaves. No keypair is created, used, or implied.
 * A hash verifies artifact identity, not license ownership or legal clearance.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REPO = path.resolve(__dirname, '..');
const REPO_NAME = 'biobitworks/kordi-alignment';
const PREDECESSOR = '1b59e71b8d699cc57e5d90b540c3f85aa6c1b6c9';
const OUT = path.join(REPO, 'LICENSE-PROVENANCE.json');

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}
function sortedCopy(value) {
  if (Array.isArray(value)) return value.map(sortedCopy);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortedCopy(value[key])]));
  }
  return value;
}
function canonicalBytes(record) {
  return Buffer.from(JSON.stringify(sortedCopy(record)) + '\n', 'utf8');
}
function recordFor(name) {
  const bytes = fs.readFileSync(path.join(REPO, name));
  const header = Buffer.from('blob ' + bytes.length + '\0', 'ascii');
  return {
    path: name,
    size_bytes: bytes.length,
    sha256: sha256(bytes),
    git_blob_sha1: crypto.createHash('sha1').update(header).update(bytes).digest('hex')
  };
}
function data() {
  const license = fs.readFileSync(path.join(REPO, 'LICENSE'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
  if (!license.startsWith('MIT License\n') ||
      !license.includes('Copyright (c) 2026 BioBitWorks contributors') ||
      !license.includes('The above copyright notice and this permission notice')) {
    throw new Error('LICENSE is not the expected explicit MIT declaration');
  }
  if (pkg.license !== 'MIT') throw new Error('package.json license differs from MIT LICENSE');
  const files = ['LICENSE', 'package.json'].map(recordFor);
  const hashes = files.map(record => sha256(Buffer.concat([
    Buffer.from('LICENSE-EVIDENCE-LEAF-v1\0', 'ascii'), canonicalBytes(record)
  ])));
  const root = sha256(Buffer.concat([
    Buffer.from('LICENSE-EVIDENCE-NODE-v1\0', 'ascii'),
    Buffer.from(hashes[0], 'hex'),
    Buffer.from(hashes[1], 'hex')
  ]));
  const withProof = files.map((file, i) => ({
    ...file, leaf_sha256: hashes[i],
    inclusion_proof: [{
      side: i === 0 ? 'right' : 'left',
      neighboring_leaf_sha256: hashes[1 - i]
    }]
  }));
  return {
    schema: 'biobitworks-searchable-license-evidence-v1',
    status: 'EXECUTED_AND_RECOMPUTABLE',
    repository: REPO_NAME,
    predecessor_main_commit_sha: PREDECESSOR,
    license_expression_declared: 'MIT',
    license_copyright_exact: 'Copyright (c) 2026 BioBitWorks contributors',
    license_file_path: 'LICENSE',
    license_search_key: 'license:v1:' + REPO_NAME + ':LICENSE@sha256:' + files[0].sha256,
    license_file_sha256: files[0].sha256,
    license_root_sha256: root,
    merkle_algorithm: 'SHA-256',
    merkle_arity: 2,
    source_record_encoding: 'newline-terminated UTF-8 compact sorted-key JSON',
    leaf_preimage: 'ASCII LICENSE-EVIDENCE-LEAF-v1, NUL byte, source_record_encoding',
    node_preimage: 'ASCII LICENSE-EVIDENCE-NODE-v1, NUL byte, 32-byte left hash, 32-byte right hash',
    source_records: withProof,
    portfolio_private_checkpoint: 'LOCAL_ONLY_NOT_PUBLISHED',
    contents_not_explicitly_covered_by_this_license: 'NOT_CLASSIFIED',
    signing_public_key_id: 'NOT_COMPUTED',
    signature_verified: 'NOT_TESTED',
    third_party_license_clearance: 'NOT_TESTED',
    legal_conclusion: 'DECLARATIONS_CONSISTENT__OWNERSHIP_AND_NESTED_LICENSES_NOT_TESTED',
    caveat: 'Hashes prove identity and inclusion of the observed declarations, not copyright title, license compatibility, or legal compliance'
  };
}
function main() {
  const method = process.argv[2];
  if (!['--write', '--verify'].includes(method)) {
    throw new Error('Usage: node scripts/license-proof.cjs --write | --verify');
  }
  const bytes = Buffer.from(JSON.stringify(data(), null, 2) + '\n', 'utf8');
  if (method === '--write') {
    fs.writeFileSync(OUT, bytes);
    process.stdout.write('WROTE LICENSE-PROVENANCE.json sha256=' + sha256(bytes) + '\n');
  } else {
    const current = fs.readFileSync(OUT);
    if (!current.equals(bytes)) throw new Error('STALE LICENSE-PROVENANCE.json: run --write after reviewed changes');
    process.stdout.write('PASS license proof matches exact source bytes sha256=' + sha256(current) + '\n');
  }
}
try { main(); } catch (err) { process.stderr.write('FAIL license proof: ' + err.message + '\n'); process.exitCode = 1; }
