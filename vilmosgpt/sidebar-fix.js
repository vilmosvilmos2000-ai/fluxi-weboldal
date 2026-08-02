(function(){
  function ensureSidebarDOM() {
    try {
      if (!document.getElementById('sidebar-backdrop')) {
        var bd = document.createElement('div');
        bd.id = 'sidebar-backdrop'; bd.className = 'sidebar-backdrop';
        document.body.appendChild(bd);
        bd.addEventListener('click', function(){
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
          '<button type="button" class="history-item active" data-id="today"><span class="history-dot"></span><span class="history-label">Mai chat</span></button>' +
          '<button type="button" class="history-item" data-id="chat1"><span class="history-dot"></span><span class="history-label">Chat 1</span></button>' +
          '<button type="button" class="history-item" data-id="yesterday"><span class="history-dot"></span><span class="history-label">Tegnap</span></button>' +
          '<button type="button" class="history-item" data-id="lastweek"><span class="history-dot"></span><span class="history-label">Múlt hét</span></button></div>';
        sl.insertBefore(hist, sl.firstChild);
        sl.insertBefore(top, sl.firstChild);
      }
      if (!document.getElementById('menu-toggle')) {
        var hl = document.querySelector('.header-left');
        if (hl) {
          var btn = document.createElement('button');
          btn.type = 'button'; btn.id = 'menu-toggle'; btn.className = 'menu-toggle';
          btn.setAttribute('aria-label', 'Menü');
          btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
          hl.insertBefore(btn, hl.firstChild);
        }
      }
    } catch (e) {}
  }

  function closeMobileSidebar() {
    var sl = document.getElementById('sidebar-left');
    var bd = document.getElementById('sidebar-backdrop');
    if (sl) sl.classList.remove('visible');
    if (bd) bd.classList.remove('open');
  }

  window.startNewChat = function() {
    try {
      if (typeof typewriterToken !== 'undefined') typewriterToken++;
      if (typeof conversationHistory !== 'undefined') conversationHistory = [];
      var chatEl = document.getElementById('chat');
      if (chatEl) chatEl.innerHTML = '';
      if (typeof showEmptyState === 'function') showEmptyState();
      document.querySelectorAll('.history-item').forEach(function(el, idx) {
        el.classList.toggle('active', idx === 0);
      });
      closeMobileSidebar();
      if (window.innerWidth <= 960 && typeof showPanel === 'function') showPanel('chat');
    } catch (e) { console.warn(e); }
  };

  function selectHistoryItem(item) {
    if (!item) return;
    document.querySelectorAll('.history-item').forEach(function(el){ el.classList.remove('active'); });
    item.classList.add('active');
    var label = (item.querySelector('.history-label') || item).textContent.trim();
    if (typeof typewriterToken !== 'undefined') typewriterToken++;
    if (typeof conversationHistory !== 'undefined') conversationHistory = [];
    var chatEl = document.getElementById('chat');
    if (chatEl) chatEl.innerHTML = '';
    if (typeof showEmptyState === 'function') showEmptyState();
    if (typeof addMessage === 'function') {
      addMessage('Átváltottál erre: „' + label + '”. (A korábbi beszélgetések mentése hamarosan érkezik.)', 'system');
    }
    closeMobileSidebar();
    if (window.innerWidth <= 960 && typeof showPanel === 'function') showPanel('chat');
  }

  function toggleLeftSidebar() {
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
      closeMobileSidebar();
    }
  }

  function bindAll() {
    ensureSidebarDOM();
    var root = document.getElementById('sidebar-left') || document.body;
    if (!root._vilmosSideBound2) {
      root._vilmosSideBound2 = true;
      root.addEventListener('click', function(e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#new-chat-btn, .new-chat-btn')) {
          e.preventDefault(); e.stopPropagation();
          window.startNewChat();
          return;
        }
        var hist = t.closest('.history-item');
        if (hist) {
          e.preventDefault(); e.stopPropagation();
          selectHistoryItem(hist);
        }
      });
    }
    var menu = document.getElementById('menu-toggle');
    if (menu && !menu._bound2) {
      menu._bound2 = true;
      menu.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        toggleLeftSidebar();
      });
    }
  }

  bindAll();
  setTimeout(bindAll, 100);
  setTimeout(bindAll, 500);
  setTimeout(bindAll, 1500);
})();
