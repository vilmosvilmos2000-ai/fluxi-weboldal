/* loader v8 */
(async function(){
  try {
    var parts = ['app-part1.js','app-part2a.js','app-part2b.js'];
    var code = '';
    for (var i=0;i<parts.length;i++) {
      var r = await fetch(parts[i]+'?v=c8');
      if (!r.ok) throw new Error(parts[i]);
      code += await r.text();
    }
    var s = document.createElement('script');
    s.textContent = code;
    document.body.appendChild(s);
  } catch(e) { console.error(e); }
})();
