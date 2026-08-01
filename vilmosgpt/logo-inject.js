/* === Logo + version + black glass + MOBIL OPTIM === */
(function injectLogo() {
  try {
    var h1 = document.querySelector('.header-left h1');
    if (h1) h1.textContent = 'VilmosGPT 0.3';
    var sub = document.querySelector('.header-sub');
    if (sub) sub.textContent = 'Személyes AI · tanul · keres · 20+ forrás [ALPHA] version 0.3';
    if (document.title) document.title = 'VilmosGPT 0.3';

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
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}
.main-chat { background: rgba(0, 0, 0, 0.25) !important; }
.composer-wrap {
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(16px) !important;
}
.message.bot .bubble {
  background: rgba(255, 255, 255, 0.07) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}
.message.user .bubble {
  background: rgba(30, 58, 95, 0.85) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
}
.message.system .bubble { background: rgba(52, 211, 153, 0.1) !important; }
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
.auth-overlay { background: rgba(0, 0, 0, 0.75) !important; }
.mobile-tabs {
  background: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(12px) !important;
}
.panel-section { border-bottom-color: rgba(255, 255, 255, 0.1) !important; }
#reset { background: rgba(40, 40, 40, 0.9) !important; }

/* ===== MOBIL OPTIMALIZÁLÁS ===== */
@media (max-width: 960px) {
  html, body {
    height: 100% !important;
    height: 100dvh !important;
    overflow: hidden !important;
  }
  .app {
    grid-template-columns: 1fr !important;
    grid-template-rows: 52px auto 1fr !important;
    height: 100% !important;
    height: 100dvh !important;
    width: 100% !important;
  }
  .header {
    padding: 0 10px !important;
    min-height: 52px !important;
    height: 52px !important;
    gap: 6px !important;
  }
  .header-left {
    gap: 8px !important;
    min-width: 0 !important;
    flex: 1 !important;
    overflow: hidden !important;
  }
  .header-logo {
    width: 32px !important;
    height: 32px !important;
  }
  .header h1 {
    font-size: 15px !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    flex-shrink: 0 !important;
  }
  .header-sub { display: none !important; }
  .header-actions {
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
  .badge {
    display: none !important;
  }
  .btn-google {
    padding: 6px 8px !important;
    min-width: 36px !important;
  }
  .btn-google span.label {
    display: none !important;
  }
  .user-chip {
    max-width: 110px !important;
    overflow: hidden !important;
  }
  .user-chip #user-name {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: 60px !important;
  }
  #theme-toggle {
    width: 34px !important;
    height: 34px !important;
    font-size: 14px !important;
  }

  /* Tab sáv – mindig látszik a szöveg */
  .mobile-tabs {
    display: flex !important;
    padding: 6px 8px !important;
    gap: 6px !important;
    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
  }
  .mobile-tabs button {
    flex: 1 !important;
    padding: 10px 6px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    border-radius: 10px !important;
    min-height: 40px !important;
  }

  /* Oldalsávok teljes magasság a tab alatt */
  .sidebar-left, .sidebar-right {
    display: none !important;
    position: absolute !important;
    top: calc(52px + 52px) !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 30 !important;
    border: none !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: env(safe-area-inset-bottom, 12px) !important;
  }
  .sidebar-left.visible, .sidebar-right.visible {
    display: flex !important;
  }

  .main-chat {
    min-height: 0 !important;
  }
  .chat {
    padding: 12px 12px !important;
    gap: 10px !important;
  }
  .bubble {
    max-width: 92% !important;
    font-size: 14px !important;
    padding: 10px 12px !important;
  }
  .avatar {
    width: 30px !important;
    height: 30px !important;
    font-size: 11px !important;
  }

  /* Írómező */
  .composer-wrap {
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }
  .composer {
    gap: 8px !important;
  }
  .composer input {
    padding: 12px 14px !important;
    font-size: 16px !important; /* iOS zoom elkerülés */
    min-width: 0 !important;
  }
  .composer button {
    padding: 11px 14px !important;
    font-size: 13px !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
  .hint {
    font-size: 11px !important;
    margin-top: 6px !important;
  }

  /* Módok / kérdések – teljes szöveg */
  .panel-section {
    padding: 14px 12px !important;
  }
  .panel-title {
    font-size: 11px !important;
    margin-bottom: 10px !important;
  }
  .mode-switch button {
    padding: 12px 12px !important;
    font-size: 14px !important;
    white-space: normal !important;
    line-height: 1.3 !important;
  }
  .prompt-bank {
    max-height: none !important;
  }
  .prompt-item button {
    padding: 12px 12px !important;
    font-size: 13.5px !important;
    white-space: normal !important;
    line-height: 1.4 !important;
    word-break: break-word !important;
  }
  .mentor-item, .memory-item {
    font-size: 13px !important;
    line-height: 1.45 !important;
    white-space: normal !important;
    word-break: break-word !important;
  }
  .status-pill {
    font-size: 12px !important;
    white-space: normal !important;
  }
  .card-actions button, .import-btn {
    padding: 9px 12px !important;
    font-size: 12px !important;
  }

  /* Auth modal mobil */
  .auth-modal {
    padding: 20px 16px 16px !important;
    max-height: 90dvh !important;
    overflow-y: auto !important;
  }
  .auth-modal h2 {
    font-size: 18px !important;
  }
}

/* Nagyon keskeny telefonok */
@media (max-width: 380px) {
  .header h1 { font-size: 14px !important; }
  .mobile-tabs button { font-size: 12px !important; padding: 9px 4px !important; }
  .composer button { padding: 10px 10px !important; font-size: 12px !important; }
}
`;
      document.head.appendChild(stTheme);
    }

    if (!document.querySelector('link[rel="icon"]')) {
      var link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'logo.svg?v=4';
      document.head.appendChild(link);
      var apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = 'logo.svg?v=4';
      document.head.appendChild(apple);
    }
    if (!document.getElementById('header-logo-style')) {
      var st = document.createElement('style');
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
    var left = document.querySelector('.header-left');
    if (left && !left.querySelector('.header-logo')) {
      var img = document.createElement('img');
      img.className = 'header-logo';
      img.src = 'logo.svg?v=4';
      img.alt = 'VilmosGPT';
      img.width = 40;
      img.height = 40;
      left.insertBefore(img, left.firstChild);
    }
    function addAuthLogo() {
      var modal = document.querySelector('.auth-modal');
      if (!modal || modal.querySelector('.auth-logo-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'auth-logo-wrap';
      var img2 = document.createElement('img');
      img2.className = 'auth-logo';
      img2.src = 'logo.svg?v=4';
      img2.alt = 'VilmosGPT';
      img2.width = 72;
      img2.height = 72;
      wrap.appendChild(img2);
      var h2 = modal.querySelector('h2');
      if (h2) modal.insertBefore(wrap, h2);
      else modal.insertBefore(wrap, modal.firstChild);
    }
    addAuthLogo();
    var loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.addEventListener('click', function(){ setTimeout(addAuthLogo, 50); });
  } catch (e) {}
})();

(function(){var s=document.createElement('script');s.src='search-boost.js?v=m1';document.head.appendChild(s);})();
