/* Input → textarea */
(function upgradeComposer(){
  try {
    var old = document.getElementById('input');
    if (!old || old.tagName === 'TEXTAREA') return;
    var ta = document.createElement('textarea');
    ta.id = 'input'; ta.rows = 1;
    ta.placeholder = old.getAttribute('placeholder') || 'Írd be a kérdésed...';
    ta.setAttribute('autocomplete', 'off');
    if (old.value) ta.value = old.value;
    old.parentNode.replaceChild(ta, old);
  } catch (e) {}
})();

(function(){
  if (typeof window.VILMOS_API_BASE === 'undefined') window.VILMOS_API_BASE = '';
})();

(function(){
  try {
    var st = document.createElement('style');
    st.textContent = [
      '#chat, .chat { scroll-behavior: smooth !important; }',
      '.message.typing .typing-bubble{display:flex;align-items:center;gap:10px;min-width:72px;padding:12px 16px}',
      '.typing-indicator{display:inline-flex;align-items:center;gap:5px;height:14px}',
      '.typing-dot{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#8b5cf6);opacity:.45;animation:vilmos-bounce 1.15s ease-in-out infinite}',
      '.typing-dot:nth-child(2){animation-delay:.18s}',
      '.typing-dot:nth-child(3){animation-delay:.36s}',
      '.typing-label{font-size:12px;color:#94a3b8;font-style:italic;white-space:nowrap}',
      '@keyframes vilmos-bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}',
      '.message.error .error-avatar{background:linear-gradient(135deg,#f87171,#dc2626)!important;color:#fff!important}',
      '.message.error .error-bubble{background:rgba(254,226,226,0.12)!important;border:1px solid #b91c1c!important;color:#fecaca!important}',
      '.error-row{display:flex;gap:10px;align-items:flex-start}',
      '.error-icon{font-size:18px;line-height:1.2;flex-shrink:0}',
      '.error-title{font-weight:700;color:#fecaca;margin-bottom:4px;font-size:14px}',
      '.error-text{color:#fca5a5;font-size:13px;line-height:1.45}',
      '.error-detail{margin-top:6px;font-size:12px;color:#f87171;opacity:.9}',
      '.error-retry-btn{margin-top:10px;border:none;border-radius:999px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer;background:linear-gradient(90deg,#ef4444,#b91c1c);color:#fff}',
      '.composer{align-items:flex-end!important}',
      '.composer textarea#input,.composer #input{flex:1;padding:12px 14px;border:1px solid rgba(255,255,255,0.15);border-radius:18px;outline:none;font-size:15px;background:#f8fafc;color:#0f172a;font-family:inherit;line-height:1.4;resize:none;overflow-y:hidden;min-height:44px;max-height:calc(1.4em * 5 + 24px);height:44px}',
      '.empty-state{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:20px 16px;overflow-y:auto}',
      '.empty-state.hidden{display:none!important}',
      '.chat.is-empty{display:none!important}',
      '.empty-inner{width:min(560px,100%);text-align:center}',
      '.empty-badge{display:inline-block;font-size:11px;font-weight:700;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);border-radius:999px;padding:4px 10px;margin-bottom:12px}',
      '.empty-title{font-size:clamp(28px,6vw,40px);font-weight:800;background:linear-gradient(135deg,#f8fafc,#38bdf8 50%,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent;margin:0 0 10px}',
      '.empty-sub{color:#94a3b8;font-size:15px;line-height:1.5;margin:0 0 22px}',
      '.empty-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left}',
      '.empty-card{display:flex;align-items:flex-start;gap:10px;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#e2e8f0;cursor:pointer;font:inherit;text-align:left}',
      '.empty-card:hover{border-color:rgba(56,189,248,0.45);background:rgba(56,189,248,0.08)}',
      '.bot-col{display:flex;flex-direction:column;align-items:flex-start;max-width:85%;gap:4px}',
      '.bot-actions{display:flex;gap:4px;opacity:0.35;transition:opacity .2s}',
      '.message.bot:hover .bot-actions{opacity:1}',
      '.bot-action-btn{position:relative;border:none;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}',
      '.bot-action-btn.copied{color:#34d399}',
      '.bot-action-btn .ico-check{display:none}',
      '.bot-action-btn.copied .ico-copy{display:none}',
      '.bot-action-btn.copied .ico-check{display:block}',
      '.bot-action-tip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#0f172a;color:#a7f3d0;font-size:11px;padding:4px 8px;border-radius:6px;opacity:0;pointer-events:none}',
      '.bot-action-btn.copied .bot-action-tip{opacity:1}',
      '.menu-toggle{display:none!important;border:none;background:rgba(255,255,255,0.12);color:#e2e8f0;width:36px;height:36px;border-radius:10px;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}',
      '.new-chat-btn{width:100%;border:1px solid rgba(56,189,248,0.4);background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(139,92,246,0.22));color:#f8fafc;font-weight:700;font-size:14px;padding:12px 14px;border-radius:12px;cursor:pointer}',
      '.chat-history{display:flex;flex-direction:column;gap:4px}',
      '.history-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid transparent;background:transparent;color:#cbd5e1;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500}',
      '.history-item:hover{background:rgba(255,255,255,0.06)}',
      '.history-item.active{background:rgba(56,189,248,0.14);border-color:rgba(56,189,248,0.28);color:#f8fafc}',
      '.history-dot{width:7px;height:7px;border-radius:50%;background:#64748b;flex-shrink:0}',
      '.history-item.active .history-dot{background:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,.5)}',
      '.history-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sidebar-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:24}',
      '.sidebar-backdrop.open{display:block}',
      '@media (min-width:961px){.sidebar-left{background:rgba(12,12,18,0.72)!important;backdrop-filter:blur(20px)!important;border-right:1px solid rgba(255,255,255,0.08)!important}.menu-toggle{display:none!important}}',
      '@media (max-width:960px){.menu-toggle{display:inline-flex!important}.sidebar-left{background:rgba(8,8,12,0.92)!important;backdrop-filter:blur(24px)!important;width:min(300px,88vw)!important;right:auto!important;border-right:1px solid rgba(255,255,255,0.1)!important;box-shadow:8px 0 40px rgba(0,0,0,0.5)}}',
      '@media (max-width:520px){.empty-cards{grid-template-columns:1fr}}',
      '@media (hover:none){.bot-actions{opacity:0.55}}'
    ].join('');
    document.head.appendChild(st);
  } catch(e) {}
})();

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
    if (h1) h1.textContent = 'VilmosGPT 0.4';
    if (document.title) document.title = 'VilmosGPT 0.4';
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
      '.header { background: #0a0a0f !important; overflow: visible !important; align-items: center !important; padding-top: max(10px, env(safe-area-inset-top, 10px)) !important; }',
      '.header-left { display: flex !important; align-items: center !important; gap: 10px !important; min-width: 0 !important; flex: 1 1 auto !important; }',
      '.header-logo { width: 36px !important; height: 36px !important; min-width: 36px !important; border-radius: 50% !important; object-fit: cover !important; flex-shrink: 0 !important; }',
      '.sidebar-left, .sidebar-right, .main-chat, .composer-wrap { background: rgba(0,0,0,0.6) !important; backdrop-filter: blur(16px) !important; }',
      '@media (max-width: 960px) {',
      '  .app { display: flex !important; flex-direction: column !important; height: 100dvh !important; width: 100vw !important; overflow: hidden !important; }',
      '  .header { flex: 0 0 auto !important; width: 100% !important; z-index: 30 !important; }',
      '  .mobile-tabs { display: flex !important; flex: 0 0 auto !important; width: 100% !important; }',
      '  .main-chat { flex: 1 1 auto !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; width: 100% !important; }',
      '  .chat { flex: 1 1 auto !important; min-height: 0 !important; overflow-y: auto !important; }',
      '  .composer-wrap { flex: 0 0 auto !important; width: 100% !important; padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important; }',
      '  .sidebar-left, .sidebar-right { display: none; position: fixed !important; left: 0 !important; bottom: 0 !important; top: 0 !important; padding-top: max(60px, calc(env(safe-area-inset-top, 0px) + 52px)) !important; z-index: 25 !important; height: 100% !important; overflow-y: auto !important; }',
      '  .sidebar-left.visible, .sidebar-right.visible { display: flex !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}
})();

(function(){var s=document.createElement('script');s.src='search-boost.js?v=m4';document.head.appendChild(s);})();
