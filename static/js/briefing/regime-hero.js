(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};

  ns.injectRegimeHero = function(content, findSectionByTitle, regimeColorMap, regimeColorRgbMap) {
    if (!content || !window.__MP_PAGE || !window.__MP_PAGE.regime) return;

    var mp = window.__MP_PAGE;
    var colorMap = regimeColorMap || {};
    var rgbMap = regimeColorRgbMap || {};

    var regimeColor = colorMap[mp.regime] || '#fbbf24';
    var regimeRgb = rgbMap[mp.regime] || '251 191 36';

    document.documentElement.style.setProperty('--regime-color', regimeColor);
    document.documentElement.style.setProperty('--regime-color-rgb', regimeRgb);

    var articleHeader = document.querySelector('header.mt-12') ||
      document.querySelector('article header') ||
      document.querySelector('#single_header');

    if (articleHeader) {
      var hero = document.createElement('div');
      hero.className = 'mp-post-hero';
      hero.style.borderLeftColor = regimeColor;
      hero.innerHTML =
        '<div class="mp-post-hero__top">' +
          '<span class="mp-regime-badge">' + (mp.regimeIcon || '') + ' ' + mp.regime + '</span>' +
        '</div>' +
        (mp.summary ? '<p class="mp-post-hero__summary">' + mp.summary + '</p>' : '');
      articleHeader.after(hero);
    }

    if (typeof findSectionByTitle !== 'function') return;
    var summarySection = findSectionByTitle(content, '\uD55C\uC904 \uC694\uC57D');
    if (summarySection) summarySection.style.display = 'none';
  };
})();
