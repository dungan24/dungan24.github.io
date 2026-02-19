(function () {
  "use strict";

  var defaultConfig = {
    paths: {
      home: "",
      posts: "posts/",
      tags: "tags/",
      investment_strategy: "investment-strategy/",
      market_calendar: "market-calendar/",
      about: "about/",
      security_protocol: "security-protocol/",
      data_consent: "data-consent/",
      api_documentation: "api-documentation/",
      chart_data_prefix: "data/chart-data-",
    },
    external: {
      echarts_cdn:
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js",
      fonts_css_url:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap",
    },
    behavior: {
      reading_progress_initial_delay_ms: 100,
      theme_transition_duration_ms: 500,
    },
    branding: {
      header_title: "MARKET PULSE",
      header_font_family: "'Noto Sans KR', sans-serif",
      header_text_transform: "uppercase",
      header_font_weight: "700",
      header_letter_spacing: "0.05em",
      header_color_dark: "#A78BFA",
      header_color_light: "#7C3AED",
      header_shadow_dark: "0 0 15px rgba(124, 58, 237, 0.4)",
      header_shadow_light: "none",
    },
    home: {
      lookback_days: 7,
      live: {
        fresh_status_class: "is-fresh",
        stale_status_class: "is-stale",
      },
      regime_filters: [
        { value: "ALL", label: "ALL" },
        { value: "RISK_ON", label: "RISK ON" },
        { value: "CAUTIOUS", label: "CAUTIOUS" },
        { value: "RISK_OFF", label: "RISK OFF" },
        { value: "PANIC", label: "PANIC" },
      ],
      overview_groups: [
        {
          title: "US INDICES",
          tickers: [
            { key: "SPX", name: "S&P 500", fmt: "index" },
            { key: "NDX", name: "Nasdaq", fmt: "index" },
            {
              key: "DJI",
              name: "Dow Jones Industrial Average",
              shortName: "DJI",
              fullName: "Dow Jones Industrial Average",
              fmt: "index",
            },
          ],
        },
        {
          title: "RISK METRICS",
          tickers: [
            { key: "VIX", name: "VIX", fmt: "decimal", invertColor: true },
            {
              key: "US10Y",
              name: "미국 10년물",
              shortName: "미국 10년물",
              fullName: "US 10-Year Treasury Yield",
              fmt: "decimal",
            },
            {
              key: "USDKRW",
              name: "USD/KRW Exchange Rate",
              shortName: "USD/KRW",
              fullName: "USD/KRW Exchange Rate",
              fmt: "decimal",
            },
          ],
        },
        {
          title: "ALTERNATIVES",
          tickers: [
            { key: "BTC", name: "Bitcoin", fmt: "dollar" },
            { key: "GOLD", name: "Gold", fmt: "dollar" },
            { key: "OIL", name: "WTI Oil", fmt: "dollar" },
          ],
        },
      ],
    },
    regime: {
      default_status: "CAUTIOUS",
      default_label: "Cautious",
    },
    charts: {
      load_timeout_ms: 15000,
      theme_rerender_delay_ms: 150,
      mobile_breakpoint: 640,
      regime_score: {
        RISK_ON: 85,
        CAUTIOUS: 55,
        RISK_OFF: 30,
        PANIC: 10,
      },
      palette: {
        primary: "#7C3AED",
        cyan: "#00F0FF",
        pink: "#FF3366",
        blue: "#3388FF",
        yellow: "#FFD600",
        green: "#00FF88",
        muted: "#64748B",
        bg: "#0A0A1A",
        text: "#E2E8F0",
        text_light: "#94A3B8",
        text_dark: "#1E1E3A",
        border_light: "#cbd5e1",
        grid_light: "#f1f5f9",
        success_light: "#DC2626",
        danger_light: "#2563EB",
      },
      metric_colors: {
        SPX: "#00F0FF",
        NDX: "#7C3AED",
        DJI: "#34d399",
        VIX: "#f87171",
        BTC: "#fbbf24",
        USDKRW: "#06b6d4",
        GOLD: "#eab308",
        OIL: "#a8a29e",
        US10Y: "#f472b6",
      },
    },
    colors: {
      regime: {
        RISK_ON: "#00FF88",
        CAUTIOUS: "#FFD600",
        RISK_OFF: "#FF3366",
        PANIC: "#FF0040",
      },
      regime_rgb: {
        RISK_ON: "0 255 136",
        CAUTIOUS: "255 214 0",
        RISK_OFF: "255 51 102",
        PANIC: "255 0 64",
      },
    },
    sections: {
      news: "주요 뉴스",
      calendar: ["주요 일정", "오늘의 일정", "이벤트 캘린더"],
      key_data: "핵심 수치",
      sector: "섹터 상대강도",
    },
    labels: {
      original_source: "원문:",
      en_tag: "EN",
      kr_tag: "KR",
      market_calendar_title: "Market Calendar",
      upcoming_events_title: "주요 일정 (최근)",
      empty_events: "표시할 주요 일정 데이터가 없습니다.",
      empty_filtered: "필터 조건에 맞는 일정이 없습니다.",
      holiday_label: "🇰🇷 KR 휴장 (국내 증시 휴장)",
      filter_importance: "중요도",
      filter_period: "기간",
      filter_country: "국가",
      filter_all: "전체",
      filter_high: "상",
      filter_high_medium: "상+중",
      filter_pm10: "±10일",
      filter_pm20: "±20일",
      filter_pm30: "±30일",
      filter_country_us: "미국",
      filter_country_kr: "한국",
      chart_data_unavailable: "[ DATA_UNAVAILABLE ]",
      chart_request_timeout: "REQUEST TIMEOUT — RELOAD TO RETRY",
      chart_not_published: "MARKET DATA NOT YET PUBLISHED",
      chart_load_failed: "FAILED TO LOAD MARKET DATA",
      chart_renderer_missing: "CHART RENDERER NOT AVAILABLE",
    },
    calendar: {
      timezone: "Asia/Seoul",
      timezone_label: "KST",
      utc_offset: "+09:00",
      locale: "ko-KR",
      weekdays: ["일", "월", "화", "수", "목", "금", "토"],
      default_importance_filter: "high",
      default_period_filter: "pm10",
      default_country_filter: "all",
      upcoming_limit: 20,
      period_days: {
        pm10: 10,
        pm20: 20,
        pm30: 30,
      },
    },
  };

  // Deep merge function
  function mergeDeep(target, source) {
    if (!source) return target;
    for (var key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  window.MP_CONFIG = mergeDeep(defaultConfig, window.__MP_CONFIG || {});
})();
