/* Biztonságos API base – Vercel deploy után állítsd pl. https://xxx.vercel.app */
(function(){
  if (typeof window.VILMOS_API_BASE === 'undefined') {
    window.VILMOS_API_BASE = '';
  }
})();

(function(){
  try {
    var st = document.createElement('style');
    st.textContent = '#chat, .chat { scroll-behavior: smooth !important; }';
    document.head.appendChild(st);
  } catch(e) {}
})();

/* Apple touch icon – valódi PNG */
(function(){
  try {
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(function(el){ el.remove(); });
    [['apple-touch-icon','https://i.imgur.com/kzTgIsW.png','180x180'],
     ['apple-touch-icon','https://i.imgur.com/LZuVuqC.png','192x192']].forEach(function(ic){
      var link = document.createElement('link');
      link.rel = ic[0]; link.href = ic[1]; link.setAttribute('sizes', ic[2]);
      document.head.appendChild(link);
    });
  } catch(e) {}
})();

(function injectLogo() {
  try {
    var h1 = document.querySelector('.header-left h1');
    if (h1) h1.textContent = 'VilmosGPT 0.3';
    if (document.title) document.title = 'VilmosGPT 0.3';
    document.querySelectorAll('.header-logo, .auth-logo').forEach(function(img) {
      img.src = 'logo.svg?v=7';
      img.style.imageRendering = 'pixelated';
      img.style.borderRadius = '50%';
      img.style.background = '#000';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.style.flexShrink = '0';
    });
  } catch (e) {}
})();

(function injectMobileFix() {
  try {
    var style = document.createElement('style');
    style.textContent = [
      'html, body { background: #000 !important; height: 100% !important; height: 100dvh !important; overflow: hidden !important; }',
      '.app { height: 100% !important; height: 100dvh !important; width: 100% !important; max-width: 100vw !important; }',
      '.header { background: #0a0a0f !important; overflow: visible !important; min-height: 0 !important; height: auto !important; align-items: center !important; padding-left: 12px !important; padding-right: 12px !important; padding-top: max(10px, env(safe-area-inset-top, 10px)) !important; padding-bottom: 10px !important; box-sizing: border-box !important; }',
      '.header-left { display: flex !important; align-items: center !important; gap: 10px !important; min-width: 0 !important; flex: 1 1 auto !important; overflow: visible !important; }',
      '.header-logo { width: 36px !important; height: 36px !important; min-width: 36px !important; min-height: 36px !important; border-radius: 50% !important; object-fit: cover !important; flex-shrink: 0 !important; display: block !important; visibility: visible !important; opacity: 1 !important; }',
      '.header h1 { font-size: 16px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 46vw !important; }',
      '.header-actions { flex-shrink: 0 !important; gap: 6px !important; }',
      '.sidebar-left, .sidebar-right, .main-chat, .composer-wrap { background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(16px) !important; }',
      '.message.user .bubble { background: linear-gradient(135deg, #1e3a5f, #2d1b4e) !important; }',
      '.bubble { background: rgba(20,20,25,0.9) !important; }',
      '.mobile-tabs { background: #000 !important; padding: 6px 8px !important; gap: 6px !important; }',
      '.mobile-tabs button { white-space: nowrap !important; overflow: visible !important; font-size: 13px !important; padding: 10px 6px !important; }',
      '@media (max-width: 960px) {',
      '  .app { display: flex !important; flex-direction: column !important; grid-template-columns: none !important; grid-template-rows: none !important; height: 100dvh !important; width: 100vw !important; overflow: hidden !important; }',
      '  .header { flex: 0 0 auto !important; width: 100% !important; position: relative !important; z-index: 30 !important; }',
      '  .mobile-tabs { display: flex !important; flex: 0 0 auto !important; width: 100% !important; }',
      '  .main-chat { flex: 1 1 auto !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; width: 100% !important; position: relative !important; }',
      '  .chat { flex: 1 1 auto !important; min-height: 0 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth !important; padding: 12px !important; }',
      '  .composer-wrap { flex: 0 0 auto !important; width: 100% !important; padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important; }',
      '  .sidebar-left, .sidebar-right { display: none; position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; top: 0 !important; padding-top: max(60px, calc(env(safe-area-inset-top, 0px) + 52px)) !important; z-index: 25 !important; border: none !important; width: 100% !important; height: 100% !important; overflow-y: auto !important; }',
      '  .sidebar-left.visible, .sidebar-right.visible { display: flex !important; }',
      '  .bubble { max-width: 85% !important; font-size: 14px !important; }',
      '  .header h1 { font-size: 15px !important; max-width: 42vw !important; }',
      '  .header-logo { width: 34px !important; height: 34px !important; min-width: 34px !important; }',
      '  .btn-google { padding: 6px !important; }',
      '  .user-chip span#user-name { max-width: 50px; overflow: hidden; text-overflow: ellipsis; }',
      '}',
      '@media (max-width: 380px) {',
      '  .header h1 { font-size: 14px !important; max-width: 36vw !important; }',
      '  .header-logo { width: 30px !important; height: 30px !important; min-width: 30px !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}
})();

(function(){var s=document.createElement('script');s.src='search-boost.js?v=m4';document.head.appendChild(s);})();
