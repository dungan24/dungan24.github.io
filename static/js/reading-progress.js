(function () {
  'use strict';

  // Do not run on Homepage
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') return;

  var bar = document.getElementById('mp-reading-progress');
  
  // Auto-inject if missing
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'mp-reading-progress';
    bar.className = 'mp-reading-progress';
    document.body.appendChild(bar);
  }

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    var progress = Math.min((scrollTop / docHeight) * 100, 100);
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  // Initial calculation
  setTimeout(updateProgress, 100);
})();
