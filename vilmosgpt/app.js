/* loader v35 – stable pinned core + image embed only */
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

    // === IMAGE EMBED ONLY (minimal) ===
    // Converts image URLs -> markdown images so marked renders real <img>
    // Removes [Image N] / (Image N) placeholders
    // Does not change normal text otherwise
    code += '\n' + [
      '(function(){',
      '  try {',
      '    var st = document.createElement("style");',
      '    st.textContent = ".bubble.markdown img, .bubble img { max-width: 100%; height: auto; border-radius: 12px; margin: 8px 0; display: block; }";',
      '    document.head.appendChild(st);',
      '  } catch (e) {}',
      '  function isImageUrl(url) {',
      '    if (!url || typeof url !== "string") return false;',
      '    var u = url.toLowerCase().split("?")[0].split("#")[0];',
      '    if (/\\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(u)) return true;',
      '    if (/imgur\\.com|i\\.imgur|cdn\\.discordapp|media\\.discordapp|pbs\\.twimg|twimg\\.com|googleusercontent\\.com|ggpht\\.com|ytimg\\.com|pinimg\\.com|flickr\\.com|unsplash\\.com|pexels\\.com|wikimedia\\.org|upload\\.wikimedia|i\\.ibb\\.co|postimg\\.cc/i.test(url)) return true;',
      '    return false;',
      '  }',
      '  function processImages(text) {',
      '    if (!text || typeof text !== "string") return text;',
      '    var t = String(text);',
      '    // Convert image URLs to markdown so marked produces real <img>',
      '    t = t.replace(/https?:\\/\\/[^\\s)\\]]+/gi, function(url) {',
      '      var clean = url.replace(/[.,;:!?)]+$/, "");',
      '      var trailing = url.slice(clean.length);',
      '      if (isImageUrl(clean)) return "\\n\\n![Kép](" + clean + ")\\n\\n" + trailing;',
      '      return url;',
      '    });',
      '    // Remove placeholder text like [Image 1], (Image 2), ! Image 3, (! Image 1 (',
      '    t = t.replace(/\\(?\\s*\\[?Image\\s*\\d+\\]?\\s*\\)?/gi, " ");',
      '    t = t.replace(/!\\s*Image\\s*\\d+/gi, " ");',
      '    t = t.replace(/\\(\\s*!\\s*Image\\s*\\d+\\s*\\(/gi, " ");',
      '    t = t.replace(/[^\\S\\r\\n]{2,}/g, " ").replace(/^\\s+|\\s+$/g, "");',
      '    return t;',
      '  }',
      '  var attempts = 0;',
      '  var maxAttempts = 100;',
      '  var interval = setInterval(function(){',
      '    attempts++;',
      '    try {',
      '      if (typeof window.addMessage === "function" && !window.addMessage._imageEmbed) {',
      '        var orig = window.addMessage;',
      '        var wrapped = function() {',
      '          var args = Array.prototype.slice.call(arguments);',
      '          if (typeof args[0] === "string" && (args[1] === "bot" || args[1] === undefined || args[1] === "system")) {',
      '            args[0] = processImages(args[0]);',
      '          }',
      '          return orig.apply(this, args);',
      '        };',
      '        wrapped._imageEmbed = true;',
      '        window.addMessage = wrapped;',
      '        clearInterval(interval);',
      '      }',
      '    } catch (e) {}',
      '    if (attempts >= maxAttempts) clearInterval(interval);',
      '  }, 100);',
      '})();'
    ].join('\n');

    var s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch (e) { console.error('VilmosGPT load', e); }
})();
