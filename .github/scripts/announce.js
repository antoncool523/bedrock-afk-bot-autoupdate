const CL_CATS = [
  [/^(karte|minikarte|map|welt|textur)/i, '🗺️', 'Karte'], [/^status/i, '📊', 'Status'], [/^(anti-?afk|bot|afk|spieler|respawn|bewegung)/i, '🤖', 'Bot'], [/^(ping|netz|verbindung|latenz)/i, '⚡', 'Verbindung'],
  [/^(update|webhook|discord|changelog|update-log)/i, '🔔', 'Updates'], [/^(dashboard|layout|oberfläche|design|anzeige)/i, '🎛️', 'Dashboard'], [/^(app|exe|freunde|fenster)/i, '🪟', 'App'],
];
function clSplit(t) { t = String(t); let hint = ''; const m = t.match(/^([^:„“"]{2,32}):\s+([\s\S]+)$/); let head = m ? m[1].trim() : '', body = m ? m[2].trim() : t.trim(); const h = head.match(/^(fix|bugfix|neu|besser|verbessert)$/i); if (h) { hint = /^(fix|bugfix)$/i.test(h[1]) ? 'FIX' : /^neu$/i.test(h[1]) ? 'NEU' : 'BESSER'; head = ''; } return { head, body, hint }; }
function clCat(head, body) { for (const [re, ic, nm] of CL_CATS) if (re.test(head || body)) return { ic, nm }; return head ? { ic: '✨', nm: head.replace(/[-\s]*(seite|anzeige)$/i, '').slice(0, 24) || 'Allgemein' } : { ic: '✨', nm: 'Allgemein' }; }
function clType(body) { return /fix|behoben|repariert|korrigiert|funktioniert (jetzt|wieder)|statt grau/i.test(body) ? 'FIX' : /verbessert|schneller|weich|genauer|angepasst|optimiert|besser/i.test(body) ? 'BESSER' : 'NEU'; }
function clGroups(items) { const g = new Map(); for (const raw of items || []) { const { head, body, hint } = clSplit(raw), c = clCat(head, body), k = c.ic + ' ' + c.nm; if (!g.has(k)) g.set(k, []); g.get(k).push({ t: hint || clType(body), body }); } return g; }
function clText(items) { const out = []; for (const [k, arr] of clGroups(items)) { out.push('**' + k + '**'); for (const a of arr) out.push('> `' + a.t + '` ' + a.body); out.push(''); } return out.join('\n').trim().slice(0, 3800) || 'Dashboard/Bot wurde aktualisiert.'; }
function clEmbed(ver, items, extra) {
  const n = (items || []).length, ts = Math.floor(Date.now() / 1000);
  return { author: { name: 'Bedrock AFK Bot · Update-Log' }, title: '🚀 Update ' + ver + ' ist da', description: clText(items), color: 0x7c5cff,
    fields: [{ name: '📦 Version', value: '`' + ver + '`', inline: true }, { name: '📅 Datum', value: '<t:' + ts + ':D>', inline: true }, { name: '🧩 Änderungen', value: String(n), inline: true }].concat(extra || []),
    footer: { text: 'Update-Log · automatisch gesendet' }, timestamp: new Date().toISOString() };
}
(async () => {
  const hook = process.env.HOOK; if (!hook) { console.log('Kein UPDATE_WEBHOOK gesetzt'); return; }
  const m = JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')), items = String(m.notes || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const body = { username: 'AFK Bot · Updates', allowed_mentions: { parse: [] }, embeds: [clEmbed(m.version, items.length ? items : ['Dashboard/Bot wurde aktualisiert.'])] };
  const r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  console.log(r.status);
})();
