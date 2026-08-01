/* app loader v6 */
(async function(){
  try {
    const parts = ['app-part1.js', 'app-part2a.js', 'app-part2b.js'];
    let code = '';
    for (const p of parts) {
      const r = await fetch(p + '?v=clean6');
      if (!r.ok) throw new Error('load ' + p);
      code += await r.text();
    }
    const s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch (e) {
    console.error('VilmosGPT load error', e);
    const chat = document.getElementById('chat');
    if (chat) {
      const d = document.createElement('div');
      d.className = 'message system';
      d.innerHTML = '<div class="avatar">!</div><div class="bubble">Betöltési hiba. Frissítsd az oldalt.</div>';
      chat.appendChild(d);
    }
  }
})();
