(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};

  ns.initScrollSpy = function(content) {
    if (!content) return;

    var tocContainer = document.querySelector('.toc');
    if (!tocContainer) return;

    var tocLinks = tocContainer.querySelectorAll('a[href^="#"]');
    if (tocLinks.length === 0) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        if (!id) return;

        tocLinks.forEach(function(link) {
          link.classList.remove('is-active');
        });

        var activeLink = tocContainer.querySelector('a[href="#' + id + '"]');
        if (activeLink) activeLink.classList.add('is-active');
      });
    }, {
      rootMargin: '-20% 0px -80% 0px'
    });

    var headings = content.querySelectorAll('h2[id]');
    headings.forEach(function(h2) {
      observer.observe(h2);
    });
  };
})();
