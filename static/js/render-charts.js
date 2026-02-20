(function () {
  "use strict";

  var MPCharts = (window.MPCharts = window.MPCharts || {});
  MPCharts._data = null;
  MPCharts._instances = [];

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

  // 공통 폰트
  var FONT = "Noto Sans KR, -apple-system, BlinkMacSystemFont, sans-serif";

  // 공통 애니메이션 설정
  var ANIMATION = {
    duration: 800,
    easing: "cubicOut",
    delay: function (idx) {
      return idx * 60;
    },
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
      textMuted: dark ? COLORS.textLight : COLORS.headerDark,
      axis: dark ? "rgba(124, 58, 237, 0.25)" : COLORS.borderLight,
      grid: dark ? "rgba(124, 58, 237, 0.15)" : COLORS.gridLight,
      success: dark ? COLORS.pink : COLORS.successLight,
      danger: dark ? COLORS.blue : COLORS.dangerLight,
    };
  }

  function getTooltipStyle() {
    var dark = isDarkMode();
    return {
      appendToBody: true,
      backgroundColor: dark
        ? "rgba(10, 10, 26, 0.95)"
        : "rgba(255, 255, 255, 0.98)",
      borderColor: dark ? "rgba(0, 240, 255, 0.4)" : "rgba(124, 58, 237, 0.3)",
      borderWidth: 1,
      borderRadius: 8,
      padding: [12, 16],
      textStyle: {
        color: dark ? COLORS.text : COLORS.textDark,
        fontSize: 12,
        fontFamily: "Noto Sans KR, sans-serif",
        lineHeight: 20,
      },
      extraCssText: dark
        ? "box-shadow: 0 0 12px rgba(0, 240, 255, 0.25), 0 8px 32px rgba(0, 240, 255, 0.15), inset 0 0 12px rgba(0, 240, 255, 0.06); backdrop-filter: blur(14px); border: 1px solid rgba(0, 240, 255, 0.15);"
        : "box-shadow: 0 8px 32px rgba(0,0,0,0.15); backdrop-filter: blur(8px);",
    };
  }

  function createChart(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var existing = echarts.getInstanceByDom(el);
    if (existing) existing.dispose();
    var chart = echarts.init(el, isDarkMode() ? "dark" : null, {
      renderer: "svg",
    });
    MPCharts._instances.push(chart);
    return chart;
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  // X축 날짜 축약: "2026-01-26" → "01/26"
  function shortDate(dateStr) {
    if (!dateStr || dateStr.length < 10) return dateStr;
    return dateStr.slice(5, 7) + "/" + dateStr.slice(8, 10);
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
    var mobile = isMobile();

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
    var seriesKeys = Object.keys(series).filter(function (k) {
      return leftKeys.indexOf(k) > -1 || rightKeys.indexOf(k) > -1;
    });
    var chartSeries = [];

    seriesKeys.forEach(function (key) {
      var sData = series[key];
      if (!sData || sData.length === 0) return;
      var isRight = rightKeys.indexOf(key) > -1;
      var color = METRIC_COLORS[key] || COLORS.primary;
      var isMajorIndex = ["SPX", "NDX", "DJI"].indexOf(key) > -1;
      var isArea = isMajorIndex;
      var lineWidth = isRight ? 1.5 : isMajorIndex ? 2.5 : 1.5;
      var normalizedData = normalizeToPercent(sData);

      var seriesObj = {
        name: key,
        type: "line",
        yAxisIndex: isRight ? 1 : 0,
        data: normalizedData,
        showSymbol: false,
        smooth: true,
        connectNulls: false,
        lineStyle: { width: lineWidth, color: color },
        itemStyle: { color: color },
        emphasis: { lineStyle: { width: lineWidth + 1 } },
        animationDuration: ANIMATION.duration,
        animationEasing: ANIMATION.easing,
      };

      // 마지막 데이터포인트에 마커 표시
      if (normalizedData && normalizedData.length > 0) {
        var lastIdx = normalizedData.length - 1;
        while (
          lastIdx >= 0 &&
          (normalizedData[lastIdx] === null ||
            normalizedData[lastIdx] === undefined)
        ) {
          lastIdx--;
        }
        if (lastIdx >= 0) {
          seriesObj.markPoint = {
            symbol: "circle",
            symbolSize: isMajorIndex ? 8 : 6,
            data: [
              {
                coord: [lastIdx, normalizedData[lastIdx]],
                itemStyle: {
                  color: color,
                  borderColor: dark ? COLORS.bg : COLORS.white,
                  borderWidth: 2,
                  shadowColor: hexToRgba(color, 0.7),
                  shadowBlur: 10,
                },
              },
            ],
            label: { show: false },
            animation: true,
          };
        }
      }

      if (isArea) {
        seriesObj.areaStyle = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(color, 0.28) },
            { offset: 0.4, color: hexToRgba(color, 0.1) },
            { offset: 1, color: hexToRgba(color, 0) },
          ]),
        };
      }
      chartSeries.push(seriesObj);
    });

    var tooltipStyle = getTooltipStyle();
    tooltipStyle.trigger = "axis";
    tooltipStyle.axisPointer = {
      type: "cross",
      lineStyle: {
        color: dark ? "rgba(0, 240, 255, 0.3)" : "rgba(124, 58, 237, 0.3)",
        type: "dashed",
      },
      crossStyle: {
        color: dark ? "rgba(0, 240, 255, 0.3)" : "rgba(124, 58, 237, 0.3)",
      },
      label: {
        backgroundColor: dark
          ? "rgba(10, 10, 26, 0.9)"
          : "rgba(255, 255, 255, 0.95)",
      },
    };
    tooltipStyle.formatter = function (params) {
      var res =
        '<div style="margin-bottom:8px; font-weight:700; font-size:13px; color:' +
        (dark ? COLORS.cyan : COLORS.primary) +
        '">' +
        params[0].name +
        "</div>";
      params.forEach(function (item) {
        var val = item.value;
        if (val === null || val === undefined) return;
        var sign = val > 0 ? "+" : "";
        res +=
          '<div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:4px; align-items:center;">' +
          '<span style="display:inline-flex; align-items:center; gap:6px; color:' +
          theme.text +
          '"><span style="display:inline-block;width:8px;height:3px;border-radius:2px;background:' +
          item.color +
          '"></span>' +
          item.seriesName +
          "</span>" +
          '<span style="font-weight:700; font-variant-numeric:tabular-nums; color:' +
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
      textStyle: { fontFamily: FONT, fontWeight: 500 },
      tooltip: tooltipStyle,
      legend: {
        data: seriesKeys,
        bottom: 0,
        textStyle: { color: theme.text, fontSize: mobile ? 10 : 11 },
        itemWidth: 12,
        itemHeight: 3,
        itemGap: mobile ? 8 : 12,
        icon: "roundRect",
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
        axisLabel: {
          color: theme.textMuted,
          fontSize: mobile ? 10 : 11,
          fontWeight: 500,
          formatter: shortDate,
          rotate: mobile ? 45 : 0,
        },
        axisLine: { lineStyle: { color: theme.axis } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          position: "left",
          axisLabel: {
            color: theme.textMuted,
            fontSize: 11,
            fontWeight: 500,
            formatter: "{value}%",
          },
          splitLine: { lineStyle: { color: theme.grid, type: "dashed" } },
          axisLine: { show: false },
        },
        {
          type: "value",
          position: "right",
          axisLabel: {
            color: theme.textMuted,
            fontSize: 11,
            fontWeight: 500,
            formatter: "{value}%",
          },
          splitLine: { show: false },
          axisLine: { show: false },
        },
      ],
      series: chartSeries,
      animationDuration: ANIMATION.duration,
      animationEasing: ANIMATION.easing,
    });
  }

  // ===== 차트 2: 상관관계 (Correlations) =====
  function renderCorrelations(data) {
    var chart = createChart("chart-correlations");
    if (!chart || !data.correlations) return;

    var correlations = data.correlations;
    var theme = getTheme();
    var dark = isDarkMode();
    var mobile = isMobile();

    // 값 크기에 따른 색상 (항상 hex 반환)
    function getCorrBaseHex(val) {
      var abs = Math.abs(val);
      if (abs >= 0.4) return val > 0 ? COLORS.pink : COLORS.blue;
      if (abs >= 0.2) return dark ? COLORS.cyan : COLORS.primary;
      return dark ? COLORS.textLight : COLORS.headerDark;
    }

    function getCorrOpacity(val) {
      var abs = Math.abs(val);
      if (abs >= 0.7) return 1;
      if (abs >= 0.4) return 0.75;
      if (abs >= 0.2) return 0.6;
      return 0.45;
    }

    function getCorrTextColor(val) {
      var abs = Math.abs(val);
      if (abs >= 0.4) return val > 0 ? theme.success : theme.danger;
      return theme.textMuted;
    }

    var sorted = correlations.slice().sort(function (a, b) {
      return b.value - a.value;
    });

    var labels = sorted.map(function (c) {
      return c.labels ? c.labels.join(" / ") : c.pair;
    });
    var statusLabels = sorted.map(function (c) {
      return c.status || "";
    });
    var meaningLabels = sorted.map(function (c) {
      return c.meaning || "";
    });
    var values = sorted.map(function (c) {
      return c.value;
    });

    var tooltipStyle = getTooltipStyle();
    tooltipStyle.trigger = "axis";
    tooltipStyle.axisPointer = { type: "shadow" };
    tooltipStyle.formatter = function (params) {
      var p = params[0];
      var idx = p.dataIndex;
      var item = sorted[idx];
      var sign = p.value > 0 ? "+" : "";
      var lines =
        '<div style="font-weight:700; margin-bottom:6px; font-size:13px;">' +
        p.name +
        "</div>" +
        '<div style="color:' +
        getCorrTextColor(p.value) +
        '; font-weight:800; font-size:16px; margin-bottom:4px;">' +
        sign +
        p.value.toFixed(2) +
        "</div>";
      if (item.status) {
        lines +=
          '<div style="font-size:11px; color:' +
          theme.textMuted +
          ';">' +
          item.status;
        if (item.meaning) lines += " · " + item.meaning;
        lines += "</div>";
      }
      return lines;
    };

    // X축 범위를 데이터에 맞게 동적 계산 (최소 ±0.3, 최대 ±1.0)
    var maxAbs = 0;
    values.forEach(function (v) {
      var abs = Math.abs(v);
      if (abs > maxAbs) maxAbs = abs;
    });
    var rawRange = Math.max(
      0.25,
      Math.min(1.0, Math.ceil(maxAbs * 10) / 10 + 0.05),
    );
    var axisInterval = rawRange <= 0.5 ? 0.1 : 0.25;
    // 축 범위를 interval 배수로 맞춰 라벨 중복 방지
    var axisRange = Math.ceil(rawRange / axisInterval) * axisInterval;

    chart.setOption({
      backgroundColor: theme.bg,
      textStyle: { fontFamily: FONT, fontWeight: 500 },
      tooltip: tooltipStyle,
      grid: {
        left: mobile ? "5%" : "5%",
        right: mobile ? "16%" : "14%",
        top: "5%",
        bottom: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        min: -axisRange,
        max: axisRange,
        interval: axisInterval,
        axisLabel: {
          color: theme.textMuted,
          fontSize: 11,
          fontWeight: 500,
          formatter: function (v) {
            return v === 0 ? "0" : (v > 0 ? "+" : "") + v.toFixed(1);
          },
          hideOverlap: true,
        },
        splitLine: {
          lineStyle: {
            color: theme.grid,
            type: [3, 5],
          },
        },
        axisLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: labels,
        inverse: true,
        axisLabel: {
          color: theme.text,
          fontSize: mobile ? 10 : 11,
          width: mobile ? 100 : 130,
          overflow: "truncate",
          formatter: function (value, index) {
            return "{name|" + value + "}\n{status|" + statusLabels[index] + "}";
          },
          rich: {
            name: {
              color: theme.text,
              fontSize: mobile ? 10 : 11,
              fontWeight: 500,
              lineHeight: 16,
            },
            status: {
              color: dark
                ? "rgba(0, 240, 255, 0.6)"
                : "rgba(124, 58, 237, 0.6)",
              fontSize: mobile ? 8 : 9,
              lineHeight: 14,
              fontWeight: 600,
            },
          },
        },
        axisLine: {
          lineStyle: {
            color: dark
              ? "rgba(0, 240, 255, 0.15)"
              : "rgba(124, 58, 237, 0.15)",
          },
        },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: values.map(function (v, i) {
            var baseHex = getCorrBaseHex(v);
            var opacity = getCorrOpacity(v);
            return {
              value: v,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  v >= 0 ? 0 : 1,
                  0,
                  v >= 0 ? 1 : 0,
                  0,
                  [
                    { offset: 0, color: hexToRgba(baseHex, 0.1) },
                    { offset: 0.5, color: hexToRgba(baseHex, opacity * 0.6) },
                    { offset: 1, color: hexToRgba(baseHex, opacity) },
                  ],
                ),
                borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
                shadowColor: hexToRgba(baseHex, 0.25),
                shadowBlur: 6,
              },
              emphasis: {
                itemStyle: {
                  shadowColor: hexToRgba(baseHex, 0.5),
                  shadowBlur: 14,
                },
              },
              label: {
                show: true,
                position: v >= 0 ? "right" : "left",
                formatter: (v > 0 ? "+" : "") + v.toFixed(2),
                color: getCorrTextColor(v),
                fontSize: mobile ? 10 : 12,
                fontWeight: 700,
                textShadowColor: hexToRgba(baseHex, 0.4),
                textShadowBlur: 4,
              },
            };
          }),
          barWidth: mobile ? 20 : 26,
          // 제로 라인 글로우
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: {
              color: dark
                ? "rgba(0, 240, 255, 0.6)"
                : "rgba(124, 58, 237, 0.5)",
              width: 2,
              type: [4, 4],
              shadowColor: dark
                ? "rgba(0, 240, 255, 0.3)"
                : "rgba(124, 58, 237, 0.2)",
              shadowBlur: 8,
            },
            data: [{ xAxis: 0 }],
            label: { show: false },
          },
          animationDuration: ANIMATION.duration,
          animationEasing: ANIMATION.easing,
          animationDelay: ANIMATION.delay,
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
      var lines = "<b>" + regime.label + "</b><br/>Score: " + score + "/100";
      if (regime.summary) {
        lines +=
          '<br/><span style="font-size:11px; color:' +
          theme.textMuted +
          '">' +
          regime.summary +
          "</span>";
      }
      return lines;
    };

    chart.setOption({
      backgroundColor: "transparent",
      textStyle: { fontFamily: FONT, fontWeight: 500 },
      tooltip: tooltipStyle,
      series: [
        {
          type: "gauge",
          center: ["50%", "55%"],
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          radius: "80%",
          progress: {
            show: true,
            width: 12,
            itemStyle: {
              color: regimeColor,
              shadowColor: hexToRgba(regimeColor, 0.6),
              shadowBlur: 16,
            },
          },
          pointer: {
            length: "22%",
            width: 6,
            offsetCenter: [0, "-60%"],
            itemStyle: {
              color: regimeColor,
              shadowColor: hexToRgba(regimeColor, 0.7),
              shadowBlur: 12,
            },
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.25, hexToRgba(COLORS.panic, dark ? 0.2 : 0.12)],
                [0.5, hexToRgba(COLORS.pink, dark ? 0.15 : 0.1)],
                [0.75, hexToRgba(COLORS.yellow, dark ? 0.15 : 0.1)],
                [1, hexToRgba(COLORS.green, dark ? 0.15 : 0.1)],
              ],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            distance: -45,
            color: theme.textMuted,
            fontSize: 11,
            fontWeight: 500,
          },
          detail: {
            offsetCenter: [0, "30%"],
            formatter: function () {
              return (
                "{icon|" +
                (regime.icon || "―") +
                "}\n{label|" +
                regime.label +
                "}\n{score|" +
                score +
                "}"
              );
            },
            rich: {
              icon: { fontSize: 26, padding: [0, 0, 6, 0] },
              label: {
                fontSize: 15,
                fontWeight: 700,
                color: theme.text,
                padding: [0, 0, 4, 0],
              },
              score: {
                fontSize: 18,
                fontWeight: 800,
                color: regimeColor,
                padding: [4, 0, 0, 0],
                textShadowColor: hexToRgba(regimeColor, 0.5),
                textShadowBlur: 8,
              },
            },
          },
          data: [{ value: score }],
          animationDuration: ANIMATION.duration + 400,
          animationEasing: "elasticOut",
        },
      ],
    });
  }

  // ===== 차트 4: 섹터 강도 (Sectors) =====

  // US↔KR 비교를 위한 고정 섹터 순서 (같은 행 = 같은 업종)
  var SECTOR_ORDER = {
    // US sectors
    테크: 0,
    반도체: 1,
    에너지: 2,
    금융: 3,
    산업: 4,
    헬스케어: 5,
    소비재: 6,
    // KR sectors (대응되는 업종과 같은 순서)
    IT: 0,
    /* 반도체: 1 */ /* 에너지: 2 */ 은행: 3,
    자동차: 4,
    바이오: 5,
    "2차전지": 6,
  };

  function renderSectors(data) {
    if (!data.sectorStrength) return;
    var ss = data.sectorStrength;

    function renderSingle(id, items) {
      var el = document.getElementById(id);
      if (!el || !items) return;
      var chart = createChart(id);
      var theme = getTheme();
      var dark = isDarkMode();
      var mobile = isMobile();

      var sorted = items.slice().sort(function (a, b) {
        var orderA =
          SECTOR_ORDER[a.name] !== undefined ? SECTOR_ORDER[a.name] : 99;
        var orderB =
          SECTOR_ORDER[b.name] !== undefined ? SECTOR_ORDER[b.name] : 99;
        return orderA - orderB;
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

      // 최강/최약 인덱스
      var maxIdx = 0;
      var minIdx = 0;
      week1Values.forEach(function (v, i) {
        if (v > week1Values[maxIdx]) maxIdx = i;
        if (v < week1Values[minIdx]) minIdx = i;
      });

      // IQR 기반 x축 범위 계산 — 아웃라이어가 축을 과도하게 늘리는 것 방지
      var allValues = week1Values.concat(
        month1Values.filter(function (v) {
          return v !== null;
        }),
      );
      var sortedVals = allValues.slice().sort(function (a, b) {
        return a - b;
      });
      var q1 = sortedVals[Math.floor(sortedVals.length * 0.25)];
      var q3 = sortedVals[Math.floor(sortedVals.length * 0.75)];
      var iqr = q3 - q1;
      var lowerFence = q1 - 1.5 * iqr;
      var upperFence = q3 + 1.5 * iqr;
      var sectorAxisMin = Math.min(-5, Math.floor(lowerFence / 5) * 5);
      var sectorAxisMax = Math.max(5, Math.ceil(upperFence / 5) * 5);

      // 아웃라이어 바를 축 범위로 클램핑하는 헬퍼
      function clampValue(v) {
        return Math.max(sectorAxisMin, Math.min(sectorAxisMax, v));
      }

      var tooltipStyle = getTooltipStyle();
      tooltipStyle.trigger = "axis";
      tooltipStyle.axisPointer = { type: "shadow" };
      tooltipStyle.formatter = function (params) {
        var name = params[0].name;
        var lines =
          '<div style="font-weight:700; margin-bottom:6px; font-size:13px;">' +
          name +
          "</div>";
        params.forEach(function (p) {
          if (p.value === null || p.value === undefined) return;
          // 클램핑된 바의 원본값 사용
          var orig =
            p.data && p.data._orig !== undefined ? p.data._orig : p.value;
          var sign = orig >= 0 ? "+" : "";
          lines +=
            '<div style="display:flex; justify-content:space-between; gap:16px; margin-bottom:3px; align-items:center;">' +
            '<span style="display:inline-flex; align-items:center; gap:6px; color:' +
            p.color +
            '"><span style="display:inline-block;width:8px;height:3px;border-radius:2px;background:' +
            p.color +
            '"></span>' +
            p.seriesName +
            "</span>" +
            '<span style="font-weight:700; font-variant-numeric:tabular-nums; color:' +
            (orig >= 0 ? theme.success : theme.danger) +
            '">' +
            sign +
            orig.toFixed(2) +
            "%</span>" +
            "</div>";
        });
        return lines;
      };

      // 양수/음수용 그라디언트 색상
      var successHex = dark ? "#FF3366" : "#DC2626";
      var dangerHex = dark ? "#3388FF" : "#2563EB";

      // 시리즈 구성: 1주(위) + 1개월(아래) 그룹 바 (나란히 배치)
      var barSize = mobile ? 8 : 10;
      var seriesArr = [];

      // 1주: 솔리드 그라디언트 바 (위쪽)
      seriesArr.push({
        name: "1주",
        type: "bar",
        barWidth: barSize,
        barCategoryGap: "40%",
        data: week1Values.map(function (v, i) {
          var isTop = i === maxIdx;
          var isBottom = i === minIdx;
          var baseColor = v >= 0 ? successHex : dangerHex;
          var clamped = clampValue(v);
          return {
            value: clamped,
            _orig: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(
                v >= 0 ? 0 : 1,
                0,
                v >= 0 ? 1 : 0,
                0,
                [
                  { offset: 0, color: hexToRgba(baseColor, 0.3) },
                  { offset: 0.4, color: hexToRgba(baseColor, 0.7) },
                  { offset: 1, color: hexToRgba(baseColor, 1) },
                ],
              ),
              borderRadius: v >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3],
              shadowColor:
                isTop || isBottom ? hexToRgba(baseColor, 0.5) : "transparent",
              shadowBlur: isTop || isBottom ? 10 : 0,
            },
            label: {
              show: true,
              position: v >= 0 ? "right" : "left",
              formatter: (v >= 0 ? "+" : "") + v.toFixed(1) + "%",
              color: v >= 0 ? theme.success : theme.danger,
              fontSize: mobile ? 9 : 10,
              fontWeight: isTop || isBottom ? 700 : 600,
              textShadowColor:
                isTop || isBottom ? hexToRgba(baseColor, 0.4) : "transparent",
              textShadowBlur: isTop || isBottom ? 4 : 0,
            },
          };
        }),
        animationDuration: ANIMATION.duration,
        animationEasing: ANIMATION.easing,
        animationDelay: ANIMATION.delay,
      });

      // 1개월: 반투명 바 (아래쪽, 나란히)
      if (hasMonth1) {
        seriesArr.push({
          name: "1개월",
          type: "bar",
          barWidth: barSize,
          barGap: "20%",
          data: month1Values.map(function (v, i) {
            if (v === null) return { value: null };
            var w = week1Values[i];
            // 같은 부호이고 차이가 작으면 1개월 라벨 숨김 (툴팁으로 확인 가능)
            var vPos = v >= 0;
            var wPos = w >= 0;
            var tooClose = vPos === wPos && Math.abs(v - w) < 3;
            var baseColor = v >= 0 ? successHex : dangerHex;
            var clamped = clampValue(v);
            return {
              value: clamped,
              _orig: v,
              itemStyle: {
                color: hexToRgba(baseColor, 0.12),
                borderColor: hexToRgba(baseColor, 0.55),
                borderWidth: 1.5,
                borderType: "dashed",
                borderRadius: v >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3],
              },
              label: {
                show: !tooClose,
                position: v >= 0 ? "right" : "left",
                formatter: (v >= 0 ? "+" : "") + v.toFixed(1) + "%",
                color: dark
                  ? "rgba(148, 163, 184, 0.7)"
                  : "rgba(100, 116, 139, 0.8)",
                fontSize: mobile ? 8 : 9,
                fontWeight: 500,
              },
            };
          }),
          animationDuration: ANIMATION.duration,
          animationEasing: ANIMATION.easing,
          animationDelay: function (idx) {
            return idx * 60 + 200;
          },
        });
      }

      chart.setOption({
        backgroundColor: "transparent",
        textStyle: { fontFamily: FONT, fontWeight: 500 },
        tooltip: tooltipStyle,
        legend: {
          data: hasMonth1
            ? [
                {
                  name: "1주",
                  icon: "roundRect",
                  itemStyle: { borderWidth: 0 },
                },
                {
                  name: "1개월",
                  icon: "roundRect",
                  itemStyle: {
                    color: dark
                      ? "rgba(148, 163, 184, 0.15)"
                      : "rgba(100, 116, 139, 0.1)",
                    borderColor: dark
                      ? "rgba(148, 163, 184, 0.6)"
                      : "rgba(100, 116, 139, 0.5)",
                    borderWidth: 1.5,
                    borderType: "dashed",
                  },
                },
              ]
            : ["1주"],
          top: 0,
          right: 0,
          textStyle: { color: theme.text, fontSize: mobile ? 9 : 10 },
          itemWidth: 14,
          itemHeight: 8,
        },
        grid: {
          left: "5%",
          right: mobile ? "16%" : "14%",
          top: hasMonth1 ? "28px" : "5%",
          bottom: "5%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          min: sectorAxisMin,
          max: sectorAxisMax,
          axisLabel: {
            color: theme.textMuted,
            fontSize: mobile ? 9 : 11,
            fontWeight: 500,
            formatter: "{value}%",
            hideOverlap: true,
          },
          splitLine: { lineStyle: { color: theme.grid, type: [3, 5] } },
          axisLine: { show: false },
        },
        yAxis: {
          type: "category",
          data: names,
          inverse: true,
          axisLabel: {
            color: theme.text,
            fontSize: mobile ? 11 : 12,
            fontWeight: 500,
          },
          axisLine: {
            lineStyle: {
              color: dark
                ? "rgba(0, 240, 255, 0.15)"
                : "rgba(124, 58, 237, 0.15)",
            },
          },
          axisTick: { show: false },
        },
        series: seriesArr,
      });
    }

    if (ss.us) renderSingle("chart-sectors-us", ss.us);
    if (ss.kr) renderSingle("chart-sectors-kr", ss.kr);
  }

  // ===== 윈도우 리사이즈 핸들러 =====
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      MPCharts._instances.forEach(function (chart) {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      });
    }, 150);
  });

  // ===== 글로벌 진입점 =====
  MPCharts.renderAllCharts = function (data) {
    if (!data) return;
    MPCharts._data = data;
    // 이전 인스턴스 정리
    MPCharts._instances = [];
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
