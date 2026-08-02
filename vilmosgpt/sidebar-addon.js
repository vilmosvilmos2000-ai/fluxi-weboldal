function ensureSidebarDOM() {
  try {
    if (!document.getElementById('sidebar-backdrop')) {
      var bd = document.createElement('div');
      bd.id = 'sidebar-backdrop';
      bd.className = 'sidebar-backdrop';
      document.body.appendChild(bd);
      bd.addEventListener('click', function() {
        var sl = document.getElementById('sidebar-left');
        if (sl) sl.classList.remove('visible');
        bd.classList.remove('open');
      });
    }
    var sl = document.getElementById('sidebar-left');
    if (!sl) return;
    if (!document.getElementById('new-chat-btn')) {
      var top = document.createElement('div');
      top.className = 'panel-section sidebar-top';
      top.innerHTML = '<button type="button" id="new-chat-btn" class="new-chat-btn">+ Új beszélgetés</button>';
      var hist = document.createElement('div');
      hist.className = 'panel-section history-section';
      hist.innerHTML = '<div class="panel-title">Beszélgetések</div><div class="chat-history" id="chat-history">' +
        '<button type="button" class="history-item active"><span class="history-dot"></span><span class="history-label">Mai chat</span></button>' +
        '<button type="button" class="history-item"><span class="history-dot"></span><span class="history-label">Chat 1</span></button>' +
        '<button type="button" class="history-item"><span class="history-dot"></span><span class="history-label">Tegnap</span></button>' +
        '<button type="button" class="history-item"><span class="history-dot"></span><span class="history-label">Múlt hét</span></button></div>';
      sl.insertBefore(hist, sl.firstChild);
      sl.insertBefore(top, sl.firstChild);
    }
    if (!document.getElementById('menu-toggle')) {
      var hl = document.querySelector('.header-left');
      if (hl) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'menu-toggle';
        btn.className = 'menu-toggle';
        btn.setAttribute('aria-label', 'Menü');
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
        hl.insertBefore(btn, hl.firstChild);
      }
    }
  } catch (e) { console.warn('ensureSidebarDOM', e); }
}
function startNewChat() {
  try {
    if (typeof typewriterToken !== 'undefined') typewriterToken++;
    if (typeof conversationHistory !== 'undefined') conversationHistory = [];
    var chatEl = (typeof chat !== 'undefined' && chat) ? chat : document.getElementById('chat');
    if (chatEl) chatEl.innerHTML = '';
    if (typeof showEmptyState === 'function') showEmptyState();
    document.querySelectorAll('.history-item').forEach(function(el, idx) {
      el.classList.toggle('active', idx === 0);
    });
    var sl = document.getElementById('sidebar-left');
    var bd = document.getElementById('sidebar-backdrop');
    if (sl) sl.classList.remove('visible');
    if (bd) bd.classList.remove('open');
    if (typeof isMobileView === 'function' && isMobileView() && typeof showPanel === 'function') showPanel('chat');
  } catch (e) { console.warn('startNewChat', e); }
}
function bindSidebarUX() {
  try {
    ensureSidebarDOM();
    var root = document.getElementById('sidebar-left') || document.body;
    if (!root._vilmosSideBound) {
      root._vilmosSideBound = true;
      root.addEventListener('click', function(e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#new-chat-btn, .new-chat-btn')) {
          e.preventDefault();
          startNewChat();
          return;
        }
        var hist = t.closest('.history-item');
        if (hist) {
          e.preventDefault();
          document.querySelectorAll('.history-item').forEach(function(el) { el.classList.remove('active'); });
          hist.classList.add('active');
          var label = (hist.querySelector('.history-label') || hist).textContent.trim();
          if (typeof typewriterToken !== 'undefined') typewriterToken++;
          if (typeof conversationHistory !== 'undefined') conversationHistory = [];
          var chatEl = (typeof chat !== 'undefined' && chat) ? chat : document.getElementById('chat');
          if (chatEl) chatEl.innerHTML = '';
          if (typeof showEmptyState === 'function') showEmptyState();
          if (typeof addMessage === 'function') {
            addMessage('Átváltottál erre: „' + label + '”. (A mentés hamarosan érkezik.)', 'system');
          }
          var sl = document.getElementById('sidebar-left');
          var bd = document.getElementById('sidebar-backdrop');
          if (sl) sl.classList.remove('visible');
          if (bd) bd.classList.remove('open');
          if (typeof isMobileView === 'function' && isMobileView() && typeof showPanel === 'function') showPanel('chat');
        }
      });
    }
    var menu = document.getElementById('menu-toggle');
    if (menu && !menu._bound) {
      menu._bound = true;
      menu.addEventListener('click', function(e) {
        e.preventDefault();
        var sl = document.getElementById('sidebar-left');
        var bd = document.getElementById('sidebar-backdrop');
        if (!sl) return;
        var open = !sl.classList.contains('visible');
        if (open) {
          sl.classList.add('visible');
          if (bd) bd.classList.add('open');
          var sr = document.getElementById('sidebar-right');
          if (sr) sr.classList.remove('visible');
        } else {
          sl.classList.remove('visible');
          if (bd) bd.classList.remove('open');
        }
      });
    }
  } catch (e) { console.warn('bindSidebarUX', e); }
}
bindSidebarUX();
setTimeout(bindSidebarUX, 100);
setTimeout(bindSidebarUX, 500);
