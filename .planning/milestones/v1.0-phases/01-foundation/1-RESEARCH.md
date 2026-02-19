# Phase 1: Foundation - Research

**Researched:** 2026-02-19
**Domain:** CSS 변수 시스템 / 버그 수정 / 3티어 토큰 아키텍처
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | 중복된 `:root:not(.dark)` CSS 블록을 단일 블록으로 통합 | custom.css 89-104행과 218-230행 두 블록 확인. 통합 시 누락 변수 목록 도출됨 |
| FOUN-02 | `.mp-briefing-meta::before`의 nested backdrop-filter 버그 수정 | toc-and-effects.css 424-442행에서 이중 blur 확인. 해결법: `::before`에서 backdrop-filter 제거 |
| FOUN-03 | `#TOCView`와 `.market-chart-card`를 prefers-reduced-motion 블록에 추가 | toc-and-effects.css 510-531행 기존 블록에 두 선택자 누락 확인 |
| FOUN-04 | 3티어 CSS 변수 시스템 구축 (primitive → semantic → component 계층) | chart-cards.css와 home-market-overview.css의 `:root` 선언 블록이 컴포넌트 파일에 존재하는 위반 확인 |
| FOUN-05 | 다크 모드 최적화된 컬러 팔레트 정의 (primitive 토큰) | custom.css `:root` 블록의 현재 다크 기본값 목록 도출됨 |
| FOUN-06 | 라이트 모드 최적화된 컬러 팔레트 정의 (primitive 토큰) | 두 `:root:not(.dark)` 블록에 분산된 라이트 모드 값 목록 도출됨 |
| FOUN-07 | 모바일 blur 최적화 변수 정의 (640px 이하: 8px, 480px 이하: 4px) | 현재 blur 변수가 `--mp-glass-blur: blur(14px) saturate(1.4)`으로 고정, 미디어쿼리 분기 없음 |
</phase_requirements>

---

## Summary

이 페이즈는 새 라이브러리 도입이나 빌드 시스템 변경이 없는 순수 CSS 리팩토링 작업이다. 두 개의 라이브 버그(이중 backdrop-filter, 중복 `:root:not(.dark)` 블록)를 수정하고, 현재 1개 파일(custom.css)과 2개 컴포넌트 파일(chart-cards.css, home-market-overview.css)에 흩어진 `--mp-*` 변수 선언을 단일 소스(custom.css)로 통합하며, 3티어 토큰 계층(primitive → semantic → component)을 수립한다.

현재 custom.css는 591줄로, 89-104행과 218-230행에 `:root:not(.dark)` 블록이 두 개 존재한다. 두 번째 블록(218-230행)은 첫 번째보다 적은 변수를 선언하여 의도치 않은 오버라이드가 발생하고 있다. `toc-and-effects.css`의 `prefers-reduced-motion` 블록(510-531행)에는 `#TOCView`와 `.market-chart-card`가 빠져 있어 접근성 요건을 충족하지 못한다. `chart-cards.css` 1-7행과 `home-market-overview.css` 9-12행이 컴포넌트 파일에서 `--mp-*` 변수를 직접 선언하고 있어 단일 소스 원칙에 위배된다.

모바일 blur 최적화(FOUN-07)는 현재 전혀 구현되어 있지 않다. `--mp-glass-blur: blur(14px) saturate(1.4)`가 모든 화면 크기에 동일하게 적용된다. 640px 이하와 480px 이하에서 각각 8px, 4px로 자동 축소하는 미디어쿼리 분기를 `--mp-glass-blur` 변수 재정의로 구현해야 한다.

**Primary recommendation:** 모든 변경을 custom.css 단일 파일에 집중하고, 컴포넌트 CSS 파일(chart-cards.css, home-market-overview.css)에서 `:root` 선언 블록만 제거하여 custom.css로 이전한다. 새 선택자나 스타일은 추가하지 않는다.

---

## Current State Analysis (코드베이스 직접 조사 결과)

### custom.css의 중복 `:root:not(.dark)` 블록

**첫 번째 블록 (89-104행):**
```css
:root:not(.dark) {
  --mp-glass-bg: rgba(255, 255, 255, 0.9);
  --mp-glass-border: rgba(124, 58, 237, 0.15);
  --mp-shadow-sm: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
  --mp-neon-cyan: #0891B2;
  --mp-neon-purple: #7C3AED;
  --mp-color-up: #DC2626;
  --mp-color-down: #2563EB;
  --mp-ticker-up: #047857;
  --mp-ticker-down: #B91C1C;
  --mp-ticker-up-spark: #059669;
  --mp-ticker-down-spark: #DC2626;
  --mp-brand-color: var(--mp-brand-color-light);
  --mp-brand-color-rgb: 124 58 237;
}
```

**두 번째 블록 (218-230행):**
```css
/* Light Mode — Minimal Cyberpunk */
:root:not(.dark) {
  --mp-glass-bg: rgba(255, 255, 255, 0.9);
  --mp-glass-border: rgba(124, 58, 237, 0.15);
  --mp-shadow-sm: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
  --mp-neon-cyan: #0891B2;
  --mp-neon-purple: #7C3AED;
  --mp-color-up: #DC2626;
  --mp-color-down: #2563EB;
  --mp-ticker-up: #047857;
  --mp-ticker-down: #B91C1C;
  --mp-ticker-up-spark: #059669;
  --mp-ticker-down-spark: #DC2626;
  /* 누락: --mp-brand-color, --mp-brand-color-rgb */
}
```

두 블록의 값은 동일하나, 두 번째 블록이 `--mp-brand-color`와 `--mp-brand-color-rgb` 선언을 누락하고 있다. 통합 시 첫 번째 블록의 내용을 기준으로 삼고 두 번째 블록을 삭제한다.

### `toc-and-effects.css`의 `.mp-briefing-meta::before` nested backdrop-filter

파일: `assets/css/custom/toc-and-effects.css` (사실은 `custom.css` 424-442행에 위치)

```css
/* 부모 (커넥팅 컨테이너) - backdrop-filter 적용 중 */
.mp-briefing-meta {
  backdrop-filter: var(--mp-glass-blur);  /* blur(14px) */
}

/* 자식 ::before - 추가 backdrop-filter 적용 = 이중 blur */
.mp-briefing-meta::before {
  backdrop-filter: blur(8px);  /* ← 이 줄이 버그 */
}
```

`::before`는 `.mp-briefing-meta`의 stacking context 안에 있으므로 부모의 backdrop-filter가 이미 적용된 영역에 다시 blur를 걸어 이중 블러 아티팩트가 발생한다. 수정: `::before`에서 `backdrop-filter`와 `-webkit-backdrop-filter` 제거.

### `prefers-reduced-motion` 블록에 빠진 선택자

`toc-and-effects.css` 510-531행 기존 블록:
```css
@media (prefers-reduced-motion: reduce) {
  /* 현재 포함: .briefing-section, .mp-ticker-group, .mp-briefing-card, .mp-news-card, .mp-post-hero */
  /* 누락: #TOCView, .market-chart-card */
}
```

`#TOCView`는 `toc-and-effects.css` 147-162행에 `backdrop-filter: blur(16px) saturate(1.8)`가 적용되어 있다.
`.market-chart-card`는 `chart-cards.css` 20행에 `backdrop-filter: blur(12px)`가 적용되어 있다.

두 선택자 모두 `prefers-reduced-motion: reduce` 시 `backdrop-filter: none`이 필요하다.

### 컴포넌트 파일의 `--mp-*` 변수 선언 위반

현재 `custom.css` 외부에서 `--mp-*` 변수를 선언하는 파일:

| 파일 | 선언 변수 | 위치 |
|------|-----------|------|
| `chart-cards.css` | `--mp-chart-card-bg`, `--mp-chart-border`, `--mp-chart-accent`, `--mp-chart-cyan`, `--mp-chart-text-muted` | 1-7행 `:root {}` 블록 |
| `chart-cards.css` | `--mp-chart-card-bg`, `--mp-chart-border`, `--mp-chart-text-muted` (light) | 151-154행 `:root:not(.dark)` 블록 |
| `home-market-overview.css` | `--mp-orb-color-primary`, `--mp-orb-color-secondary` | 9-12행 `:root {}` 블록 |

이 선언들을 `custom.css`의 `:root` 블록과 `:root:not(.dark)` 블록으로 각각 이전하고, 컴포넌트 파일에서는 `:root` 블록을 완전히 제거한다.

### 현재 blur 구조 (FOUN-07)

`custom.css` 47행: `--mp-glass-blur: blur(14px) saturate(1.4);`

이 값이 모든 viewport에 동일하게 적용된다. 640px 이하에서 `--mp-glass-blur: blur(8px) saturate(1.2)`, 480px 이하에서 `--mp-glass-blur: blur(4px) saturate(1.1)`로 재정의하는 미디어쿼리가 없다. 하드코딩된 blur 값(`blur(16px)`, `blur(12px)`, `blur(15px)` 등)을 직접 사용하는 컴포넌트 파일들은 이번 페이즈 범위 밖이지만, `--mp-glass-blur` 변수를 사용하는 컴포넌트들은 변수 재정의만으로 자동 혜택을 받는다.

---

## Standard Stack

### Core

이 페이즈는 외부 라이브러리를 사용하지 않는다. 순수 CSS 작업이다.

| 기술 | 버전/사양 | 목적 | 근거 |
|------|-----------|------|------|
| CSS Custom Properties | Level 4 (현재 모든 브라우저 지원) | 3티어 토큰 시스템 | 프로젝트 기존 접근방식. SCSS/PostCSS 도입 금지 결정 |
| `@media (prefers-reduced-motion)` | CSS Media Queries Level 5 | 접근성 모션 제어 | WCAG 2.1 AA 요건, 이미 부분 적용 중 |
| `:root:not(.dark)` | CSS Selectors Level 4 | 라이트 모드 분기 | 프로젝트 다크 모드 구현 방식 (클래스 토글) |

### 프로젝트 결정 (변경 불가)

- SCSS/PostCSS 도입 금지 — 순수 CSS 유지
- Tailwind CSS 도입 금지
- 다크 모드는 `.dark` 클래스 토글만 사용 — `@media prefers-color-scheme` 사용 금지
- ECharts CSS 변수 불인식 — 차트 색상은 params.toml에 미러링

---

## Architecture Patterns

### 3티어 CSS 변수 계층 (FOUN-04 목표)

```
Tier 1: Primitive Tokens (custom.css :root 블록)
├── --mp-color-violet-600: #7C3AED       (raw color)
├── --mp-color-cyan-dark: #0891B2        (raw color)
├── --mp-blur-base: 14px                 (raw value)
└── --mp-blur-mobile: 8px               (raw value)

Tier 2: Semantic Tokens (custom.css :root 및 :root:not(.dark) 블록)
├── --mp-neon-purple: var(--mp-color-violet-600)   (maps primitive to usage)
├── --mp-glass-blur: blur(var(--mp-blur-base)) saturate(1.4)
└── --mp-brand-color: var(--mp-brand-color-light)  (mode-aware)

Tier 3: Component Tokens (custom.css :root 블록, 컴포넌트 파일에서 소비)
├── --mp-chart-card-bg: rgba(10, 10, 26, 0.85)
├── --mp-chart-border: rgba(124, 58, 237, 0.25)
└── --mp-orb-color-primary: 124 58 237
```

**현실적 접근:** 현 코드베이스에서 primitive/semantic 계층을 완전히 분리하면 변수명이 대규모 변경된다. 이번 페이즈의 실용적 목표는:
1. 모든 `--mp-*` 선언을 custom.css로 이전 (단일 소스)
2. 기존 변수명 유지 (컴포넌트 파일 소비 코드 변경 없음)
3. 라이트/다크 값 분리 명확화

### 권장 custom.css 변수 블록 구조

```css
/* === Tier 1: Primitive Tokens (mode-independent) === */
:root {
  /* Neon Color Primitives */
  --mp-neon-purple: #7C3AED;
  --mp-neon-cyan: #00F0FF;
  --mp-neon-rose: #F43F5E;
  --mp-neon-green: #00FF88;
  --mp-neon-pink: #FF3366;
  --mp-neon-yellow: #FFD600;
  --mp-neon-blue: #3388FF;

  /* Brand */
  --mp-brand-color-light: #7C3AED;
  --mp-brand-color-dark: #A78BFA;

  /* Blur Primitives (for FOUN-07) */
  --mp-blur-desktop: blur(14px) saturate(1.4);
  --mp-blur-mobile: blur(8px) saturate(1.2);
  --mp-blur-reduced: blur(4px) saturate(1.1);

  /* === Tier 2: Semantic Tokens (dark mode default) === */
  --mp-glass-bg: rgba(18, 18, 42, 0.72);
  --mp-glass-border: rgba(124, 58, 237, 0.25);
  --mp-glass-blur: var(--mp-blur-desktop);
  --mp-brand-color: var(--mp-brand-color-dark);
  --mp-brand-color-rgb: 167 139 250;

  /* === Tier 3: Component Tokens === */
  --mp-chart-card-bg: rgba(10, 10, 26, 0.85);
  --mp-chart-border: rgba(124, 58, 237, 0.25);
  --mp-chart-accent: #7c3aed;
  --mp-chart-cyan: #00f0ff;
  --mp-chart-text-muted: #64748b;
  --mp-orb-color-primary: 124 58 237;
  --mp-orb-color-secondary: 0 240 255;

  /* ... (기존 변수 유지) */
}

/* === Light Mode Overrides (단일 블록, FOUN-01 통합) === */
:root:not(.dark) {
  --mp-glass-bg: rgba(255, 255, 255, 0.9);
  --mp-glass-border: rgba(124, 58, 237, 0.15);
  --mp-shadow-sm: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
  --mp-neon-cyan: #0891B2;
  --mp-neon-purple: #7C3AED;
  --mp-color-up: #DC2626;
  --mp-color-down: #2563EB;
  --mp-ticker-up: #047857;
  --mp-ticker-down: #B91C1C;
  --mp-ticker-up-spark: #059669;
  --mp-ticker-down-spark: #DC2626;
  --mp-brand-color: var(--mp-brand-color-light);
  --mp-brand-color-rgb: 124 58 237;
  /* Chart light mode */
  --mp-chart-card-bg: rgba(255, 255, 255, 0.95);
  --mp-chart-border: rgba(124, 58, 237, 0.15);
  --mp-chart-text-muted: #94a3b8;
}

/* === Mobile Blur Reduction (FOUN-07) === */
@media (max-width: 640px) {
  :root {
    --mp-glass-blur: blur(8px) saturate(1.2);
  }
}
@media (max-width: 480px) {
  :root {
    --mp-glass-blur: blur(4px) saturate(1.1);
  }
}

/* === Dark mode brand override === */
.dark {
  --mp-brand-color: var(--mp-brand-color-dark);
  --mp-brand-color-rgb: 167 139 250;
}
```

**주의:** 위 구조는 의도된 최종 목표 형태이며, 실제 작업 순서는 검증 가능한 단계별로 나눠야 한다.

### Anti-Patterns to Avoid

- **`:root:not(.dark)` 블록을 여러 개 생성하지 말 것:** 이번 페이즈의 핵심이 통합이다. 새 블록을 만들면 FOUN-01 목표 위반.
- **컴포넌트 CSS 파일에 `:root {}` 블록 남겨두지 말 것:** FOUN-04의 핵심은 선언의 단일 소스화.
- **변수명 변경하지 말 것:** 14개 컴포넌트 파일이 현재 이름으로 소비 중. 이름 변경은 다른 파일까지 연쇄 수정이 필요하고 이번 페이즈 범위 밖.
- **`--mp-blur-desktop` 같은 새 primitive를 `--mp-glass-blur`에 참조하지 말 것 (선택적):** CSS `var()` 안에서 함수 합성이 불가하므로 `blur(var(--mp-blur-desktop))` 형태는 지원되지 않는다. 변수값이 함수 전체(`blur(14px) saturate(1.4)`)를 포함해야 한다.

---

## Don't Hand-Roll

| 문제 | 직접 구현 금지 | 사용할 방법 | 이유 |
|------|----------------|-------------|------|
| CSS 변수 중복 감지 | 직접 파서 작성 | Grep으로 `:root:not(.dark)` 블록 수 확인 | 검증은 텍스트 검색으로 충분 |
| 다크/라이트 모드 전환 | JS로 변수 재정의 | CSS 클래스 토글 + CSS 변수 | 이미 작동하는 방식. JS 개입 불필요 |
| blur 값 모바일 최적화 | JS로 viewport 감지 후 style 주입 | `@media` + `:root` 변수 재정의 | 순수 CSS로 가능, JS 없이 더 안정적 |

---

## Common Pitfalls

### Pitfall 1: CSS 변수 계층 순서 오류
**What goes wrong:** `:root:not(.dark)` 블록을 `:root` 블록 앞에 두면 dark mode 기본값이 light mode 값을 오버라이드한다.
**Why it happens:** CSS cascade에서 동일 specificity는 나중에 선언된 쪽이 이긴다.
**How to avoid:** 항상 `순서: :root {} → :root:not(.dark) {} → .dark {}`. 이 순서를 custom.css 상단에 주석으로 명시.
**Warning signs:** 다크 모드에서 라이트 모드 색상이 보임.

### Pitfall 2: `var()` 함수 내부에서 다른 함수 합성 불가
**What goes wrong:** `--mp-glass-blur: blur(var(--mp-blur-amount)) saturate(1.4)` 는 작동하지 않는다.
**Why it happens:** CSS `var()`은 함수 인수로 다른 함수 합성을 지원하지 않는다 (Level 4 스펙 제한).
**How to avoid:** blur 변수는 함수 전체를 포함해야 한다: `--mp-glass-blur: blur(14px) saturate(1.4)`. 모바일에서는 `:root` 에서 `--mp-glass-blur` 자체를 재정의.
**Warning signs:** `backdrop-filter`가 적용되지 않음.

### Pitfall 3: `backdrop-filter`와 stacking context 충돌
**What goes wrong:** 부모와 자식 `::before`에 동시에 `backdrop-filter`를 적용하면 이중 블러 발생.
**Why it happens:** `::before`는 부모의 stacking context 안에 있지만, 독립적인 blurring context를 생성한다. 부모가 이미 blur된 배경을 자식이 다시 blur한다.
**How to avoid:** `::before`와 같은 레이블 pseudo-element에는 `backdrop-filter` 사용 금지. 배경 강조는 `background` 색상만 사용.
**Warning signs:** 라벨 뒤 배경이 과도하게 뿌옇거나 이중 층으로 보임.

### Pitfall 4: prefers-reduced-motion에서 backdrop-filter 제거 누락
**What goes wrong:** 모션을 줄이는 설정을 한 사용자도 `backdrop-filter`의 GPU 부하를 받는다.
**Why it happens:** `prefers-reduced-motion`을 애니메이션/트랜지션만 적용하고 `backdrop-filter`는 포함하지 않는 경우.
**How to avoid:** 모든 `backdrop-filter`를 사용하는 주요 컴포넌트를 `prefers-reduced-motion: reduce` 블록에 포함. 특히 sticky/fixed 요소(`#TOCView`).
**Warning signs:** 접근성 검사에서 reduced motion 설정 시 레이아웃 성능 저하.

### Pitfall 5: 두 번째 `:root:not(.dark)` 블록 삭제 시 누락 변수
**What goes wrong:** 두 블록의 변수가 완전히 동일하다고 가정하고 첫 번째를 삭제하면 실제로는 두 번째 블록에만 있는 변수를 잃는다.
**Why it happens:** 두 블록이 대부분 같아 보이지만 미묘하게 다를 수 있다.
**How to avoid:** 삭제 전 두 블록의 변수 목록을 diff하고, 통합된 블록에 모든 변수가 존재하는지 확인.
**Warning signs:** 통합 후 특정 UI 요소의 색상이 변경됨.

---

## Code Examples

### FOUN-01: 통합 후 단일 `:root:not(.dark)` 블록

```css
/* Source: custom.css 조사, 두 블록 union 결과 */
:root:not(.dark) {
  /* custom.css 89-104행 + 218-230행 통합 */
  --mp-glass-bg: rgba(255, 255, 255, 0.9);
  --mp-glass-border: rgba(124, 58, 237, 0.15);
  --mp-shadow-sm: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
  --mp-neon-cyan: #0891B2;
  --mp-neon-purple: #7C3AED;
  --mp-color-up: #DC2626;
  --mp-color-down: #2563EB;
  --mp-ticker-up: #047857;
  --mp-ticker-down: #B91C1C;
  --mp-ticker-up-spark: #059669;
  --mp-ticker-down-spark: #DC2626;
  --mp-brand-color: var(--mp-brand-color-light);
  --mp-brand-color-rgb: 124 58 237;
  /* chart-cards.css에서 이전된 light mode 변수 (FOUN-04) */
  --mp-chart-card-bg: rgba(255, 255, 255, 0.95);
  --mp-chart-border: rgba(124, 58, 237, 0.15);
  --mp-chart-text-muted: #94a3b8;
}
```

### FOUN-02: `::before` nested backdrop-filter 제거

```css
/* Source: toc-and-effects.css 424-442행 현재 상태 → 수정 후 */

/* 수정 후 */
.mp-briefing-meta::before {
  content: '// META';
  position: absolute;
  top: -10px;
  left: 12px;
  background: rgba(10, 10, 26, 0.85);  /* opaque 배경으로 충분 */
  /* 제거: -webkit-backdrop-filter: blur(8px); */
  /* 제거: backdrop-filter: blur(8px); */
  padding: 2px 10px;
  font-family: var(--mp-font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--mp-neon-purple);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 2px;
  z-index: 10;
}
```

### FOUN-03: prefers-reduced-motion 블록에 선택자 추가

```css
/* Source: toc-and-effects.css 510-531행 기존 블록에 추가 */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
  .briefing-section,
  .mp-ticker-group,
  .mp-briefing-card,
  .mp-news-card,
  .mp-post-hero,
  #TOCView,                   /* 추가 */
  .market-chart-card {        /* 추가 */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  /* ... 기존 나머지 rules 유지 */
}
```

### FOUN-07: 모바일 blur 최적화 변수 재정의

```css
/* Source: FOUN-07 요건 (현재 존재하지 않는 코드) */
/* 이 블록들은 custom.css의 :root {} 블록 다음에 위치 */

@media (max-width: 640px) {
  :root {
    --mp-glass-blur: blur(8px) saturate(1.2);
  }
}

@media (max-width: 480px) {
  :root {
    --mp-glass-blur: blur(4px) saturate(1.1);
  }
}
```

### FOUN-04: chart-cards.css에서 `:root` 블록 제거 예시

```css
/* chart-cards.css 수정 후: :root 블록 제거, 변수는 custom.css로 이전 */
/* 제거:
:root {
  --mp-chart-card-bg: rgba(10, 10, 26, 0.85);
  --mp-chart-border: rgba(124, 58, 237, 0.25);
  --mp-chart-accent: #7c3aed;
  --mp-chart-cyan: #00f0ff;
  --mp-chart-text-muted: #64748b;
}
*/

/* 파일 첫 줄부터 .market-chart-card 선택자로 시작 */
.market-chart-card {
  /* 변수 소비는 그대로 유지 */
  border: 1px solid var(--mp-chart-border);
  background: var(--mp-chart-card-bg);
  /* ... */
}
```

---

## State of the Art

| 구 접근 | 현재 접근 | 변경 이유 | 영향 |
|---------|-----------|-----------|------|
| 여러 `:root:not(.dark)` 블록 | 단일 통합 블록 | CSS cascade 예측성 | 중복 제거, 관리 용이 |
| 컴포넌트별 변수 선언 | custom.css 단일 선언 | 단일 소스 원칙 | 변수 변경이 한 파일만 수정 |
| 고정 blur 값 | 반응형 blur 변수 | 모바일 GPU 부하 | 모바일 성능 개선 |

---

## Open Questions

1. **`--mp-glass-blur` 변수를 사용하지 않는 컴포넌트 파일들**
   - What we know: `calendar.css` 133-134행 `blur(15px)`, `toc-and-effects.css` 151-152행 `blur(16px) saturate(1.8)`, `layout-overrides.css` 127행 `blur(16px)` 등은 변수 대신 하드코딩된 blur 값을 사용
   - What's unclear: 이번 페이즈에서 이 하드코딩 값도 변수로 교체해야 하는지 (FOUN-07 범위)
   - Recommendation: FOUN-07 성공 기준 5번("640px 이하에서 blur 8px, 480px 이하에서 4px")은 `--mp-glass-blur` 변수를 소비하는 요소에만 즉시 적용된다. 하드코딩 blur 값의 교체는 Phase 5(Performance)로 미룬다.

2. **3티어 계층 명명 규칙**
   - What we know: 현재 변수명이 semantic 수준(`--mp-glass-bg`, `--mp-neon-cyan`)과 primitive 수준(`--mp-brand-color-light`) 이 혼재
   - What's unclear: primitive 변수에 새 이름을 도입하면 기존 소비 코드가 깨짐
   - Recommendation: 이번 페이즈에서 새 primitive 변수명 도입 없이, 단일 소스화만 달성. Tier 1/2/3 구분은 주석으로만 표시.

3. **`chart-cards.css`의 `:root:not(.dark)` 블록 처리**
   - What we know: `chart-cards.css` 151-154행에 `--mp-chart-*` 라이트 모드 오버라이드가 있음
   - What's unclear: 이를 `custom.css`의 `:root:not(.dark)` 단일 블록에 통합하면 CSS 로드 순서 의존성이 생길 수 있음 (chart-cards.css가 custom.css 이후 로드되면 component 변수가 global을 오버라이드)
   - Recommendation: CSS 로드 순서를 `extend-head-uncached.html`에서 확인 후 결정. 일반적으로 custom.css가 먼저 로드되므로 component 파일의 `:root:not(.dark)` 선언이 이후에 오버라이드할 수 있다. 안전책: chart light mode 변수는 custom.css의 `:root:not(.dark)`로 이전하고 chart-cards.css에서 제거.

---

## Sources

### Primary (HIGH confidence)
- `assets/css/custom.css` 직접 조사 — 591줄 전체, 두 `:root:not(.dark)` 블록 확인 (89-104행, 218-230행)
- `assets/css/custom/toc-and-effects.css` 직접 조사 — `#TOCView` backdrop-filter 확인, prefers-reduced-motion 블록 누락 확인
- `assets/css/custom/chart-cards.css` 직접 조사 — `:root {}` 변수 선언 블록 확인
- `assets/css/custom/home-market-overview.css` 직접 조사 — `:root {}` 변수 선언 블록 확인
- `.planning/REQUIREMENTS.md` — FOUN-01~07 요건 정의
- `.planning/codebase/CONCERNS.md` — CSS cascade complexity 확인

### Secondary (MEDIUM confidence)
- CSS Custom Properties 스펙: `var()` 내부에서 함수 합성 불가 — MDN 문서 기반 (훈련 데이터, 2025년 기준으로 안정된 스펙)
- `backdrop-filter` stacking context 동작 — MDN 문서 기반 (훈련 데이터)
- CSS Media Queries Level 5: `prefers-reduced-motion` — W3C 스펙 기반, 모든 현대 브라우저 지원

### Tertiary (LOW confidence)
- 없음

---

## Metadata

**Confidence breakdown:**
- 버그 위치 및 수정법 (FOUN-01, 02, 03): HIGH — 코드 직접 조사로 확인
- 변수 선언 위치 (FOUN-04): HIGH — 코드 직접 조사로 확인
- 3티어 토큰 구조 (FOUN-04): MEDIUM — 패턴은 검증됐지만 최적 명명 규칙은 프로젝트 판단 영역
- 다크/라이트 팔레트 값 (FOUN-05, 06): HIGH — 기존 코드에서 직접 추출
- 모바일 blur 구현법 (FOUN-07): HIGH — CSS `@media` + `:root` 변수 재정의 패턴
- CSS `var()` 함수 합성 제한: MEDIUM — 훈련 데이터 기반, 공식 스펙으로 검증 권장

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (CSS 스펙은 안정적, 30일 유효)
