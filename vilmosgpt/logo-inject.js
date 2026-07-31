/* === Logo + favicon inject === */
(function injectLogo() {
  try {
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'logo.svg';
      document.head.appendChild(link);
      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = 'logo.svg';
      document.head.appendChild(apple);
    }
    const left = document.querySelector('.header-left');
    if (left && !left.querySelector('.header-logo')) {
      const img = document.createElement('img');
      img.className = 'header-logo';
      img.src = 'logo.svg';
      img.alt = 'VilmosGPT';
      img.width = 40;
      img.height = 40;
      left.insertBefore(img, left.firstChild);
      if (!document.getElementById('header-logo-style')) {
        const st = document.createElement('style');
        st.id = 'header-logo-style';
        st.textContent = '.header-logo{width:40px;height:40px;border-radius:10px;object-fit:cover;image-rendering:pixelated;background:#8fd4e8;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2)}';
        document.head.appendChild(st);
      }
    }
  } catch (e) {}
})();
