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
  'use strict';

  /* ------------------------------------------------------------------
     Orb 레이어 DOM 생성
     aria-hidden=true: 스크린 리더에서 장식용 배경임을 명시
     ------------------------------------------------------------------ */
  var layer = document.createElement('div');
  layer.className = 'mp-page-orb-layer';
  layer.setAttribute('aria-hidden', 'true');
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
  var mql = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql && mql.matches) {
    layer.classList.add('motion-reduced');
  }

  /* 런타임 변경 감지 (사용자가 OS 접근성 설정을 세션 중 바꿀 수 있음) */
  if (mql && mql.addEventListener) {
    mql.addEventListener('change', function (e) {
      layer.classList.toggle('motion-reduced', e.matches);
    });
  }
})();
