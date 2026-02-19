/**
 * ambient-orbs.js
 * Phase 3 — Background & Regime
 *
 * WHY: CSS만으로는 body 첫 자식 삽입과 prefers-reduced-motion 런타임 감지가
 *      불가능하다. 이 스크립트가 페이지 로드 직후 orb 레이어를 body 맨 앞에
 *      삽입해 backdrop-filter 카드보다 DOM 순서상 앞에 위치하게 한다.
 *
 * 실행 시점: extend-footer.html에서 mp-config.js 이후 로드
 * DOM 대상:  body.firstChild 앞 삽입
 * 의존성:    없음 (MP_CONFIG 미사용, standalone IIFE)
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Orb 레이어 DOM 생성
     aria-hidden=true: 스크린 리더에서 장식용 배경임을 명시
     ------------------------------------------------------------------ */
  var layer = document.createElement("div");
  layer.className = "mp-page-orb-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML =
    '<div class="mp-page-orb mp-page-orb--primary"></div>' +
    '<div class="mp-page-orb mp-page-orb--secondary"></div>' +
    '<div class="mp-page-orb mp-page-orb--accent"></div>';

  /* ------------------------------------------------------------------
     body 맨 앞에 삽입
     WHY: backdrop-filter 카드들이 이 레이어를 "뒤에서" 블러해야 하므로
          DOM 순서상 가장 앞(= 렌더링 순서상 가장 뒤)에 배치
     ------------------------------------------------------------------ */
  document.body.insertBefore(layer, document.body.firstChild);

  /* ------------------------------------------------------------------
     prefers-reduced-motion 런타임 감지
     WHY: CSS @media는 초기 렌더만 처리. OS 설정 변경 시 CSS가 자동
          업데이트되지 않는 브라우저를 위해 JS에서도 클래스 토글.
          .motion-reduced 클래스는 future-proofing — 현재 CSS는
          @media만으로 충분하나 JS 제어가 필요할 때를 대비.
     ------------------------------------------------------------------ */
  var mql =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mql && mql.matches) {
    layer.classList.add("motion-reduced");
  }

  /* 런타임 변경 감지 (사용자가 OS 접근성 설정을 세션 중 바꿀 수 있음) */
  if (mql && mql.addEventListener) {
    mql.addEventListener("change", function (e) {
      layer.classList.toggle("motion-reduced", e.matches);
    });
  }

  /* ------------------------------------------------------------------
     Regime Tinting — Phase 03 Plan 02
     한국 시장 컨벤션: 상승=빨강, 하락=파랑, 중립=보라

     WHY: home-market-overview.js가 US-convention(RISK_ON=초록)으로
          --mp-orb-color-*를 설정하므로, KR-convention 덮어쓰기가
          필요하다. 직접 읽기 방식으로 flash 없이 동일 렌더 프레임에서
          KR 색상을 적용한다.

     NOTE: polling/setInterval 사용 금지. hex reverse-lookup 사용 금지.
           ES5 호환 (arrow function, template literal 금지).
     ------------------------------------------------------------------ */

  /* 한국 컨벤션 orb 색상 매핑 */
  var KR_ORB_RGB = {
    RISK_ON: "220 38 38" /* red-600 (한국: 상승=빨강) — Bull */,
    CAUTIOUS: "124 58 237" /* violet-600 (관망) — Neutral */,
    RISK_OFF: "37 99 235" /* blue-600 (한국: 하락=파랑) — Bear */,
    PANIC: "37 99 235" /* blue-600 (극단적 하락도 파랑) */,
  };

  /* 한국 컨벤션 카드 틴팅 색상 매핑 */
  var KR_TINT_RGB = {
    RISK_ON: "255 51 102" /* 사용자 지정 bull red */,
    CAUTIOUS: "124 58 237" /* violet */,
    RISK_OFF: "51 136 255" /* 사용자 지정 bear blue */,
    PANIC: "51 136 255",
  };

  /* regime 문자열을 받아 KR 색상으로 CSS 변수 주입 */
  function applyRegime(regimeStr) {
    if (!regimeStr) return;
    var docRoot = document.documentElement;

    /* Orb 색상 교체 (한국 컨벤션) — home-market-overview.js의 US 색상 즉시 덮어씀 */
    var orbRgb = KR_ORB_RGB[regimeStr] || "124 58 237";
    docRoot.style.setProperty("--mp-orb-color-primary", orbRgb);
    docRoot.style.setProperty("--mp-orb-color-secondary", orbRgb);

    /* 카드 틴팅 색상 주입 */
    var tintRgb = KR_TINT_RGB[regimeStr] || "124 58 237";
    docRoot.style.setProperty("--regime-color-rgb", tintRgb);

    /* .regime-loaded 추가 → CSS 틴팅 ::after 오버레이 활성화 */
    docRoot.classList.add("regime-loaded");
  }

  /* regime 소스 감지 (3-tier 전략) */
  function detectAndApplyRegime() {
    /* 1차: window.__MP_PAGE (포스트 페이지 — Hugo 인라인 주입) */
    if (window.__MP_PAGE && window.__MP_PAGE.regime) {
      applyRegime(window.__MP_PAGE.regime);
      return;
    }

    /* 2차: window.MP_REGIME_CURRENT (홈 — home-market-overview.js render()에서 설정) */
    if (window.MP_REGIME_CURRENT) {
      applyRegime(window.MP_REGIME_CURRENT);
      return;
    }

    /* 3차: mp:regime-ready 이벤트 리스닝 (비동기 fetch 완료 대기) */
    var applied = false;
    document.addEventListener("mp:regime-ready", function handler(e) {
      if (applied) return;
      applied = true;
      var regime = (e.detail && e.detail.regime) || "";
      applyRegime(regime);
      document.removeEventListener("mp:regime-ready", handler);
    });

    /* 안전망: 8초 후 미수신 시 리스너 정리 (틴팅 없음 = 안전한 기본값) */
    setTimeout(function () {
      applied = true; /* 이후 이벤트 무시 */
    }, 8000);
  }

  /* DOMContentLoaded 이후 실행 보장 */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", detectAndApplyRegime);
  } else {
    detectAndApplyRegime();
  }
})();
