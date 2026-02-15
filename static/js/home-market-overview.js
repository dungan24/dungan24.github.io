(function() {
  'use strict';

  var root = document.getElementById('mp-ticker-groups');
  if (!root) return;

  var REGIME_COLORS = {
    'RISK_ON': { hex: '#00FF88', rgb: '0 255 136' },
    'CAUTIOUS': { hex: '#FFD600', rgb: '255 214 0' },
    'RISK_OFF': { hex: '#FF3366', rgb: '255 51 102' },
    'PANIC': { hex: '#FF0040', rgb: '255 0 64' }
  };

  var GROUPS = [
    {
      title: 'US INDICES',
      tickers: [
        { key: 'SPX', name: 'S&P 500', fmt: 'index' },
        { key: 'NDX', name: 'Nasdaq', fmt: 'index' },
        { key: 'DJI', name: 'Dow Jones', fmt: 'index' }
      ]
    },
    {
      title: 'RISK METRICS',
      tickers: [
        { key: 'VIX', name: 'VIX', fmt: 'decimal', invertColor: true },
        { key: 'US10Y', name: 'US 10Y Bond', fmt: 'decimal' },
        { key: 'USDKRW', name: 'USD/KRW', fmt: 'decimal' }
      ]
    },
    {
      title: 'ALTERNATIVES',
      tickers: [
        { key: 'BTC', name: 'Bitcoin', fmt: 'dollar' },
        { key: 'GOLD', name: 'Gold', fmt: 'dollar' },
        { key: 'OIL', name: 'WTI Oil', fmt: 'dollar' }
      ]
    }
  ];

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
    var pts = data.slice(-15).filter(function(v) {
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
    var container = document.getElementById('mp-ticker-groups');
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

        var changeColor = isNeutral ? 'rgb(var(--color-neutral-400))' : (isPositive ? '#00FF88' : '#FF3366');
        var sparkColor = isNeutral ? '#64748B' : (isPositive ? '#00FF88' : '#FF3366');

        rows += '<div class="mp-ticker-row">' +
          '<span class="mp-ticker-name">' + ticker.name + '</span>' +
          '<span class="mp-ticker-price">' + fmtPrice(current, ticker.fmt) + '</span>' +
          '<span class="mp-ticker-change" style="color:' + changeColor + '">' + fmtChange(changePct) + '</span>' +
          generateSparkline(s, sparkColor) +
          '</div>';
      }

      if (!hasData) continue;

      html += '<div class="mp-ticker-group">' +
        '<div class="mp-ticker-group__title">' + group.title + '</div>' +
        rows + '</div>';
    }

    container.innerHTML = html ||
      '<span class="mp-loading-inline">\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4</span>';
  }

  function render(data) {
    if (!data) return;

    var regime = data.regime;
    var color = REGIME_COLORS[regime && regime.current] || REGIME_COLORS.CAUTIOUS;

    document.documentElement.style.setProperty('--regime-color', color.hex);
    document.documentElement.style.setProperty('--regime-color-rgb', color.rgb);

    var badge = document.getElementById('mp-regime-badge');
    if (badge && regime) {
      badge.textContent = (regime.icon || '\uD83D\uDFE1') + ' ' + (regime.label || regime.current);
    }

    var summary = document.getElementById('mp-hero-summary');
    if (summary && regime && regime.summary) {
      summary.textContent = regime.summary;
    }

    var updated = document.getElementById('mp-hero-updated');
    if (updated && data.date) {
      updated.textContent = '\uAE30\uC900: ' + data.date;
    }

    if (data.timeSeries) renderTickerGroups(data.timeSeries);

    var ts = document.getElementById('mp-data-timestamp');
    if (ts && data.date) {
      ts.textContent = '\uB370\uC774\uD130 \uAE30\uC900: ' + data.date;
    }
  }

  function tryFetch(urls, idx) {
    if (idx >= urls.length) {
      var el = document.getElementById('mp-hero-summary');
      if (el) el.textContent = 'Data unavailable';

      var tg = document.getElementById('mp-ticker-groups');
      if (tg) {
        tg.innerHTML = '<span class="mp-loading-inline">\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4</span>';
      }
      return;
    }

    fetch(urls[idx])
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function(data) {
        render(data);
      })
      .catch(function() {
        tryFetch(urls, idx + 1);
      });
  }

  function fetchData() {
    var now = new Date();
    var fmt = function(d) {
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    };

    var lookbackDays = 7;
    var urls = [];
    for (var i = 0; i <= lookbackDays; i++) {
      urls.push('/data/chart-data-' + fmt(new Date(now.getTime() - 86400000 * i)) + '.json');
    }
    tryFetch(urls, 0);
  }

  fetchData();
})();
