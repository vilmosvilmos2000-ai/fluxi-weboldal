/* loader v32 – web search; research = 20+ sources; strong sanitize */
(async function(){
  try {
    var base = 'https://cdn.jsdelivr.net/gh/vilmosvilmos2000-ai/fluxi-weboldal@main/vilmosgpt/';
    var rawBase = 'https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/main/vilmosgpt/';
    var names = ['app-part1.js', 'app-part2.js'];
    var code = '';
    for (var i = 0; i < names.length; i++) {
      var text = null;
      try {
        var r = await fetch(base + names[i] + '?v=32');
        if (r.ok) text = await r.text();
      } catch (e) {}
      if (!text) {
        try {
          var r2 = await fetch(rawBase + names[i] + '?v=32');
          if (r2.ok) text = await r2.text();
        } catch (e2) {}
      }
      if (!text) throw new Error('load fail ' + names[i]);
      code += text + '\n';
    }
    try {
      var ra = await fetch('sidebar-addon.js?v=2');
      if (ra.ok) code += '\n' + await ra.text();
    } catch (ea) {}
    var rqText = null;
    try {
      var rq = await fetch('response-quality.js?v=5');
      if (rq.ok) {
        var t = await rq.text();
        if (t && (t.indexOf('20+ trusted') >= 0 || t.indexOf('Stronger garbage') >= 0)) rqText = t;
      }
    } catch (eq) {}
    if (!rqText) {
      try {
        var rq2 = await fetch('https://raw.githubusercontent.com/vilmosvilmos2000-ai/fluxi-weboldal/main/vilmosgpt/response-quality.js?v=5');
        if (rq2.ok) rqText = await rq2.text();
      } catch (eq2) {}
    }
    if (rqText) code += '\n' + rqText;
    var s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch (e) { console.error('VilmosGPT load', e); }
})();
