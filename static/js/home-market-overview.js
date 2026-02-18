(function () {
  'use strict';

  var root = document.getElementById('mp-ticker-groups');
  if (!root) return;

  // DOM Caching (T-1006)
  var DOM = {
    tickerGroups: root,
    heroSummary: document.getElementById('mp-hero-summary'),
    heroUpdated: document.getElementById('mp-hero-updated'),
    regimeBadge: document.getElementById('mp-regime-badge'),
    dataTimestamp: document.getElementById('mp-data-timestamp'),
    liveStatus: document.getElementById('mp-live-status')
  };

  // MP_CONFIG is normally initialized by /js/mp-config.js in footer.
  // Use __MP_CONFIG fallback in case of script ordering differences.
  var config = window.MP_CONFIG || window.__MP_CONFIG || {};
  var labels = config.labels || {};
  var calendar = config.calendar || {};
  var home = config.home || {};
  var chartCfg = config.charts || {};
  var paths = config.paths || {};
  var c = (config.colors && config.colors.regime) || {};
  var r = (config.colors && config.colors.regime_rgb) || {};
  var palette = chartCfg.palette || {};
  var timeZone = calendar.timezone || 'Asia/Seoul';
  var lookbackDays = Number(home.lookback_days || 7);
  var barScale = Number(home.bar_scale_pct || 20);
  var liveClasses = home.live || {};
  var neutralSparkColor = palette.muted || 'var(--color-neutral-500)';
  var chartDataPrefix = root.getAttribute('data-chart-data-prefix') || '';
  if (!chartDataPrefix) {
    var cfgPrefix = paths.chart_data_prefix || 'data/chart-data-';
    chartDataPrefix = cfgPrefix.charAt(0) === '/' ? cfgPrefix : ('/' + cfgPrefix);
  }

  var REGIME_COLORS = {
    'RISK_ON': { hex: c.RISK_ON, rgb: r.RISK_ON },
    'CAUTIOUS': { hex: c.CAUTIOUS, rgb: r.CAUTIOUS },
    'RISK_OFF': { hex: c.RISK_OFF, rgb: r.RISK_OFF },
    'PANIC': { hex: c.PANIC, rgb: r.PANIC }
  };

  // WHY: mp-config.js의 defaultConfig가 이미 fallback을 제공하므로 중복 불필요
  var GROUPS = home.overview_groups || [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtPrice(val, fmt) {
    if (fmt === 'index') {
      return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    if (fmt === 'dollar') {
      return val.toLocaleString('en-US', {
        maximumFractionDigits: val >= 1000 ? 0 : 2
      });
    }
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function calcChangePct(current, prev) {
    if (typeof current !== 'number' || typeof prev !== 'number' || prev === 0) {
      return null;
    }
    var pct = ((current - prev) / prev) * 100;
    return Number.isFinite(pct) ? pct : null;
  }

  function getLatestValidPair(series) {
    if (!Array.isArray(series) || series.length === 0) {
      return { current: null, prev: null };
    }

    var current = null;
    var prev = null;
    for (var i = series.length - 1; i >= 0; i--) {
      var v = series[i];
      if (v === null || typeof v !== 'number' || !Number.isFinite(v)) continue;
      if (current === null) {
        current = v;
      } else {
        prev = v;
        break;
      }
    }

    return { current: current, prev: prev };
  }

  function fmtChange(pct) {
    if (pct === null || !Number.isFinite(pct)) return '\u2014';
    var sign = pct >= 0 ? '+' : '';
    return sign + pct.toFixed(2) + '%';
  }

  function generateSparkline(data, color) {
    if (!data) return '';
    var pts = data.slice(-15).filter(function (v) {
      return v !== null && typeof v === 'number' && Number.isFinite(v);
    });
    if (pts.length < 2) return '';

    var min = Math.min.apply(null, pts);
    var max = Math.max.apply(null, pts);
    var range = max - min || 1;
    var w = 60;
    var h = 20;
    var pad = 2;
    var coords = [];

    for (var i = 0; i < pts.length; i++) {
      var x = (i / (pts.length - 1)) * w;
      var y = pad + ((max - pts[i]) / range) * (h - pad * 2);
      coords.push(x.toFixed(1) + ',' + y.toFixed(1));
    }

    return '<svg class="mp-sparkline" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<polyline points="' + coords.join(' ') + '" fill="none" stroke="' + color +
      '" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function renderTickerGroups(ts) {
    var container = DOM.tickerGroups;
    if (!container || !ts || !ts.series) return;

    var html = '';

    for (var g = 0; g < GROUPS.length; g++) {
      var group = GROUPS[g];
      var rows = '';
      var hasData = false;

      for (var t = 0; t < group.tickers.length; t++) {
        var ticker = group.tickers[t];
        var s = ts.series[ticker.key];
        if (!s || s.length < 1) continue;

        var pair = getLatestValidPair(s);
        var current = pair.current;
        var prev = pair.prev;
        if (current === null) continue;

        hasData = true;
        var changePct = calcChangePct(current, prev);

        var isNeutral = changePct === null || changePct === 0;
        var isPositive = !isNeutral && (ticker.invertColor ? changePct < 0 : changePct >= 0);

        var changeColor = isNeutral ? 'rgb(var(--color-neutral-400))' : (isPositive ? 'var(--mp-ticker-up)' : 'var(--mp-ticker-down)');
        var sparkColor = isNeutral ? neutralSparkColor : (isPositive ? 'var(--mp-ticker-up-spark)' : 'var(--mp-ticker-down-spark)');

        // Bar Gauge Calculation
        // Cap width at 100% for ~3% move (scale factor 33) or ~5% (scale 20)
        // Let's use scale 20 (5% move = 100% width) for visibility
        var barWidth = 0;
        if (changePct !== null && Number.isFinite(changePct)) {
          barWidth = Math.min(Math.abs(changePct) * barScale, 100);
        }
        var barHtml = '<div class="mp-ticker-bar-container">' +
          '<div class="mp-ticker-bar" style="width:' + barWidth + '%; background-color:' + changeColor + '"></div>' +
          '</div>';

        // T-601: count-up animation hooks (no external dependency)
        var valueHtml = '<span class="mp-ticker-price mp-animate-num" data-val="' + current + '" data-fmt="' + ticker.fmt + '">' + fmtPrice(current, ticker.fmt) + '</span>';
        var tickerLabel = ticker.shortName || ticker.name;
        var tickerTitle = ticker.fullName || ticker.name;

        rows += '<div class="mp-ticker-row">' +
          '<span class="mp-ticker-name" title="' + escapeHtml(tickerTitle) + '">' + escapeHtml(tickerLabel) + '</span>' +
          valueHtml +
          '<span class="mp-ticker-change" style="color:' + changeColor + '">' + fmtChange(changePct) + '</span>' +
          barHtml +
          generateSparkline(s, sparkColor) +
          '</div>';
      }

      if (!hasData) continue;

      html += '<div class="mp-ticker-group">' +
        '<div class="mp-ticker-group__title">' + group.title + '</div>' +
        rows + '</div>';
    }

    container.innerHTML = html ||
      '<span class="mp-loading-inline">' + (labels.empty_events || '\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4') + '</span>';

    // Trigger animations after render
    animateNumbers(container);
  }

  // Simple count-up implementation
  function animateNumbers(container) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var elements = container.querySelectorAll('.mp-animate-num');
    elements.forEach(function (el) {
      var endVal = parseFloat(el.getAttribute('data-val'));
      var fmt = el.getAttribute('data-fmt');
      if (isNaN(endVal)) return;

      var startVal = endVal * 0.95; // Start from 95%
      var duration = 1000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out quart
        var ease = 1 - Math.pow(1 - progress, 4);

        var currentVal = startVal + (endVal - startVal) * ease;
        el.textContent = fmtPrice(currentVal, fmt); // Re-use existing formatter logic if possible, or simple toLocaleString

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = fmtPrice(endVal, fmt); // Ensure final value is exact
        }
      }

      window.requestAnimationFrame(step);
    });
  }

  function render(data) {
    if (!data) return;

    var regime = data.regime;
    var fallbackColor = { hex: 'var(--regime-color)', rgb: '124 58 237' };
    var color = REGIME_COLORS[regime && regime.current] || REGIME_COLORS.CAUTIOUS || fallbackColor;

    document.documentElement.style.setProperty('--regime-color', color.hex);
    document.documentElement.style.setProperty('--regime-color-rgb', color.rgb);

    // Dynamic Orb Colors (T-303)
    document.documentElement.style.setProperty('--mp-orb-color-primary', color.rgb);
    // Secondary orb: use regime color but maybe softer or mixed?
    // For now use same color for unified atmosphere.
    document.documentElement.style.setProperty('--mp-orb-color-secondary', color.rgb);

    var badge = DOM.regimeBadge;
    if (badge && regime) {
      var text = (regime.icon || '\uD83D\uDFE1') + ' ' + (regime.label || regime.current);
      badge.textContent = text;
    }

    var summary = DOM.heroSummary;
    if (summary && regime && regime.summary) {
      summary.textContent = regime.summary;
    }

    var updated = DOM.heroUpdated;
    if (updated && data.date) {
      updated.textContent = '\uAE30\uC900: ' + data.date;
    }

    if (data.timeSeries) renderTickerGroups(data.timeSeries);

    var tsDisplay = DOM.dataTimestamp;
    if (tsDisplay && data.date) {
      tsDisplay.textContent = '\uB370\uC774\uD130 \uAE30\uC900: ' + data.date;
    }

    // Update Status Dot
    var statusDot = DOM.liveStatus;
    if (statusDot) {
      statusDot.className = 'mp-live-status';
      var nowKST = new Intl.DateTimeFormat('sv-SE', {
        timeZone: timeZone,
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());

      if (data.date === nowKST) {
        statusDot.classList.add(liveClasses.fresh_status_class || 'is-fresh');
      } else {
        statusDot.classList.add(liveClasses.stale_status_class || 'is-stale');
      }
    }
  }

  function tryFetch(urls, idx) {
    if (idx >= urls.length) {
      var el = DOM.heroSummary;
      if (el) el.textContent = labels.chart_load_failed || 'Data unavailable';

      var tg = DOM.tickerGroups;
      if (tg) {
        tg.innerHTML = '<span class="mp-loading-inline">' + (labels.empty_events || '\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4') + '</span>';
      }

      var statusDot = DOM.liveStatus;
      if (statusDot) {
        statusDot.className = 'mp-live-status is-error';
      }
      return;
    }

    fetch(urls[idx])
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        render(data);
      })
      .catch(function () {
        tryFetch(urls, idx + 1);
      });
  }

  function fetchData() {
    var now = new Date();
    var fmt = function (d) {
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    };

    var urls = [];
    for (var i = 0; i <= lookbackDays; i++) {
      urls.push(chartDataPrefix + fmt(new Date(now.getTime() - 86400000 * i)) + '.json');
    }
    tryFetch(urls, 0);
  }

  fetchData();
})();
