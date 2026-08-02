/* part2 restore loader – fetches last good snapshot */
(async function(){
  try {
    var urls = [
      'https://cdn.jsdelivr.net/gh/vilmosvilmos2000-ai/fluxi-weboldal@28ec7c28fb52bd3ff7bbd5131c2d3b9490f99cfd/vilmosgpt/app-part2.js',
      'https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/28ec7c28fb52bd3ff7bbd5131c2d3b9490f99cfd/vilmosgpt/app-part2.js'
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
    if (!code) { console.error('VilmosGPT: app-part2 restore failed'); return; }
    // Direct eval keeps lexical scope with part1 consts (chat, input, ...)
    eval(code);
  } catch (e) { console.error('VilmosGPT part2', e); }
})();
