/* === Logo + favicon + auth modal logo + version + black glass theme === */
(function injectLogo() {
  try {
    // Version 3.0
    var h1 = document.querySelector('.header-left h1');
    if (h1) h1.textContent = 'VilmosGPT 3.0';
    var sub = document.querySelector('.header-sub');
    if (sub) sub.textContent = 'Személyes AI · tanul · keres · 20+ forrás [ALPHA] version 3.0';
    if (document.title) document.title = 'VilmosGPT 3.0';

    // Black transparent glass theme
    if (!document.getElementById('black-glass-theme')) {
      var stTheme = document.createElement('style');
      stTheme.id = 'black-glass-theme';
      stTheme.textContent = `
/* Black transparent glass theme */
html, body {
  background: #000000 !important;
  background-image:
    radial-gradient(ellipse at 20% 15%, rgba(56, 189, 248, 0.08), transparent 45%),
    radial-gradient(ellipse at 80% 85%, rgba(139, 92, 246, 0.07), transparent 45%) !important;
}
.header {
  background: rgba(0, 0, 0, 0.65) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.sidebar-left, .sidebar-right {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}
.main-chat {
  background: rgba(0, 0, 0, 0.25) !important;
}
.composer-wrap {
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(16px) !important;
}
.message.bot .bubble {
  background: rgba(255, 255, 255, 0.07) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}
.message.user .bubble {
  background: rgba(30, 58, 95, 0.85) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
}
.message.system .bubble {
  background: rgba(52, 211, 153, 0.1) !important;
}
.mode-switch button, .prompt-item button, .mentor-item, .memory-item {
  background: rgba(255, 255, 255, 0.04) !important;
}
.mode-switch button.active {
  background: linear-gradient(135deg, rgba(56,189,248,0.25), rgba(139,92,246,0.25)) !important;
}
.auth-modal {
  background: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(20px) !important;
}
.auth-overlay {
  background: rgba(0, 0, 0, 0.75) !important;
}
.mobile-tabs {
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(12px) !important;
}
.panel-section {
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}
#reset {
  background: rgba(40, 40, 40, 0.9) !important;
}
`;
      document.head.appendChild(stTheme);
    }

    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'logo.svg?v=3';
      document.head.appendChild(link);
      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = 'logo.svg?v=3';
      document.head.appendChild(apple);
    }
    if (!document.getElementById('header-logo-style')) {
      const st = document.createElement('style');
      st.id = 'header-logo-style';
      st.textContent = [
        '.header-logo{width:40px;height:40px;border-radius:50%;object-fit:cover;image-rendering:pixelated;background:#000;flex-shrink:0;box-shadow:0 0 0 1px rgba(255,255,255,.25)}',
        '.auth-logo-wrap{display:flex;justify-content:center;margin-bottom:14px}',
        '.auth-logo{width:72px;height:72px;border-radius:50%;object-fit:cover;image-rendering:pixelated;background:#000;box-shadow:0 0 0 2px rgba(255,255,255,.2);border:none}',
        '.auth-modal h2{text-align:center}',
        '.auth-modal > p{text-align:center}'
      ].join('');
      document.head.appendChild(st);
    }
    const left = document.querySelector('.header-left');
    if (left && !left.querySelector('.header-logo')) {
      const img = document.createElement('img');
      img.className = 'header-logo';
      img.src = 'logo.svg?v=3';
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
      img.src = 'logo.svg?v=3';
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
