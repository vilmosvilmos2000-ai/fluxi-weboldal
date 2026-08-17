/* loader v36 – stable core + reliable image embed via renderMarkdown override */
(async function(){
  try {
    var base = 'https://cdn.jsdelivr.net/gh/vilmosvilmos2000-ai/fluxi-weboldal@6a7a296e61b3a2fa08af04a3cb44f8bf6c7acc4e/vilmosgpt/';
    var rawBase = 'https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/6a7a296e61b3a2fa08af04a3cb44f8bf6c7acc4e/vilmosgpt/';
    var names = ['app-part1.js', 'app-part2.js'];
    var code = '';
    for (var i = 0; i < names.length; i++) {
      var text = null;
      try {
        var r = await fetch(base + names[i]);
        if (r.ok) text = await r.text();
      } catch (e) {}
      if (!text) {
        try {
          var r2 = await fetch(rawBase + names[i]);
          if (r2.ok) text = await r2.text();
        } catch (e2) {}
      }
      if (!text) throw new Error('load fail ' + names[i]);
      code += text + '\n';
    }
    try {
      var ra = await fetch('sidebar-addon.js?v=1');
      if (ra.ok) code += '\n' + await ra.text();
    } catch (ea) {}
    var rqText = null;
    try {
      var rq = await fetch('response-quality.js?v=4');
      if (rq.ok) {
        var t = await rq.text();
        if (t && t.indexOf('20+ trusted') >= 0) rqText = t;
      }
    } catch (eq) {}
    if (!rqText) {
      try {
        var rq2 = await fetch('https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/main/vilmosgpt/response-quality.js?v=4');
        if (rq2.ok) rqText = await rq2.text();
      } catch (eq2) {}
    }
    if (rqText) code += '\n' + rqText;

    // Run core first
    var s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);

    // === IMAGE EMBED: runs AFTER core, overrides renderMarkdown + wraps addMessage ===
    (function installImageEmbed(){
      function isImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        var u = url.toLowerCase().split('?')[0].split('#')[0];
        if (/\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(u)) return true;
        if (/imgur\.com|i\.imgur|cdn\.discordapp|media\.discordapp|pbs\.twimg|twimg\.com|googleusercontent\.com|ggpht\.com|ytimg\.com|pinimg\.com|flickr\.com|unsplash\.com|pexels\.com|wikimedia\.org|upload\.wikimedia|i\.ibb\.co|postimg\.cc/i.test(url)) return true;
        return false;
      }

      function stripImagePlaceholders(text) {
        var t = String(text || '');
        t = t.replace(/\(?\s*\[?Image\s*\d+\]?\s*\)?/gi, ' ');
        t = t.replace(/!\s*Image\s*\d+/gi, ' ');
        t = t.replace(/\(\s*!\s*Image\s*\d+\s*\(/gi, ' ');
        return t;
      }

      function urlsToMarkdownImages(text) {
        var t = String(text || '');
        t = t.replace(/https?:\/\/[^\s)\]]+/gi, function(url) {
          var clean = url.replace(/[.,;:!?)]+$/, '');
          var trailing = url.slice(clean.length);
          if (isImageUrl(clean)) {
            return '\n\n![Kép](' + clean + ')\n\n' + trailing;
          }
          return url;
        });
        return t;
      }

      function prepareForRender(text) {
        var t = String(text || '');
        t = urlsToMarkdownImages(t);
        t = stripImagePlaceholders(t);
        t = t.replace(/[^\S\r\n]{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
        return t;
      }

      try {
        if (!document.getElementById('vilmos-img-css')) {
          var st = document.createElement('style');
          st.id = 'vilmos-img-css';
          st.textContent = '.bubble.markdown img, .bubble img { max-width: 100%; height: auto; border-radius: 12px; margin: 8px 0; display: block; object-fit: contain; }';
          document.head.appendChild(st);
        }
      } catch (e) {}

      var tries = 0;
      var iv = setInterval(function() {
        tries++;
        var ready = typeof window.renderMarkdown === 'function' || typeof window.addMessage === 'function';
        if (!ready) {
          if (tries > 80) clearInterval(iv);
          return;
        }
        clearInterval(iv);

        if (typeof window.renderMarkdown === 'function' && !window.renderMarkdown._imgEmbed) {
          var origRM = window.renderMarkdown;
          var newRM = function(text) {
            var prepared = prepareForRender(text);
            var html = origRM(prepared);
            if (html && html.indexOf('<img') === -1) {
              var urls = String(text || '').match(/https?:\/\/[^\s)\]]+/gi) || [];
              for (var i = 0; i < urls.length; i++) {
                var clean = urls[i].replace(/[.,;:!?)]+$/, '');
                if (isImageUrl(clean)) {
                  html += '<img src="' + clean.replace(/"/g, '&quot;') + '" alt="Kép" style="max-width:100%;height:auto;border-radius:12px;margin:8px 0;display:block;">';
                }
              }
              html = stripImagePlaceholders(html);
            }
            return html;
          };
          newRM._imgEmbed = true;
          window.renderMarkdown = newRM;
        }

        if (typeof window.addMessage === 'function' && !window.addMessage._imageEmbed) {
          var origAM = window.addMessage;
          var newAM = function() {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === 'string') {
              var role = args[1];
              if (role === 'bot' || role === 'system' || role === undefined) {
                args[0] = prepareForRender(args[0]);
              }
            }
            return origAM.apply(this, args);
          };
          newAM._imageEmbed = true;
          window.addMessage = newAM;
        }

        console.log('[VilmosGPT] image embed active');
      }, 100);
    })();
  } catch (e) { console.error('VilmosGPT load', e); }
})();
