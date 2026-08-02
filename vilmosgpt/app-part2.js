/* part2 – pre-sidebar stable snapshot */
(async function(){
  try {
    var urls = [
      'https://cdn.jsdelivr.net/gh/vilmosvilmos2000-ai/fluxi-weboldal@6a7a296e61b3a2fa08af04a3cb44f8bf6c7acc4e/vilmosgpt/app-part2.js',
      'https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/6a7a296e61b3a2fa08af04a3cb44f8bf6c7acc4e/vilmosgpt/app-part2.js'
    ];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i]);
        if (r.ok) {
          code = await r.text();
          if (code && code.indexOf('function addMessage') >= 0) break;
        }
      } catch (e) {}
    }
    if (!code) { console.error('VilmosGPT: app-part2 load failed'); return; }
    eval(code);
  } catch (e) { console.error('VilmosGPT part2', e); }
})();
