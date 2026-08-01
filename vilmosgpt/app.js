/* app loader v7 */
(async function(){
  try {
    const parts = ['app-part1.js', 'app-part2.js'];
    let code = '';
    for (const p of parts) {
      const r = await fetch(p + '?v=clean7');
      if (!r.ok) throw new Error('load ' + p);
      code += await r.text();
    }
    const s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch (e) {
    console.error('VilmosGPT load error', e);
  }
})();
