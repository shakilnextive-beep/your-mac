const { chromium } = require('playwright');
(async () => {
  const [mode, ...ts] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready); await p.evaluate(m => window.setMode(m), mode);
  for (const t of ts) {
    const isThumb = t.startsWith('thumb');
    const d = await p.evaluate(([t, th]) => th ? window.thumb(t) : window.frameJPEG(t), [isThumb ? Number(t.slice(5)) : Number(t), isThumb]);
    require('fs').writeFileSync(`${mode}_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
})();
