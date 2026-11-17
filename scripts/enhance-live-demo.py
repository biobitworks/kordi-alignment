#!/usr/bin/env python3
"""Enhance the Studio fallback public preview without touching upstream Kordi."""
from pathlib import Path
from html import escape
root=Path(__file__).resolve().parents[1]
index=root/'web/index.html'
s=index.read_text()
assert 'id="demo-showcase"' not in s
s=s.replace('<a href="#matrix">Nine alignments</a>','<a href="#matrix">Nine alignments</a><a href="#demo-showcase">Agent / Skill / Tool / Plugin</a><a href="./quest">12-scenario Quest</a>',1)
section='''<section id="demo-showcase" class="lower">
<div class="eyebrow">05 / DEMONSTRATION KIT</div>
<h2>Research Alignment Quest: four independent lanes</h2>
<p class="muted">Open the full research game to see and copy the <strong>agent instruction prompt, skill prompt, tool invocation payload, and plugin source/integration steps</strong>. All four remain optional and require explicit authorization for installation.</p>
<div class="demo-cta"><a href="./quest" class="demo-start">Launch Quest and copy all four prompts</a><span>12 scenarios · local deterministic matching · synthetic example team · no backend</span></div>
<div class="claims">
<article><b>AGENT</b><p>Opt-in room matchmaker instructions; no automatic agent installation.</p></article>
<article><b>SKILL</b><p>Reviewable Kordi skill instructions, not a human-assessment policy.</p></article>
<article><b>TOOL</b><p>Explicit 12-choice payload for deterministic score generation.</p></article>
<article><b>PLUGIN</b><p>Source-linked extension and local install steps for an authorized developer.</p></article></div>
</section>
<section id="release-evidence" class="lower">
<div class="eyebrow">06 / SUBMISSION EVIDENCE</div><h2>GitHub PRs and release scope</h2>
<p class="muted">States independently checked 16 November 2026; links open the live record. A submitted PR is not automatically a merged PR.</p>
<table class="demo-prs"><thead><tr><th>PR</th><th>Lane</th><th>State</th></tr></thead><tbody>
<tr><td><a href="https://github.com/biobitworks/kordi-alignment/pull/1">#1</a></td><td>Tool red-team</td><td>OPEN · review pending</td></tr>
<tr><td><a href="https://github.com/biobitworks/kordi-alignment/pull/7">#7</a></td><td>Team review</td><td>OPEN · review pending</td></tr>
<tr><td><a href="https://github.com/biobitworks/kordi-alignment/pull/8">#8</a></td><td>GSD metaprompt design</td><td>OPEN · review pending</td></tr>
<tr><td><a href="https://github.com/biobitworks/kordi-alignment/pull/9">#9</a></td><td>Compass preview</td><td>MERGED</td></tr>
</tbody></table>
<p class="muted">Website checks do not establish native signed-in Kordi runtime compatibility. No participant or research datasets are included.</p>
</section>'''
s=s.replace('<footer>',section+'<footer>',1)
index.write_text(s)
css=root/'web/style.css'
css.write_text(css.read_text()+'''
/* Public demo additions */
.demo-cta{display:flex;flex-wrap:wrap;align-items:center;gap:14px;padding:20px;margin:20px 0;border-radius:14px;border:1px solid #779e9a;background:rgba(56,143,137,.08)}
.demo-cta .demo-start{padding:12px 18px;border-radius:8px;background:#0b6f72;color:#fff;font-weight:700;text-decoration:none}
.demo-cta .demo-start:hover{background:#09565a}
.demo-prs{border-collapse:collapse;width:100%;margin:16px 0 26px}
.demo-prs th,.demo-prs td{padding:10px 12px;text-align:left;border-bottom:1px solid #8ba1a144}
.demo-prs a{color:#288e91}
@media(max-width:680px){.demo-prs th,.demo-prs td{font-size:.78rem;padding:7px 3px}}
''')
quest=root/'web/quest.html'
q=quest.read_text()
assert 'id="consent-card"' not in q
q=q.replace('<div class="row"><button class="primary" id="copy-card"', '''<label class="consent" for="consent-card"><input id="consent-card" type="checkbox"> I authorize copying my self-reported card for a chosen chat; I will verify its recipients.</label>
<div class="row"><button class="primary" id="copy-card" disabled''',1)
q=q.replace('<button class="soft" id="reset"', '<button class="soft" id="download-receipt" type="button" disabled>Download local SHA-256 receipt</button><button class="soft" id="reset"',1)
q=q.replace('<div class="row"><button class="primary" id="run-match"', '''<label class="consent" for="consent-compare"><input id="consent-compare" type="checkbox"> I have permission to compare these voluntarily shared cards locally.</label>
<div class="row"><button class="primary" id="run-match" disabled''',1)
q=q.replace('<button class="soft" id="example-match"', '<button class="soft" id="example-match" disabled',1)
q=q.replace('<button class="soft" id="copy-match"', '<button class="soft" id="copy-match" disabled',1)
q=q.replace('href="./alignment.html"','href="./index.html"')
# Make it obvious this is not a live native agent installation.
q=q.replace('<section class="hero">', '<section class="hero"><p><a href="./index.html">Back to Decision Compass</a> · <a href="#kit">Jump to copyable Agent / Skill / Tool / Plugin kit</a></p>',1)
quest.write_text(q)
css=root/'web/quest.css'
css.write_text(css.read_text()+'''
.consent{display:flex;gap:9px;align-items:flex-start;font-weight:600;padding:12px;border:1px solid #8aa29e;border-radius:8px;margin:12px 0}
.consent input{margin-top:5px;flex:0 0 auto}
button:disabled{opacity:.45;cursor:not-allowed}
''')
js=root/'web/quest.js'
t=js.read_text()
assert "$('copy-card').onclick=()=>copyText(state.card,'result-code');" in t
t=t.replace("$('copy-card').onclick=()=>copyText(state.card,'result-code');", """$('copy-card').onclick=()=>{if($('consent-card').checked&&state.card)copyText(state.card,'result-code');else toast('Consent required before copying.');};
$('consent-card').onchange=()=>{$('copy-card').disabled=!($('consent-card').checked&&state.card);$('download-receipt').disabled=!($('consent-card').checked&&state.card);};
$('download-receipt').onclick=async()=>{
 if(!$('consent-card').checked||!state.card){toast('Consent required.');return;}
 try{
  if(!crypto.subtle)throw Error('WebCrypto unavailable');
  const bytes=new TextEncoder().encode(state.card);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const r={schema:'raq-consent-receipt-v1',status:'OBSERVED',algorithm:'SHA-256',
    sha256,utf8_bytes:bytes.length,scope:'selected_chat_only',
    consent:true,at:new Date().toISOString(),
    note:'Card body excluded; this receipt is not an identity attestation or Merkle proof.'};
  const blob=new Blob([JSON.stringify(r,null,2)+'\\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='raq-receipt.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Consent receipt generated locally, no card text included.');
 }catch(e){toast('Receipt NOT_COMPUTED: '+e.message)}
};
$('consent-compare').onchange=()=>{
 const ok=$('consent-compare').checked;
 for(const id of ['run-match','example-match','copy-match'])$(id).disabled=!ok;
 $('match-output').replaceChildren();
};
""",1)
t=t.replace("function finish(){\n", "function finish(){\n $('consent-card').checked=false;$('copy-card').disabled=true;$('download-receipt').disabled=true;\n",1)
t=t.replace("function intro(){state.answers=[];","function intro(){$('consent-card').checked=false;$('copy-card').disabled=true;$('download-receipt').disabled=true;state.answers=[];",1)
t=t.replace("$('run-match').onclick=match;","$('run-match').onclick=()=>{if($('consent-compare').checked)match();else toast('Consent required for comparison.')};",1)
t=t.replace("$('example-match').onclick=()=>{","$('example-match').onclick=()=>{if(!$('consent-compare').checked){toast('Consent required.');return;}",1)
t=t.replace("$('copy-match').onclick=()=>{","$('copy-match').onclick=()=>{if(!$('consent-compare').checked){toast('Consent required.');return;}",1)
js.write_text(t)
print('STUDIO_DEMO_PATCHED')
