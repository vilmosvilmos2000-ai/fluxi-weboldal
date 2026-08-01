/* app loader */
(async function(){
  try {
    const parts = ['app-part1.js', 'app-part2.js'];
    let code = '';
    for (const p of parts) {
      const r = await fetch(p + '?v=clean4');
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
      d.innerHTML = '<div class="avatar">!</div><div class="bubble">Betöltési hiba. Frissítsd az oldalt (Ctrl+F5).</div>';
      chat.appendChild(d);
    }
  }
})();
