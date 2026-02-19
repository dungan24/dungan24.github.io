# Phase 3: Background & Regime - Research

**Researched:** 2026-02-19
**Domain:** CSS ambient orbs / JS regime tinting / dark-light mode
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Orb 디자인**
- 존재감: 은은하지만 눈치채는 수준 — 스크롤 중 "오 배경 예쁜데?" 정도의 인지
- JS 허용 — 위치/색상 동적 제어, 스크롤 반응 등 구현 가능
- 느낌, 개수, 크기, 배치 패턴은 Claude 재량 (프리미엄 인상에 맞게 판단)

**Orb 애니메이션**
- 움직임 패턴(떠다니기/호흡/정적), 속도, 강도 모두 Claude 재량
- 스크롤 반응 여부(패럴랙스 등) Claude 재량
- 페이지 로드 시 등장 방식 Claude 재량
- **필수 제약:** `prefers-reduced-motion` 설정 시 orb 애니메이션 정지

**Regime 색상 체계**
- Bull = 빨강 (`#FF3366` / `255 51 102`) — 한국 시장 기준 상승=적색
- Bear = 파랑 (`#3388FF` / `51 136 255`) — 한국 시장 기준 하락=청색
- Neutral = 슬레이트 (`#7C3AED` / 기존 violet default)
- 이것은 미국 시장과 반대이며, 한국 브리핑 대상이므로 한국장 컨벤션을 따른다

**Regime 틴팅 강도**
- 은은하지만 인지 가능한 수준 — "오늘 불장이네" 느낌이 카드에서 전달되어야 함
- 적용 대상(카드 배경, 테두리 등) Claude 재량
- 데이터 소스(front matter regime 필드, window.__MP_PAGE 등) Claude 재량 — 기존 데이터 파이프라인 확인 후 판단

**모드별 표현**
- 다크 모드 orb 팔레트/불투명도 조정 Claude 재량 (OLED 검증 필요 블로커 인지)
- 다크 모드 regime 틴팅 강도 Claude 재량
- 모드 전환(다크↔라이트) 시 orb/regime 색상 전환 방식 Claude 재량
- 모바일(640px 이하) orb 표시 방식 Claude 재량 (GPU 퍼포먼스 감안)

### Claude's Discretion
- Orb 전체 비주얼 디자인 (느낌, 개수, 크기, 배치, 색상)
- Orb 애니메이션 패턴 및 스크롤 인터랙션
- Regime 틴팅 적용 대상 및 데이터 소스 선택
- Orb-Regime 연동 여부 (orb 색상이 regime에 반응하는지)
- 다크/라이트 모드별 orb 및 regime 강도 조절
- 모바일 반응형 처리 방식
- 모드 전환 시 트랜지션 방식

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BG-01 | Ambient orbs 배경 구현 (글래스 효과를 살리는 그라데이션 오브) | 홈 페이지에 `.mp-ambient-orb` 패턴이 이미 존재함 — 포스트 페이지에 동일 패턴 확장, `position: fixed` 레이어로 전 페이지 적용 |
| BG-02 | Ambient orbs가 다크/라이트 모드에서 각각 적절히 표시 | `:root:not(.dark)` 패턴으로 불투명도/색상 분기 — 이미 홈에서 dark/light 분기 CSS 존재 |
| BG-03 | Ambient orbs 애니메이션에 prefers-reduced-motion 존중 | `toc-and-effects.css`에 `@media (prefers-reduced-motion: reduce)` 블록 존재 — 같은 패턴으로 orb 애니메이션 정지 추가 |
| RGME-01 | Regime 상태(bull/bear/neutral)에 따라 글래스 배경에 미묘한 틴팅 적용 | `--regime-color`/`--regime-color-rgb` CSS 변수가 이미 런타임에 JS로 설정됨 — `.briefing-section` 배경에 `rgba(var(--regime-color-rgb) / N)` 오버레이 추가 |
| RGME-02 | Regime 틴팅이 다크/라이트 모드 모두에서 작동 | 다크: 낮은 불투명도로 충분, 라이트: 더 낮은 불투명도 필요 (흰 배경 위 pastel tint) |
</phase_requirements>

---

## Summary

Phase 3는 두 개의 독립적인 작업으로 구성된다: (1) **전 페이지 ambient orb 배경** — 글래스 카드의 `backdrop-filter`가 실제로 무언가를 블러할 수 있도록 `position: fixed`인 컬러 그라데이션 레이어를 추가한다. (2) **Regime-driven 틴팅** — `--regime-color-rgb` CSS 변수가 이미 JS에 의해 런타임에 주입되므로, `.briefing-section` 배경에 `rgba(var(--regime-color-rgb) / 0.06)` 정도의 오버레이를 추가하면 카드색이 regime 상태를 반영한다.

홈 페이지에는 `.mp-ambient-orb--left / --right` 패턴이 이미 `home-market-overview.css`에 존재하며, `home-market-overview.js`가 `--mp-orb-color-primary/secondary` 변수를 regime 색에 맞춰 런타임에 교체하는 로직도 구현되어 있다. Phase 3는 이 패턴을 (a) 전 페이지 고정 배경으로 승격하고, (b) 포스트 페이지에서도 동일한 orb-regime 연동을 적용하는 것이다.

Regime 데이터 소스는 두 곳에 존재한다: 홈 페이지는 `fetch()` 로 chart-data JSON을 로드해 `window.__MP_PAGE`가 없고 `data.regime.current`를 사용하며, 포스트 페이지는 `extend-head-uncached.html`이 front matter의 `regime` 필드를 `window.__MP_PAGE.regime` 으로 주입한다. 현재 포스트 파일에는 `regime` front matter가 없지만, `home-market-overview.js`의 regime 감지 로직이 차트 데이터에서 읽으므로 포스트 페이지에서도 `window.__MP_PAGE` fallback 혹은 로컬 chart-data fetch로 확보 가능하다.

**Primary recommendation:** 새 `static/js/ambient-orbs.js` 하나 + `assets/css/custom/ambient-orbs.css` 하나를 추가해 전 페이지 고정 orb 레이어와 regime 틴팅을 처리한다. 기존 홈 전용 CSS는 건드리지 않는다.

---

## Standard Stack

### Core

| 기술 | 버전/방식 | 목적 | 왜 이 접근 |
|------|-----------|------|-----------|
| CSS `position: fixed` orb layer | 표준 CSS | 모든 페이지에서 backdrop-filter blur 대상 제공 | JS 없이 선언적, 스크롤 무관 고정 |
| CSS `radial-gradient` + `filter: blur()` | 표준 CSS | orb의 확산 광원 효과 | 기존 `.mp-ambient-orb` 패턴과 동일 |
| CSS `@keyframes` | 표준 CSS | 호흡/floating 애니메이션 | `toc-and-effects.css`에 `animate-pulse-slow/slower` 이미 정의 |
| CSS 변수 `--regime-color-rgb` | 기존 변수 재활용 | 틴팅 색상 소스 | JS가 이미 런타임에 set — 추가 인프라 불필요 |
| Vanilla JS `document.documentElement.style.setProperty` | ES5 | regime 색상 변수 주입 | 기존 `home-market-overview.js`, `regime-hero.js`와 동일 패턴 |

### Supporting

| 기술 | 목적 | 비고 |
|------|------|------|
| `window.matchMedia('(prefers-reduced-motion: reduce)')` | 애니메이션 감지 | 이미 `home-market-overview.js`에서 사용 |
| `MutationObserver` on `document.documentElement` | `.dark` 클래스 변화 감지 | 다크↔라이트 전환 시 orb opacity 동적 전환 |
| CSS `transition` on orb opacity | 모드 전환 smoothing | `theme-transition.js`와 연계 |

---

## Architecture Patterns

### Recommended File Structure

```
assets/css/custom/
└── ambient-orbs.css         # NEW: fixed orb layer + regime tinting rules

static/js/
└── ambient-orbs.js          # NEW: orb 초기화 + regime 색상 주입 + reduced-motion
```

`extend-footer.html`에 `<script src="...ambient-orbs.js">` 한 줄 추가.
`extend-head-uncached.html`의 CSS 로드 목록에 `css/custom/ambient-orbs.css` 한 줄 추가.

### Pattern 1: Fixed Orb Layer (CSS)

**What:** `position: fixed` + `z-index: -1`로 페이지 전체 뒤에 깔리는 orb 컨테이너. backdrop-filter를 사용하는 카드들이 이 레이어를 블러 대상으로 사용한다.

**핵심 제약:** `z-index`를 `-1` 또는 적절히 낮게 유지해 콘텐츠를 가리지 않아야 한다.

```css
/* Source: custom codebase pattern — ambient-orbs.css */
.mp-page-orb-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;  /* backdrop-filter 대상이 되려면 스태킹 컨텍스트 내에 있어야 함 */
  overflow: hidden;
}

/* Orb 개별 요소 */
.mp-page-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  will-change: transform, opacity;
  transition: background 0.5s ease, opacity 0.5s ease;
}
```

> **주의:** `position: fixed` 컨테이너 안에 `position: absolute` orb를 배치하면 `fixed` 컨테이너가 뷰포트 기준이 되어 orb가 scroll과 무관하게 고정된다. 이것이 의도된 동작이다.

### Pattern 2: Regime Tinting via CSS Variable Override

**What:** `--regime-color-rgb` 변수는 JS가 이미 `document.documentElement`에 설정한다. CSS 규칙 한 줄로 `.briefing-section` 배경에 반영 가능하다.

```css
/* Source: 기존 mp-config.js regime_rgb 값과 연동 */
.briefing-section {
  /* 기존 background 위에 regime 색조 오버레이 */
  background: color-mix(
    in srgb,
    var(--mp-glass-bg) 94%,
    rgba(var(--regime-color-rgb) / 1) 6%
  );
}
```

> **폴백:** `color-mix()`는 현대 브라우저만 지원. 구형 대응은 `background: var(--mp-glass-bg)` 기본값 유지 + `::after` pseudo-element 오버레이 방식이 더 안전하다:

```css
/* safer approach — 모든 브라우저 지원 */
.briefing-section {
  position: relative;
}
.briefing-section::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(var(--regime-color-rgb), 0.05);
  pointer-events: none;
  transition: background 0.5s ease;
}
```

> **결론:** `::after` 오버레이 방식 권장. `color-mix`는 Safari 16.2+, Chrome 111+ 기준으로 현재 충분히 쓸 수 있으나, 기존 코드가 `rgba(var(--X) / N)` 패턴을 사용하므로 통일성을 위해 `rgba(var(--regime-color-rgb), 0.05)` 형태 사용. (CSS4 slash notation `rgba(R G B / A)` vs legacy comma notation `rgba(R, G, B, A)` — 기존 코드는 두 방식 혼용 중이나, CSS variable interpolation에서는 comma 방식이 더 안전하다.)

### Pattern 3: Orb-Regime 연동 (JS)

**What:** orb 색상이 현재 regime을 반영하도록 JS에서 `--mp-orb-color-primary/secondary` 변수를 교체한다.

```javascript
// Source: static/js/home-market-overview.js 기존 패턴 그대로 재사용
function applyRegimeOrb(regimeCurrentStr) {
  var config = window.MP_CONFIG || {};
  var rgbMap = (config.colors && config.colors.regime_rgb) || {};
  var rgb = rgbMap[regimeCurrentStr] || '124 58 237';  // fallback: violet
  document.documentElement.style.setProperty('--mp-orb-color-primary', rgb);
  document.documentElement.style.setProperty('--mp-orb-color-secondary', rgb);
}
```

홈 페이지: `home-market-overview.js`가 이미 이 작업을 하므로 `ambient-orbs.js`는 홈에서 중복 실행 방지 처리 필요 (페이지 타입 감지).

### Pattern 4: prefers-reduced-motion

```css
/* Source: toc-and-effects.css 기존 패턴 */
@media (prefers-reduced-motion: reduce) {
  .mp-page-orb {
    animation: none !important;
    transition: none !important;
  }
}
```

JS에서도 동일하게:
```javascript
var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  // 애니메이션 등록
}
```

### Pattern 5: .dark 클래스 감지 (MutationObserver)

다크↔라이트 모드 전환은 `document.documentElement.classList`에 `.dark`를 add/remove하는 방식이다 (Prior decisions 확인 완료). JS가 이를 감지하려면:

```javascript
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === 'class') {
      updateOrbMode();
    }
  });
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
```

단, CSS 변수와 `:root:not(.dark)` 분기로 대부분 처리 가능하므로 JS MutationObserver는 동적 불투명도 조정이 꼭 필요한 경우에만 사용한다.

### Anti-Patterns to Avoid

- **`backdrop-filter`를 orb 컨테이너에 적용:** orb 레이어 자체에 backdrop-filter를 걸면 안 된다. backdrop-filter는 `.briefing-section`, `.mp-ticker-group` 같은 글래스 카드 요소에만 걸려야 한다.
- **orb의 z-index를 양수로 설정:** 콘텐츠 위에 덮인다.
- **홈 전용 `.mp-ambient-orb` CSS를 수정:** Phase 3는 새 CSS를 추가하는 것이지 기존을 수정하지 않는다. 홈 shell의 orb는 `position: absolute`로 shell 컨테이너 기준이라 다른 맥락이다.
- **모바일에서 blur 값을 과도하게 설정:** GPU 부하. 모바일(640px 이하)에서는 blur 크기를 절반으로 줄이거나 orb 개수를 줄인다.
- **light mode에서 orb 불투명도를 dark mode와 동일하게:** 흰 배경에서는 orb가 지나치게 강하게 보인다. 라이트 모드에서 opacity를 50% 이하로 줄여야 한다.

---

## Don't Hand-Roll

| 문제 | 직접 만들지 말 것 | 대신 사용 | 이유 |
|------|-----------------|-----------|------|
| Regime color 가져오기 | 별도 fetch 로직 | `window.MP_CONFIG.colors.regime_rgb` | 이미 mp-config.js에 로드되어 있음 |
| 다크 모드 감지 | `prefers-color-scheme` 미디어쿼리 | `.dark` 클래스 기반 CSS selector | Prior decision: `.dark` 클래스 전용 |
| Orb 블러 효과 | SVG filter, canvas | CSS `filter: blur()` | GPU-accelerated, 단순 |
| 애니메이션 타이밍 | requestAnimationFrame loop | CSS `@keyframes` + `animation` | compositing layer에서 실행, JS 부하 없음 |

---

## Common Pitfalls

### Pitfall 1: `position: fixed` orb가 backdrop-filter의 대상이 되지 않는 경우

**What goes wrong:** `.briefing-section`의 `backdrop-filter`는 자신보다 z-order가 낮은 요소들을 블러한다. `position: fixed` 요소가 자신만의 stacking context를 만들면 기대와 다르게 동작할 수 있다.

**Why it happens:** CSS stacking context 규칙 — `position: fixed` 요소는 뷰포트 기준이지만, `transform`, `filter`, `will-change` 등이 있는 부모가 stacking context를 만들면 예외가 발생한다.

**How to avoid:** orb 레이어를 `body`의 직접 자식으로 배치한다. `z-index: 0`으로 설정하고, 카드를 `z-index: 1+`로 설정한다. `will-change: transform`은 orb에만 걸고 레이어 컨테이너에는 걸지 않는다.

**Warning signs:** 개발자 도구에서 backdrop-filter를 설정한 요소 뒤의 배경이 단색(Blowfish 기본 bg)만 보이고 orb 색이 블러되지 않으면 stacking context 문제이다.

### Pitfall 2: 다크 모드에서 orb가 지나치게 밝아 OLED 번인 우려

**What goes wrong:** OLED 디스플레이에서 밝은 색상의 orb가 지속적으로 표시되면 잔상/번인 위험.

**Why it happens:** orb가 `position: fixed`로 항상 같은 위치에 고정되는 경우.

**How to avoid:** (1) orb에 floating/drift 애니메이션을 추가해 위치가 고정되지 않게 한다. (2) 다크 모드에서 orb opacity를 0.15 이하로 제한한다. (3) OLED 블랙(#000000)에서 테스트한다.

### Pitfall 3: regime 변수가 설정되기 전 CSS가 렌더링되어 기본 purple 색으로 틴팅되는 flash

**What goes wrong:** 페이지 로드 시 JS가 `--regime-color-rgb`를 설정하기 전에 CSS가 이미 렌더링되면, 첫 프레임은 기본값(violet `124 58 237`)으로 카드가 표시된다.

**Why it happens:** CSS 변수 기본값이 violet인데, JS는 DOMContentLoaded 이후에 실행된다.

**How to avoid:** `.briefing-section`의 regime tinting을 `.regime-loaded` 클래스 조건부로만 적용한다. JS에서 regime 색상 주입 직후 `document.documentElement.classList.add('regime-loaded')`를 호출한다. 또는, tinting opacity를 매우 낮게(0.04~0.06) 유지해 기본 violet이어도 눈에 잘 띄지 않게 한다.

### Pitfall 4: 포스트 페이지의 regime 데이터 소스 부재

**What goes wrong:** 현재 포스트 front matter에 `regime` 필드가 없다 (검증 완료). `window.__MP_PAGE`가 `undefined`가 된다.

**Why it happens:** pipeline이 아직 `regime` front matter를 채우지 않는다.

**How to avoid 두 가지 옵션:**
- **Option A (권장):** 포스트 페이지에서는 chart-data JSON을 fetch해서 regime을 읽는다. 이미 `chartData` front matter로 JSON 경로가 넘어오므로 `window.__MP_PAGE.chartData` 혹은 `window.__MP_CONFIG`에서 확인 가능.
- **Option B (단순):** 포스트 페이지의 regime tinting을 건너뛰고 홈 페이지에만 적용. regime tinting은 결국 홈의 글래스 카드들이 대상이기 때문.

실제로 검증하면: `extend-head-uncached.html`은 `.Params.regime`이 있을 때만 `window.__MP_PAGE`를 주입한다. 현재 포스트에 `regime` front matter가 없으므로 `window.__MP_PAGE`는 존재하지 않는다.

**결론:** 포스트 페이지에서의 regime tinting은 `chartData` front matter로 연결된 JSON을 lazy fetch해서 얻거나, 아예 홈 전용으로 scope를 제한한다. 후자가 구현이 단순하고 현재 유일하게 글래스 카드(`mp-ticker-group`)들이 집중된 곳이 홈이므로 **홈 우선 구현이 합리적이다**.

### Pitfall 5: 기존 홈 orb CSS와 충돌

**What goes wrong:** 새 `ambient-orbs.css`가 기존 `home-market-overview.css`의 `.mp-ambient-orb` 규칙과 충돌한다.

**Why it happens:** 홈에는 이미 `position: absolute` orb가 `.mp-home-shell` 기준으로 존재한다. 새로운 `position: fixed` page-level orb를 추가하면 홈에서 두 세트의 orb가 겹친다.

**How to avoid:** 새 페이지 레벨 orb에는 다른 클래스명(`mp-page-orb`, `mp-page-orb-layer`)을 사용한다. 홈에서는 기존 `.mp-ambient-orb`가 더 가까운 레이어에 있으므로 page-level orb를 홈에서 숨기거나, 대신 홈에서는 page-level orb를 제거하고 기존 것을 그대로 유지한다.

---

## Code Examples

### 전 페이지 fixed orb 레이어 HTML 삽입 (JS)

```javascript
// Source: 기존 home/custom.html + home-market-overview.css 패턴에서 파생
(function() {
  'use strict';

  // orb 레이어 DOM 삽입
  var layer = document.createElement('div');
  layer.className = 'mp-page-orb-layer';
  layer.innerHTML =
    '<div class="mp-page-orb mp-page-orb--primary"></div>' +
    '<div class="mp-page-orb mp-page-orb--secondary"></div>' +
    '<div class="mp-page-orb mp-page-orb--accent"></div>';

  // body 맨 앞에 삽입 (다른 fixed 요소들보다 먼저)
  document.body.insertBefore(layer, document.body.firstChild);

  // reduced-motion 감지
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    layer.classList.add('motion-reduced');
  }
})();
```

### Regime 색상 적용 (JS) — 홈 페이지 fetch 결과 활용

```javascript
// Source: home-market-overview.js render() 패턴 재활용
function applyRegimeToOrbs(regimeCurrent) {
  var config = window.MP_CONFIG || {};
  var rgbMap = (config.colors && config.colors.regime_rgb) || {};
  var rgb = rgbMap[regimeCurrent];
  if (!rgb) return;
  var root = document.documentElement;
  root.style.setProperty('--mp-orb-color-primary', rgb);
  root.style.setProperty('--mp-orb-color-secondary', rgb);
  root.classList.add('regime-loaded');
}
```

### Regime 틴팅 CSS

```css
/* Source: 기존 .mp-glass-bg + --regime-color-rgb 변수 시스템 활용 */

/* 다크 모드 기본 틴팅 */
.regime-loaded .briefing-section::after,
.regime-loaded .mp-ticker-group::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(var(--regime-color-rgb), 0.06);
  pointer-events: none;
  transition: background 0.5s ease;
  z-index: 0;
}

/* 라이트 모드: 절반 불투명도 */
:root:not(.dark) .regime-loaded .briefing-section::after,
:root:not(.dark) .regime-loaded .mp-ticker-group::after {
  background: rgba(var(--regime-color-rgb), 0.03);
}

/* reduced-motion: 틴팅 트랜지션 제거 */
@media (prefers-reduced-motion: reduce) {
  .briefing-section::after,
  .mp-ticker-group::after {
    transition: none !important;
  }
}
```

### Orb CSS 위치 및 애니메이션 예시

```css
/* Source: home-market-overview.css .mp-ambient-orb 패턴 승격 */

.mp-page-orb-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Primary orb — 좌상단, 큰 soft glow */
.mp-page-orb--primary {
  top: -10%;
  left: -5%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(100px);
  background: radial-gradient(
    circle,
    rgba(var(--mp-orb-color-primary) / 0.18) 0%,
    transparent 70%
  );
  animation: orb-float-primary 18s ease-in-out infinite;
}

/* Secondary orb — 우하단 */
.mp-page-orb--secondary {
  bottom: 10%;
  right: -8%;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(80px);
  background: radial-gradient(
    circle,
    rgba(var(--mp-orb-color-secondary) / 0.12) 0%,
    transparent 70%
  );
  animation: orb-float-secondary 24s ease-in-out infinite;
  animation-delay: -8s;
}

/* Accent orb — 중앙, 아주 희미 */
.mp-page-orb--accent {
  top: 40%;
  left: 30%;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  filter: blur(120px);
  background: radial-gradient(
    circle,
    rgba(var(--mp-orb-color-primary) / 0.07) 0%,
    transparent 70%
  );
  animation: orb-float-accent 30s ease-in-out infinite;
  animation-delay: -15s;
}

/* Float keyframes — subtle drift */
@keyframes orb-float-primary {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(40px, -30px) scale(1.05); }
  66%       { transform: translate(-20px, 20px) scale(0.97); }
}

@keyframes orb-float-secondary {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40%       { transform: translate(-50px, 30px) scale(1.08); }
  70%       { transform: translate(30px, -20px) scale(0.95); }
}

@keyframes orb-float-accent {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(20px, -40px); }
}

/* 라이트 모드: opacity 절감 */
:root:not(.dark) .mp-page-orb--primary {
  background: radial-gradient(
    circle,
    rgba(var(--mp-orb-color-primary) / 0.07) 0%,
    transparent 70%
  );
}
:root:not(.dark) .mp-page-orb--secondary {
  background: radial-gradient(
    circle,
    rgba(var(--mp-orb-color-secondary) / 0.05) 0%,
    transparent 70%
  );
}
:root:not(.dark) .mp-page-orb--accent {
  display: none;
}

/* 모바일: 크기 줄이고 blur 절감 */
@media (max-width: 640px) {
  .mp-page-orb--primary {
    width: 300px;
    height: 300px;
    filter: blur(60px);
  }
  .mp-page-orb--secondary {
    width: 220px;
    height: 220px;
    filter: blur(50px);
  }
  .mp-page-orb--accent {
    display: none;
  }
}

/* reduced-motion: 모든 orb 애니메이션 정지 */
@media (prefers-reduced-motion: reduce) {
  .mp-page-orb {
    animation: none !important;
  }
}
```

---

## State of the Art

| 구 접근 | 현재 접근 | 변경 | 영향 |
|---------|-----------|------|------|
| 홈 한정 `.mp-ambient-orb` (position: absolute, shell 기준) | 전 페이지 `.mp-page-orb` (position: fixed, viewport 기준) | Phase 3 신규 | backdrop-filter가 실질적인 대상을 갖게 됨 |
| `--regime-color` 변수만 있음 (badge용) | `--regime-color-rgb` + `.regime-loaded` 클래스 + `::after` 틴팅 | Phase 3 신규 | 카드 배경에 regime 색조 반영 |
| 홈 JS(`home-market-overview.js`)만 orb 색상 교체 | `ambient-orbs.js`가 전 페이지 초기 orb 색상 설정 담당 | Phase 3 신규 | 포스트 페이지에서도 orb 색상이 데이터를 반영할 수 있는 기반 마련 |

**Deprecated/outdated 아닌 것들 — 그대로 유지:**
- `home-market-overview.js`의 orb 색상 교체 로직: 홈의 데이터 fetch 후 최신 regime으로 갱신하므로 중복이 아니라 override
- `.mp-ambient-orb` CSS: 홈 shell 내 position:absolute orb는 그대로 유지 (다른 역할)

---

## Existing Codebase Findings

이 프로젝트를 직접 탐색해서 얻은 HIGH confidence 발견 사항들:

### Regime 색상 매핑 현황 (mp-config.js 확인)

```
RISK_ON  → '#00FF88' (rgb: '0 255 136')   — 초록 (녹장)
CAUTIOUS → '#FFD600' (rgb: '255 214 0')   — 노랑 (관망)
RISK_OFF → '#FF3366' (rgb: '255 51 102')  — 빨강 (약장)
PANIC    → '#FF0040' (rgb: '255 0 64')    — 진빨강 (패닉)
```

**중요:** context.md의 Bull=빨강(한국 컨벤션)은 `RISK_ON` 상태를 의미한다. 그러나 현재 mp-config.js에서 `RISK_ON`은 초록(`#00FF88`)으로 매핑되어 있다. 이는 **글로벌(미국) 컨벤션**이다.

Phase 3에서 RGME-01/02를 구현할 때 다음 매핑을 적용해야 한다:
- `RISK_ON` → 빨강 (`--mp-color-up` = `#FF3366` dark / `#DC2626` light) — 한국 상승=적색
- `RISK_OFF`, `PANIC` → 파랑 (`--mp-color-down` = `#3388FF` dark / `#2563EB` light) — 한국 하락=청색
- `CAUTIOUS` → 슬레이트 (기존 `#7C3AED` violet 또는 slate-400)

**결정 필요:** 이 컬러 재매핑을 (A) mp-config.js의 regime hex 자체를 바꿀지, (B) ambient-orbs.js에서 별도 mapping 레이어를 만들지 선택해야 한다. Option B가 영향 범위가 작다 — mp-config.js의 `--regime-color`는 badge/TOC scrollspy에서도 사용되므로 건드리면 다른 컴포넌트에 영향을 줄 수 있다.

**권장:** `ambient-orbs.js`에서 한국 컨벤션 전용 orb/tinting 색상 매핑 테이블을 별도로 관리:

```javascript
var KR_ORB_RGB = {
  'RISK_ON':  '220 38 38',   // red-600 (한국: 상승=빨강)
  'CAUTIOUS': '124 58 237',  // violet (neutral)
  'RISK_OFF': '37 99 235',   // blue-600 (한국: 하락=파랑)
  'PANIC':    '37 99 235'    // blue-600 (same as bear)
};
```

### 포스트 페이지 regime 데이터 현황

- 현재 포스트 파일 5개 모두 `regime` front matter 없음 (검증 완료)
- `window.__MP_PAGE`는 `.Params.regime`이 있을 때만 주입됨 (extend-head-uncached.html 확인)
- `window.__MP_PAGE.chartData`는 front matter `chartData` 경로 문자열임 (fetch 필요)
- **결론:** 포스트 페이지 regime tinting은 홈 페이지보다 낮은 우선순위. BG-01~03은 전 페이지에 적용하고, RGME-01~02는 1차 홈 적용, 포스트는 future work로 defer 가능.

### 기존 `.briefing-section::after` 사용 현황

`custom.css`의 `.briefing-section::before`는 label 배지(`data-label`)에 사용 중이다. `::after`는 `h2::after`에서만 사용되고 `.briefing-section` 자체의 `::after`는 비어 있다 — 틴팅 오버레이로 사용 가능.

단, `.mp-ticker-group`도 확인 필요. custom.css에서 `.mp-ticker-group::after`가 없으므로 자유롭게 사용 가능.

### backdrop-filter 대상 요소들

현재 `backdrop-filter: var(--mp-glass-blur)` 적용된 요소들 (이것들이 orb를 블러해야 함):
- `.briefing-section` (custom.css)
- `.mp-ticker-group` (custom.css)
- `#TOCView` (toc-and-effects.css)
- `.mp-briefing-meta` (toc-and-effects.css)
- `.prose table` (custom.css, `blur(8px)`)
- `.mp-post-hero` (post-hero.css)

모두 page-level orb가 뒤에 있으면 실질적인 블러 효과를 얻는다.

---

## Open Questions

1. **Regime tinting: mp-config.js의 regime 색상 재매핑 vs 별도 KR orb 색상 테이블**
   - 현재 상황: `RISK_ON = #00FF88(초록)`은 미국 컨벤션, Phase 3는 한국 컨벤션(RISK_ON=빨강)을 원함
   - 권장: `ambient-orbs.js`에 별도 `KR_ORB_RGB` 테이블 — 기존 badge/TOC 색상을 유지하면서 orb/tinting만 한국 컨벤션으로
   - 하지만 planner가 결정 가능

2. **homepage orb 중복: 기존 `.mp-ambient-orb` vs 새 `.mp-page-orb`**
   - 홈에서 두 세트가 공존하면 너무 진해질 수 있음
   - 옵션 A: 홈에서 new page-level orb를 숨김 (`custom.html` 존재 페이지에서 `mp-page-orb-layer` 제거)
   - 옵션 B: 기존 `.mp-ambient-orb`를 홈 shell에서 제거하고 page-level orb로 교체
   - 옵션 B가 코드 단순화에 더 유리하나 Phase 4 이후 작업이 남아 있으므로 옵션 A가 안전

3. **포스트 페이지 regime 소스**
   - RGME-01 요구사항이 "글래스 카드 배경에 틴팅"이라면 briefing-section들이 있는 포스트 페이지도 대상
   - front matter `regime` 없으므로 chartData fetch 추가 필요 → 범위 확장
   - planner가 범위를 결정해야 함 (홈 전용 vs 포스트도 포함)

---

## Sources

### Primary (HIGH confidence - 코드베이스 직접 탐색)

- `C:/Users/sc/.aidocs/dungan24.github.io/assets/css/custom.css` — CSS 변수 전체, regime 변수, orb 변수
- `C:/Users/sc/.aidocs/dungan24.github.io/assets/css/custom/home-market-overview.css` — 기존 ambient orb CSS 패턴
- `C:/Users/sc/.aidocs/dungan24.github.io/static/js/home-market-overview.js` — orb 색상 동적 교체 패턴, regime fetch 로직
- `C:/Users/sc/.aidocs/dungan24.github.io/static/js/mp-config.js` — regime 색상 매핑 전체
- `C:/Users/sc/.aidocs/dungan24.github.io/static/js/briefing/regime-hero.js` — 포스트 페이지 regime 주입 방식
- `C:/Users/sc/.aidocs/dungan24.github.io/layouts/partials/extend-head-uncached.html` — `window.__MP_PAGE` 주입 조건
- `C:/Users/sc/.aidocs/dungan24.github.io/layouts/partials/home/custom.html` — 홈 HTML 구조, orb DOM 배치
- `C:/Users/sc/.aidocs/dungan24.github.io/assets/css/custom/toc-and-effects.css` — prefers-reduced-motion 패턴
- `C:/Users/sc/.aidocs/dungan24.github.io/static/data/chart-data-2026-02-19.json` — regime 데이터 구조 확인
- `C:/Users/sc/.aidocs/dungan24.github.io/content/posts/*.md` — front matter에 regime 필드 없음 확인

### Secondary (MEDIUM confidence - CSS spec 기반)

- CSS Stacking Context 규칙: `position: fixed` + `z-index` 동작 — MDN 스펙 기반 훈련 지식
- `backdrop-filter` 동작 방식 (블러 대상은 자신 뒤의 요소) — 브라우저 구현 일관됨

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 코드베이스에서 직접 패턴 확인
- Architecture: HIGH — 기존 패턴(home-market-overview.js/css)의 직접 확장
- Pitfalls: HIGH — stacking context 이슈는 실제 코드 구조에서 도출, regime 데이터 부재는 파일 직접 확인

**Research date:** 2026-02-19
**Valid until:** 60일 (CSS/JS 스택 안정적, 데이터 파이프라인 변경 시 재확인 필요)
