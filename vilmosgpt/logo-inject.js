/* === Logo + favicon + auth modal logo + version === */
(function injectLogo() {
  try {
    // Version 3.0
    var h1 = document.querySelector('.header-left h1');
    if (h1) h1.textContent = 'VilmosGPT 0.3';
    var sub = document.querySelector('.header-sub');
    if (sub) sub.textContent = 'Személyes AI · tanul · keres · [ALPHA] version 0.3 elsö [BÉTA] 1.0';
    if (document.title) document.title = 'VilmosGPT 3.0';

    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'logo.svg';
      document.head.appendChild(link);
      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = 'logo.svg';
      document.head.appendChild(apple);
    }
    if (!document.getElementById('header-logo-style')) {
      const st = document.createElement('style');
      st.id = 'header-logo-style';
      st.textContent = [
        '.header-logo{width:40px;height:40px;border-radius:10px;object-fit:cover;image-rendering:pixelated;background:#8fd4e8;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2)}',
        '.auth-logo-wrap{display:flex;justify-content:center;margin-bottom:14px}',
        '.auth-logo{width:72px;height:72px;border-radius:16px;object-fit:cover;image-rendering:pixelated;background:#8fd4e8;box-shadow:0 4px 16px rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.15)}',
        '.auth-modal h2{text-align:center}',
        '.auth-modal > p{text-align:center}'
      ].join('');
      document.head.appendChild(st);
    }
    const left = document.querySelector('.header-left');
    if (left && !left.querySelector('.header-logo')) {
      const img = document.createElement('img');
      img.className = 'header-logo';
      img.src = 'logo.svg';
      img.alt = 'VilmosGPT';
      img.width = 40;
      img.height = 40;
      left.insertBefore(img, left.firstChild);
    }
    function addAuthLogo() {
      const modal = document.querySelector('.auth-modal');
      if (!modal || modal.querySelector('.auth-logo-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'auth-logo-wrap';
      const img = document.createElement('img');
      img.className = 'auth-logo';
      img.src = 'logo.svg';
      img.alt = 'VilmosGPT';
      img.width = 72;
      img.height = 72;
      wrap.appendChild(img);
      const h2 = modal.querySelector('h2');
      if (h2) modal.insertBefore(wrap, h2);
      else modal.insertBefore(wrap, modal.firstChild);
    }
    addAuthLogo();
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.addEventListener('click', function(){ setTimeout(addAuthLogo, 50); });
  } catch (e) {}
})();

(function(){var s=document.createElement('script');s.src='search-boost.js';document.head.appendChild(s);})();
