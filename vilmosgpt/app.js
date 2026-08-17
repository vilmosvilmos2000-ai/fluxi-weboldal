/* loader v34 – restore stable pinned core + image embed support */
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

    // Image embed fix: override sanitize after the core is loaded
    code += '\n' +
"(function(){\n" +
"  function isImageUrl(url) {\n" +
"    if (!url || typeof url !== 'string') return false;\n" +
"    var u = url.toLowerCase().split('?')[0].split('#')[0];\n" +
"    if (/\\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(u)) return true;\n" +
"    if (/imgur\\.com|i\\.imgur|cdn\\.discordapp|media\\.discordapp|pbs\\.twimg|twimg\\.com|googleusercontent\\.com|ggpht\\.com|ytimg\\.com|pinimg\\.com|flickr\\.com|unsplash\\.com|pexels\\.com|wikimedia\\.org|upload\\.wikimedia/i.test(url)) return true;\n" +
"    return false;\n" +
"  }\n" +
"  function enhanceSanitize(orig) {\n" +
"    return function(text) {\n" +
"      if (!text || typeof text !== 'string') return text;\n" +
"      var t = String(text);\n" +
"      t = t.replace(/https?:\\/\\/[^\\s)\\]]+/gi, function(url) {\n" +
"        var clean = url.replace(/[.,;:!?)]+$/, '');\n" +
"        var trailing = url.slice(clean.length);\n" +
"        if (isImageUrl(clean)) return '\\n\\n![Kép](' + clean + ')\\n\\n' + trailing;\n" +
"        return trailing || ' ';\n" +
"      });\n" +
"      t = t.replace(/\\(?\\s*\\[?Image\\s*\\d+\\]?\\s*\\)?/gi, ' ');\n" +
"      t = t.replace(/!\\s*Image\\s*\\d+/gi, ' ');\n" +
"      if (typeof orig === 'function') t = orig(t);\n" +
"      return t;\n" +
"    };\n" +
"  }\n" +
"  try {\n" +
"    var st = document.createElement('style');\n" +
"    st.textContent = '.bubble.markdown img, .bubble img { max-width: 100%; height: auto; border-radius: 12px; margin: 8px 0; display: block; }';\n" +
"    document.head.appendChild(st);\n" +
"  } catch(e) {}\n" +
"  var tries = 0;\n" +
"  var iv = setInterval(function(){\n" +
"    tries++;\n" +
"    if (window._vilmos_sanitizeResponse) {\n" +
"      window._vilmos_sanitizeResponse = enhanceSanitize(window._vilmos_sanitizeResponse);\n" +
"      clearInterval(iv);\n" +
"    } else if (typeof window.addMessage === 'function' && tries > 20) {\n" +
"      clearInterval(iv);\n" +
"    }\n" +
"    if (tries > 60) clearInterval(iv);\n" +
"  }, 150);\n" +
"})();\n";

    var s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch (e) { console.error('VilmosGPT load', e); }
})();
