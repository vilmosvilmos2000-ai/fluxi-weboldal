(function(){
  var scripts = ['logo-inject.js', 'app-main-a.js', 'app-main-b.js', 'search-boost.js'];
  var i = 0;
  function next() {
    if (i >= scripts.length) return;
    var s = document.createElement('script');
    s.src = scripts[i++];
    s.onload = next;
    s.onerror = function(){ console.error('load fail', scripts[i-1]); next(); };
    document.head.appendChild(s);
  }
  next();
})();
