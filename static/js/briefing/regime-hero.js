(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

  // ── helpers ──

  function resolveColorMap() {
    var config = window.MP_CONFIG || {};
    return {
      regime: (config.colors && config.colors.regime) || {},
      rgb: (config.colors && config.colors.regime_rgb) || {},
    };
  }

  function getRegimeColor(regime, colorMap, rgbMap) {
    var cm = colorMap || {};
    var rm = rgbMap || {};
    var defaults = resolveColorMap();
    var color =
      cm[regime] ||
      defaults.regime[regime] ||
      defaults.regime.CAUTIOUS ||
      "#fbbf24";
    var rgb =
      rm[regime] ||
      defaults.rgb[regime] ||
      defaults.rgb.CAUTIOUS ||
      "251 191 36";
    return { color: color, rgb: rgb };
  }

  function applyRegimeCSS(regime, colorMap, rgbMap) {
    if (!regime) return;
    var c = getRegimeColor(regime, colorMap, rgbMap);
    document.documentElement.style.setProperty("--regime-color", c.color);
    document.documentElement.style.setProperty("--regime-color-rgb", c.rgb);
  }

  // 시계열 데이터에서 최근 2일 % 변화율 계산
  function calcChange(series, key) {
    var s = series && series[key];
    if (!s || s.length < 2) return null;
    // null 값 건너뛰기 (주말/공휴일)
    var curr = null,
      prev = null;
    for (var i = s.length - 1; i >= 0; i--) {
      if (s[i] != null) {
        if (curr === null) {
          curr = s[i];
        } else if (prev === null) {
          prev = s[i];
          break;
        }
      }
    }
    if (curr === null || prev === null || prev === 0) return null;
    return (((curr - prev) / prev) * 100).toFixed(2);
  }

  function buildMetricHtml(label, value) {
    if (value === null) return "";
    var v = parseFloat(value);
    // VIX: 올라가면 위험(num-up은 빨강 = 나쁨), 내려가면 안정
    var colorClass = v >= 0 ? "num-up" : "num-down";
    return (
      '<div class="mp-quick-metric">' +
      '<span class="mp-qm-label">' +
      label +
      "</span>" +
      '<span class="mp-qm-val ' +
      colorClass +
      '">' +
      (v >= 0 ? "+" : "") +
      value +
      "%</span>" +
      "</div>"
    );
  }

  function buildMetricsBlock(series) {
    var spx = calcChange(series, "SPX");
    var vix = calcChange(series, "VIX");
    var html = buildMetricHtml("SPX", spx) + buildMetricHtml("VIX", vix);
    return html ? '<div class="mp-quick-metrics">' + html + "</div>" : "";
  }

  // ── DOM builder ──

  function findArticleHeader() {
    return (
      document.querySelector("header.mt-12") ||
      document.querySelector("article header") ||
      document.querySelector("#single_header")
    );
  }

  /** hero DOM 생성 (regime/metrics는 비어있을 수 있음) */
  function createHeroElement(opts) {
    var hero = document.createElement("div");
    hero.className = "mp-post-hero";
    hero.id = "mp-regime-hero";

    var regime = opts.regime || "";
    var regimeIcon = opts.regimeIcon || "";
    var summary = opts.summary || "";
    var metricsHtml = opts.metricsHtml || "";

    if (regime) {
      var c = getRegimeColor(regime, opts.colorMap, opts.rgbMap);
      hero.style.borderLeftColor = c.color;
    }

    hero.innerHTML =
      '<div class="mp-post-hero__top">' +
      '<div class="mp-post-hero__badges">' +
      (regime
        ? '<span class="mp-regime-badge">' +
          regimeIcon +
          " " +
          regime +
          "</span>"
        : '<span class="mp-regime-badge mp-regime-badge--pending"></span>') +
      metricsHtml +
      "</div>" +
      "</div>" +
      (summary ? '<p class="mp-post-hero__summary">' + summary + "</p>" : "");

    return hero;
  }

  // ── Phase 2: async chart data fallback ──

  function listenChartData(colorMap, rgbMap) {
    function onChartReady(e) {
      var data = (e && e.detail) || window.__MP_CHART_DATA;
      if (!data) return;

      var hero = document.getElementById("mp-regime-hero");
      if (!hero) return;

      var badge = hero.querySelector(".mp-regime-badge");
      var alreadyFilled = badge && badge.textContent.trim().length > 0;

      // regime 채우기 (Phase 1에서 비었을 경우만)
      if (!alreadyFilled && data.regime && data.regime.current) {
        var r = data.regime;
        applyRegimeCSS(r.current, colorMap, rgbMap);

        var c = getRegimeColor(r.current, colorMap, rgbMap);
        hero.style.borderLeftColor = c.color;

        if (badge) {
          badge.classList.remove("mp-regime-badge--pending");
          badge.textContent = (r.icon || "") + " " + r.current;
        }

        // summary
        if (r.summary && !hero.querySelector(".mp-post-hero__summary")) {
          var p = document.createElement("p");
          p.className = "mp-post-hero__summary";
          p.textContent = r.summary;
          hero.appendChild(p);
        }
      }

      // quick metrics 채우기 (없을 때만)
      if (
        !hero.querySelector(".mp-quick-metrics") &&
        data.timeSeries &&
        data.timeSeries.series
      ) {
        var metricsHtml = buildMetricsBlock(data.timeSeries.series);
        if (metricsHtml) {
          var badges = hero.querySelector(".mp-post-hero__badges");
          if (badges) {
            badges.insertAdjacentHTML("beforeend", metricsHtml);
          }
        }
      }

      document.removeEventListener("mp:chart-data-ready", onChartReady);
    }

    // 이미 로드되었을 수 있음
    if (window.__MP_CHART_DATA) {
      onChartReady({ detail: window.__MP_CHART_DATA });
      return;
    }

    // chart 로더(market-charts-loader.js)가 실행되면 이벤트를 받는다
    document.addEventListener("mp:chart-data-ready", onChartReady);

    // chart 로더가 안 돌 수 있음 (market-charts-root 없는 포스트)
    // 일정 시간 후 아직 데이터가 없으면 직접 fetch
    var mp = window.__MP_PAGE;
    if (mp && mp.chartData && !document.getElementById("market-charts-root")) {
      fetch(mp.chartData)
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (data) {
          if (data && !window.__MP_CHART_DATA) {
            window.__MP_CHART_DATA = data;
            onChartReady({ detail: data });
          }
        })
        .catch(function () {
          /* chart 없어도 치명적이지 않음 */
        });
    }
  }

  // ── main entry ──

  ns.injectRegimeHero = function (
    content,
    findSectionByTitle,
    regimeColorMap,
    regimeColorRgbMap,
  ) {
    if (!content || !window.__MP_PAGE) return;

    var mp = window.__MP_PAGE;
    var colorMap = regimeColorMap || {};
    var rgbMap = regimeColorRgbMap || {};

    // Phase 1 (sync): front matter에 regime이 있으면 즉시 렌더
    if (mp.regime) {
      applyRegimeCSS(mp.regime, colorMap, rgbMap);
    }

    var articleHeader = findArticleHeader();
    if (articleHeader) {
      var hero = createHeroElement({
        regime: mp.regime,
        regimeIcon: mp.regimeIcon,
        summary: mp.summary,
        metricsHtml: "", // Phase 2에서 채움
        colorMap: colorMap,
        rgbMap: rgbMap,
      });
      articleHeader.after(hero);
    }

    // Phase 2 (async): chart JSON에서 빠진 데이터 보충
    listenChartData(colorMap, rgbMap);

    // 한줄 요약 섹션 숨기기 (hero에 통합)
    if (typeof findSectionByTitle === "function") {
      var summarySection = findSectionByTitle(
        content,
        "\uD55C\uC904 \uC694\uC57D",
      );
      if (summarySection) summarySection.style.display = "none";
    }
  };
})();
