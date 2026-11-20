const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('console', m => console.log('console', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const ts = process.argv.slice(2).map(Number);
  for (const t of ts) { const d = await p.evaluate(t => window.frameJPEG(t), t); require('fs').writeFileSync(`still_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close();
})();
