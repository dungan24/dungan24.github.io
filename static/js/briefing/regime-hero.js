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
      
      // Quick View Metrics (T-503)
      var metricsHtml = '';
      if (mp.chartData && mp.chartData.series) {
        var series = mp.chartData.series;
        // Simple helper to get % change
        var getChange = function(key) {
          var s = series[key];
          if (!s || s.length < 2) return null;
          var curr = s[s.length-1];
          var prev = s[s.length-2];
          if (!curr || !prev) return null;
          return ((curr - prev) / prev * 100).toFixed(2);
        };

        var spx = getChange('SPX');
        var vix = getChange('VIX');
        
        if (spx !== null) {
          var colorClass = spx >= 0 ? 'num-up' : 'num-down';
          metricsHtml += '<div class="mp-quick-metric"><span class="mp-qm-label">SPX</span><span class="mp-qm-val ' + colorClass + '">' + (spx>=0?'+':'') + spx + '%</span></div>';
        }
        if (vix !== null) {
          // VIX logic: red if up, green if down (usually) but let's stick to standard up/down colors for now or invert?
          // Using standard for simplicity, but maybe inverted meaning.
          var colorClass = vix >= 0 ? 'num-down' : 'num-up'; // Higher VIX = Bad (Red/Blue depending on locale)
          // Actually, let's just show raw change.
          metricsHtml += '<div class="mp-quick-metric"><span class="mp-qm-label">VIX</span><span class="mp-qm-val ' + (vix>=0?'num-up':'num-down') + '">' + (vix>=0?'+':'') + vix + '%</span></div>';
        }
      }

      hero.innerHTML =
        '<div class="mp-post-hero__top">' +
          '<div class="mp-post-hero__badges">' +
            '<span class="mp-regime-badge">' + (mp.regimeIcon || '') + ' ' + mp.regime + '</span>' +
            (metricsHtml ? '<div class="mp-quick-metrics">' + metricsHtml + '</div>' : '') +
          '</div>' +
        '</div>' +
        (mp.summary ? '<p class="mp-post-hero__summary">' + mp.summary + '</p>' : '');
      articleHeader.after(hero);
    }

    if (typeof findSectionByTitle !== 'function') return;
    var summarySection = findSectionByTitle(content, '\uD55C\uC904 \uC694\uC57D');
    if (summarySection) summarySection.style.display = 'none';
  };
})();
