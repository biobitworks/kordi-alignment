'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const canonical=o=>Buffer.from(JSON.stringify(Object.fromEntries(Object.keys(o).sort().map(k=>[k,o[k]])))+'\n','utf8');

test('committed LICENSE provenance reproducibly matches source files',()=>{
  const text=cp.execFileSync(process.execPath,[path.join(root,'scripts/license-proof.cjs'),'--verify'],{encoding:'utf8'});
  assert.match(text,/PASS license proof matches exact source bytes/);
});
test('LICENSE grant and package metadata both explicitly declare MIT',()=>{
  const license=fs.readFileSync(path.join(root,'LICENSE'),'utf8');
  assert.match(license,/^MIT License\n/);
  assert.match(license,/Copyright \(c\) 2026 BioBitWorks contributors/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).license,'MIT');
});
test('Merkle source leaves, inclusion paths and non-signing key are exactly reproducible',()=>{
  const p=JSON.parse(fs.readFileSync(path.join(root,'LICENSE-PROVENANCE.json'),'utf8'));
  assert.equal(p.signing_public_key_id,'NOT_COMPUTED');
  assert.equal(p.signature_verified,'NOT_TESTED');
  assert.equal(p.source_records.length,2);
  for(const record of p.source_records){
    const bytes=fs.readFileSync(path.join(root,record.path));
    assert.equal(record.size_bytes,bytes.length);
    assert.equal(record.sha256,sha(bytes));
    const normalized={path:record.path,size_bytes:record.size_bytes,sha256:record.sha256,git_blob_sha1:record.git_blob_sha1};
    const preimage=Buffer.concat([Buffer.from('LICENSE-EVIDENCE-LEAF-v1\0'),canonical(normalized)]);
    assert.equal(record.leaf_sha256,sha(preimage));
    let node=Buffer.from(record.leaf_sha256,'hex');
    for(const level of record.inclusion_proof){
      const neighbor=Buffer.from(level.neighboring_leaf_sha256,'hex');
      node=Buffer.from(sha(Buffer.concat([
        Buffer.from('LICENSE-EVIDENCE-NODE-v1\0'),
        ...(level.side==='right'?[node,neighbor]:[neighbor,node])
      ])),'hex');
    }
    assert.equal(node.toString('hex'),p.license_root_sha256);
  }
  assert.match(p.license_search_key,/^license:v1:biobitworks\/kordi-alignment:LICENSE@sha256:[a-f0-9]{64}$/);
});
