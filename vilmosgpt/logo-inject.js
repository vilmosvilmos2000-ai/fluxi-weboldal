/* Apple touch icon – valódi PNG a főképernyőhöz */
(function(){
  try {
    var icons = [
      { rel: 'apple-touch-icon', href: 'https://i.imgur.com/kzTgIsW.png', sizes: '180x180' },
      { rel: 'apple-touch-icon', href: 'https://i.imgur.com/LZuVuqC.png', sizes: '192x192' },
      { rel: 'icon', href: 'https://i.imgur.com/kzTgIsW.png', sizes: '180x180', type: 'image/png' }
    ];
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(function(el){ el.remove(); });
    icons.forEach(function(ic){
      var link = document.createElement('link');
      link.rel = ic.rel;
      link.href = ic.href;
      if (ic.sizes) link.setAttribute('sizes', ic.sizes);
      if (ic.type) link.type = ic.type;
      document.head.appendChild(link);
    });
  } catch(e) {}
})();

/* === Logo + version + black glass + MOBIL OPTIM === */
(function injectLogo() {
  try {
    var h1 = document.querySelector('.header-left h1');
    if (h1) h1.textContent = 'VilmosGPT 0.3';
    var sub = document.querySelector('.header-sub');
    if (sub) sub.textContent = 'Személyes AI · tanul · keres · 20+ forrás [ALPHA] version 0.3';
    if (document.title) document.title = 'VilmosGPT 0.3';
    var logos = document.querySelectorAll('.header-logo, .auth-logo');
    logos.forEach(function(img) {
      img.src = 'logo.svg?v=6';
      img.style.imageRendering = 'pixelated';
      img.style.borderRadius = '50%';
      img.style.background = '#000';
    });
  } catch (e) {}
})();

(function injectBlackGlass() {
  try {
    var style = document.createElement('style');
    style.textContent = [
      'html, body { background: #000 !important; }',
      '.sidebar-left, .sidebar-right, .main-chat, .composer-wrap { background: rgba(0,0,0,0.55) !important; backdrop-filter: blur(18px) !important; }',
      '.header { background: linear-gradient(90deg, rgba(0,0,0,0.85), rgba(20,20,30,0.9)) !important; }',
      '.bubble { background: rgba(20,20,25,0.85) !important; }',
      '.message.user .bubble { background: linear-gradient(135deg, #1e3a5f, #2d1b4e) !important; }',
      '.mobile-tabs { background: rgba(0,0,0,0.9) !important; }',
      '.mobile-tabs button { white-space: nowrap; overflow: visible; text-overflow: clip; font-size: 13px !important; padding: 10px 8px !important; }',
      '@media (max-width: 960px) {',
      '  .header { padding: 0 10px !important; min-height: 48px; }',
      '  .header h1 { font-size: 16px !important; }',
      '  .header-logo { width: 32px !important; height: 32px !important; }',
      '  .badge { display: none !important; }',
      '  .user-chip span#user-name { max-width: 60px; overflow: hidden; text-overflow: ellipsis; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}
})();

(function(){var s=document.createElement('script');s.src='search-boost.js?v=m2';document.head.appendChild(s);})();
