(function () {
  "use strict";

  var MPCharts = (window.MPCharts = window.MPCharts || {});
  MPCharts._data = null;

  var MP_CONFIG = window.MP_CONFIG || {};
  var CHART_CONFIG = MP_CONFIG.charts || {};
  var PALETTE = CHART_CONFIG.palette || {};
  var METRIC_PALETTE = CHART_CONFIG.metric_colors || {};
  var REGIME_SCORE_MAP = CHART_CONFIG.regime_score || {};
  var MOBILE_BREAKPOINT = Number(CHART_CONFIG.mobile_breakpoint || 640);
  var THEME_RERENDER_DELAY_MS = Number(
    CHART_CONFIG.theme_rerender_delay_ms || 150,
  );

  var COLORS = {
    primary: PALETTE.primary || "#7C3AED",
    cyan: PALETTE.cyan || "#00F0FF",
    pink: PALETTE.pink || "#FF3366",
    blue: PALETTE.blue || "#3388FF",
    yellow: PALETTE.yellow || "#FFD600",
    green: PALETTE.green || "#00FF88",
    muted: PALETTE.muted || "#64748B",
    bg: PALETTE.bg || "#0A0A1A",
    text: PALETTE.text || "#E2E8F0",
    textLight: PALETTE.text_light || "#94A3B8",
    textDark: PALETTE.text_dark || "#1E1E3A",
    borderLight: PALETTE.border_light || "#cbd5e1",
    gridLight: PALETTE.grid_light || "#f1f5f9",
    successLight: PALETTE.success_light || "#DC2626",
    dangerLight: PALETTE.danger_light || "#2563EB",
    panic: PALETTE.panic || "#ff0040",
    white: PALETTE.white || "#fff",
    headerDark: PALETTE.header_dark || "#475569",
  };

  var METRIC_COLORS = {
    SPX: METRIC_PALETTE.SPX || "#00F0FF",
    NDX: METRIC_PALETTE.NDX || "#7C3AED",
    DJI: METRIC_PALETTE.DJI || "#34d399",
    VIX: METRIC_PALETTE.VIX || "#f87171",
    BTC: METRIC_PALETTE.BTC || "#fbbf24",
    USDKRW: METRIC_PALETTE.USDKRW || "#06b6d4",
    GOLD: METRIC_PALETTE.GOLD || "#eab308",
    OIL: METRIC_PALETTE.OIL || "#a8a29e",
    US10Y: METRIC_PALETTE.US10Y || "#f472b6",
  };

  function isDarkMode() {
    return (
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark")
    );
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getTheme() {
    var dark = isDarkMode();
    return {
      bg: "transparent",
      text: dark ? COLORS.text : COLORS.textDark,
      axis: dark ? "rgba(124, 58, 237, 0.25)" : COLORS.borderLight,
      grid: dark ? "rgba(124, 58, 237, 0.1)" : COLORS.gridLight,
      success: dark ? COLORS.pink : COLORS.successLight,
      danger: dark ? COLORS.blue : COLORS.dangerLight,
    };
  }

  function getTooltipStyle() {
    var dark = isDarkMode();
    return {
      backgroundColor: dark
        ? "rgba(10, 10, 26, 0.92)"
        : "rgba(255, 255, 255, 0.98)",
      borderColor: dark ? "rgba(0, 240, 255, 0.4)" : "rgba(124, 58, 237, 0.3)",
      borderWidth: 1,
      borderRadius: 4,
      padding: 12,
      textStyle: {
        color: dark ? COLORS.text : COLORS.textDark,
        fontSize: 12,
        fontFamily: "Noto Sans KR, sans-serif",
        lineHeight: 18,
      },
      extraCssText: dark
        ? "box-shadow: 0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05); backdrop-filter: blur(10px);"
        : "box-shadow: 0 8px 24px rgba(0,0,0,0.12);",
    };
  }

  function createChart(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var existing = echarts.getInstanceByDom(el);
    if (existing) existing.dispose();
    return echarts.init(el, isDarkMode() ? "dark" : null);
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  // ===== 차트 1: 시계열 추이 (Normalized Trend) =====
  function renderTimeSeries(data) {
    var chart = createChart("chart-timeseries");
    if (!chart || !data.timeSeries) return;

    var timeSeries = data.timeSeries;
    var dates = timeSeries.dates;
    var series = timeSeries.series;
    var theme = getTheme();
    var dark = isDarkMode();

    function normalizeToPercent(arr) {
      if (!arr || arr.length === 0) return arr;
      var base = null;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== null && arr[i] !== undefined) {
          base = arr[i];
          break;
        }
      }
      if (base === null) return arr;
      return arr.map(function (v) {
        if (v === null || v === undefined) return null;
        return +(((v - base) / base) * 100).toFixed(2);
      });
    }

    var leftKeys = [
      "SPX",
      "NDX",
      "DJI",
      "BTC",
      "GOLD",
      "OIL",
      "USDKRW",
      "US10Y",
    ];
    var rightKeys = ["VIX"];
    // series는 { SPX: [...], NDX: [...] } 형태의 객체
    var seriesKeys = Object.keys(series).filter(function (k) {
      return leftKeys.indexOf(k) > -1 || rightKeys.indexOf(k) > -1;
    });
    var chartSeries = [];

    seriesKeys.forEach(function (key) {
      var data = series[key];
      if (!data || data.length === 0) return;
      var isRight = rightKeys.indexOf(key) > -1;
      var color = METRIC_COLORS[key] || COLORS.primary;
      var isMajorIndex = ["SPX", "NDX", "DJI"].indexOf(key) > -1;
      var isArea = isMajorIndex;
      var lineWidth = isRight ? 1.5 : isMajorIndex ? 2 : 1.5;

      var seriesObj = {
        name: key,
        type: "line",
        yAxisIndex: isRight ? 1 : 0,
        data: normalizeToPercent(data),
        showSymbol: false,
        smooth: true,
        connectNulls: false,
        lineStyle: { width: lineWidth, color: color },
        itemStyle: { color: color },
        emphasis: { lineStyle: { width: 3 } },
      };

      if (isArea) {
        seriesObj.areaStyle = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(color, 0.15) },
            { offset: 1, color: hexToRgba(color, 0.02) },
          ]),
        };
      }
      chartSeries.push(seriesObj);
    });

    var tooltipStyle = getTooltipStyle();
    tooltipStyle.trigger = "axis";
    tooltipStyle.formatter = function (params) {
      var res =
        '<div style="margin-bottom:8px; font-weight:700; color:' +
        (dark ? COLORS.cyan : COLORS.primary) +
        '">' +
        params[0].name +
        "</div>";
      params.forEach(function (item) {
        var val = item.value;
        if (val === null || val === undefined) return;
        var sign = val > 0 ? "+" : "";
        res +=
          '<div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:4px;">' +
          '<span style="color:' +
          theme.text +
          '">' +
          item.seriesName +
          "</span>" +
          '<span style="font-weight:700; color:' +
          (val >= 0 ? theme.success : theme.danger) +
          '">' +
          sign +
          val +
          "%</span>" +
          "</div>";
      });
      return res;
    };

    chart.setOption({
      backgroundColor: theme.bg,
      tooltip: tooltipStyle,
      legend: {
        data: seriesKeys,
        bottom: 0,
        textStyle: { color: theme.text, fontSize: 10 },
        itemWidth: 12,
        itemHeight: 8,
        selected: {
          BTC: false,
          GOLD: false,
          OIL: false,
          USDKRW: false,
          US10Y: false,
        },
      },
      grid: {
        top: 30,
        left: "3%",
        right: "3%",
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: { color: theme.text, fontSize: 10 },
        axisLine: { lineStyle: { color: theme.axis } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          position: "left",
          axisLabel: { color: theme.text, fontSize: 10, formatter: "{value}%" },
          splitLine: { lineStyle: { color: theme.grid } },
          axisLine: { lineStyle: { color: theme.axis } },
        },
        {
          type: "value",
          position: "right",
          axisLabel: { color: theme.text, fontSize: 10, formatter: "{value}%" },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: theme.axis } },
        },
      ],
      series: chartSeries,
    });
  }

  // ===== 차트 2: 상관관계 (Correlations) =====
  function renderCorrelations(data) {
    var chart = createChart("chart-correlations");
    if (!chart || !data.correlations) return;

    var correlations = data.correlations;
    var theme = getTheme();
    var dark = isDarkMode();
    var threshold = 0.5;

    function getCorrColor(val) {
      if (val >= threshold) return theme.success;
      if (val <= -threshold) return theme.danger;
      return theme.text;
    }

    var sorted = correlations.slice().sort(function (a, b) {
      return b.value - a.value;
    });

    var labels = sorted.map(function (c) {
      return c.labels ? c.labels.join(" / ") : c.pair;
    });
    var values = sorted.map(function (c) {
      return c.value;
    });

    var tooltipStyle = getTooltipStyle();
    tooltipStyle.trigger = "axis";
    tooltipStyle.axisPointer = { type: "shadow" };
    tooltipStyle.formatter = function (params) {
      var p = params[0];
      var sign = p.value > 0 ? "+" : "";
      return (
        '<div style="font-weight:700; margin-bottom:4px;">' +
        p.name +
        "</div>" +
        '<div style="color:' +
        getCorrColor(p.value) +
        '; font-weight:800; font-size:14px;">' +
        sign +
        p.value.toFixed(2) +
        "</div>"
      );
    };

    chart.setOption({
      backgroundColor: theme.bg,
      tooltip: tooltipStyle,
      grid: {
        left: "3%",
        right: "8%",
        top: "5%",
        bottom: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        min: -1,
        max: 1,
        interval: 0.5,
        axisLabel: { color: theme.text, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.grid, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: labels,
        inverse: true,
        axisLabel: { color: theme.text, fontSize: 10 },
        axisLine: { lineStyle: { color: theme.axis } },
      },
      series: [
        {
          type: "bar",
          data: values.map(function (v) {
            return {
              value: v,
              itemStyle: {
                color: getCorrColor(v),
                borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
              },
            };
          }),
          barWidth: isMobile() ? 12 : 18,
        },
      ],
    });
  }

  // ===== 차트 3: 시장 국면 (Regime Gauge) =====
  function renderRegime(data) {
    var chart = createChart("chart-regime");
    if (!chart || !data.regime) return;

    var regime = data.regime;
    var theme = getTheme();
    var dark = isDarkMode();

    var regimeScore = {
      RISK_ON: Number(REGIME_SCORE_MAP.RISK_ON || 85),
      CAUTIOUS: Number(REGIME_SCORE_MAP.CAUTIOUS || 55),
      RISK_OFF: Number(REGIME_SCORE_MAP.RISK_OFF || 30),
      PANIC: Number(REGIME_SCORE_MAP.PANIC || 10),
    };
    var score = regimeScore[regime.current] || 50;

    var regimeColor =
      score >= 75
        ? COLORS.green
        : score >= 50
          ? COLORS.yellow
          : score >= 25
            ? COLORS.pink
            : COLORS.panic;

    var tooltipStyle = getTooltipStyle();
    tooltipStyle.trigger = "item";
    tooltipStyle.formatter = function () {
      return "<b>" + regime.label + "</b><br/>Score: " + score + "/100";
    };

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: tooltipStyle,
      series: [
        {
          type: "gauge",
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          radius: "95%",
          progress: { show: true, width: 8, itemStyle: { color: regimeColor } },
          pointer: {
            length: "12%",
            width: 6,
            offsetCenter: [0, "-60%"],
            itemStyle: { color: regimeColor },
          },
          axisLine: { lineStyle: { width: 8, color: [[1, theme.grid]] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { distance: -45, color: theme.text, fontSize: 10 },
          detail: {
            offsetCenter: [0, "30%"],
            formatter: function () {
              return (
                "{icon|" +
                (regime.icon || "―") +
                "}\n{label|" +
                regime.label +
                "}"
              );
            },
            rich: {
              icon: { fontSize: 24, padding: [0, 0, 5, 0] },
              label: { fontSize: 14, fontWeight: 700, color: theme.text },
            },
          },
          data: [{ value: score }],
        },
      ],
    });
  }

  // ===== 차트 4: 섹터 강도 (Sectors) =====
  function renderSectors(data) {
    if (!data.sectorStrength) return;
    var ss = data.sectorStrength;

    function renderSingle(id, items) {
      var el = document.getElementById(id);
      if (!el || !items) return;
      var chart = createChart(id);
      var theme = getTheme();

      var sorted = items.slice().sort(function (a, b) {
        return b.week1 - a.week1;
      });
      var names = sorted.map(function (s) {
        return s.name;
      });
      var week1Values = sorted.map(function (s) {
        return s.week1;
      });
      var month1Values = sorted.map(function (s) {
        return s.month1 !== undefined && s.month1 !== null ? s.month1 : null;
      });
      var hasMonth1 = month1Values.some(function (v) {
        return v !== null;
      });

      var tooltipStyle = getTooltipStyle();
      tooltipStyle.trigger = "axis";
      tooltipStyle.axisPointer = { type: "shadow" };
      tooltipStyle.formatter = function (params) {
        var name = params[0].name;
        var lines =
          '<div style="font-weight:700; margin-bottom:6px;">' + name + "</div>";
        params.forEach(function (p) {
          if (p.value === null || p.value === undefined) return;
          var sign = p.value >= 0 ? "+" : "";
          lines +=
            '<div style="display:flex; justify-content:space-between; gap:16px; margin-bottom:3px;">' +
            '<span style="color:' +
            p.color +
            '">' +
            p.seriesName +
            "</span>" +
            '<span style="font-weight:700; color:' +
            (p.value >= 0 ? theme.success : theme.danger) +
            '">' +
            sign +
            p.value.toFixed(2) +
            "%</span>" +
            "</div>";
        });
        return lines;
      };

      var seriesArr = [
        {
          name: "1주",
          type: "bar",
          data: week1Values.map(function (v) {
            return {
              value: v,
              itemStyle: {
                color: v >= 0 ? theme.success : theme.danger,
                borderRadius: v >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3],
              },
            };
          }),
          barCategoryGap: "30%",
          barGap: "5%",
        },
      ];

      if (hasMonth1) {
        seriesArr.push({
          name: "1개월",
          type: "bar",
          data: month1Values.map(function (v) {
            if (v === null) return { value: null };
            return {
              value: v,
              itemStyle: {
                color:
                  v >= 0
                    ? hexToRgba(
                        theme.success.startsWith("rgba")
                          ? "#00FF88"
                          : theme.success,
                        0.45,
                      )
                    : hexToRgba(
                        theme.danger.startsWith("rgba")
                          ? "#3388FF"
                          : theme.danger,
                        0.45,
                      ),
                borderRadius: v >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3],
              },
            };
          }),
          barCategoryGap: "30%",
          barGap: "5%",
        });
      }

      chart.setOption({
        backgroundColor: "transparent",
        tooltip: tooltipStyle,
        legend: {
          data: hasMonth1 ? ["1주", "1개월"] : ["1주"],
          top: 0,
          right: 0,
          textStyle: { color: theme.text, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 8,
        },
        grid: {
          left: "3%",
          right: "10%",
          top: hasMonth1 ? "28px" : "5%",
          bottom: "5%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLabel: { color: theme.text, fontSize: 10, formatter: "{value}%" },
          splitLine: { lineStyle: { color: theme.grid, type: "dashed" } },
        },
        yAxis: {
          type: "category",
          data: names,
          inverse: true,
          axisLabel: { color: theme.text, fontSize: 11 },
        },
        series: seriesArr,
      });
    }

    if (ss.us) renderSingle("chart-sectors-us", ss.us);
    if (ss.kr) renderSingle("chart-sectors-kr", ss.kr);
  }

  // ===== 글로벌 진입점 =====
  MPCharts.renderAllCharts = function (data) {
    if (!data) return;
    MPCharts._data = data;
    renderTimeSeries(data);
    renderCorrelations(data);
    renderRegime(data);
    renderSectors(data);
  };

  // 구형 호환성을 위한 shim (market-charts-loader.js에서 사용 중)
  window.renderAllCharts = MPCharts.renderAllCharts;

  // 테마 변경 감지 및 리렌더링
  (function () {
    var lastTheme = isDarkMode();
    var timer = null;

    var observer = new MutationObserver(function () {
      var currentTheme = isDarkMode();
      if (currentTheme !== lastTheme) {
        lastTheme = currentTheme;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          if (MPCharts._data) MPCharts.renderAllCharts(MPCharts._data);
        }, THEME_RERENDER_DELAY_MS);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  })();
})();
