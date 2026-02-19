# Phase 2: Icons & Navigation - Research

**Researched:** 2026-02-19
**Domain:** Phosphor Icons CDN 통합 + Blowfish 헤더 CSS 오버라이드 + 모바일 바텀 네비게이션
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ICON-01 | Phosphor Icons v2 CDN 통합 (jsDelivr, extend-head-uncached.html에 추가) | `@phosphor-icons/web@2.1.2` CDN URL 패턴 확인. 선택적 weight 로드로 ~200KB 이하 유지 가능. `extend-head-uncached.html` 구조 조사 완료 |
| ICON-02 | 기존 인라인 SVG/텍스트 아이콘을 Phosphor 아이콘으로 교체 | 교체 대상 완전히 조사됨: `footer.html` 이모지 4개(🏠📰🏷️⬆️), footer SVG 막대 그래프(장식적). ECG SVG는 교체 범위 밖(브랜드 요소) |
| NAV-01 | Frosted glass 스타일의 스티키 헤더 구현 (backdrop-filter + 반투명 배경) | Blowfish `header.layout = "fixed"` 설정 확인. `fixed.html` 이미 `#menu-blur` + JS scroll-opacity 패턴 사용. 커스텀 CSS 오버라이드로 구현 가능 |
| NAV-02 | 다크/라이트 모드 모두에서 네비게이션 가독성 보장 | `cyberpunk.css` 색상 토큰 확인 (`--color-primary-400: 124 58 237`). 다크: 텍스트는 neutral-100 위에, 라이트: neutral-900 위에. Blowfish `bf-icon-color-hover` 패턴 확인 |
| NAV-03 | 모바일 반응형 네비게이션 개선 | 기존 `#mp-mobile-bottom-nav` 이미 존재 (layout-overrides.css 114행). Blowfish 모바일 메뉴도 존재. 이모지 → Phosphor 교체가 핵심 |
</phase_requirements>

---

## Summary

Phase 2는 세 개의 독립적인 작업 묶음으로 구성된다. 첫 번째는 Phosphor Icons v2 CDN을 `extend-head-uncached.html`에 추가하는 것(ICON-01)이다. 두 번째는 `footer.html`의 이모지 아이콘 4개와 SVG 막대 그래프를 Phosphor 아이콘으로 교체하는 것(ICON-02)이다. 세 번째는 Blowfish의 기존 `fixed` 헤더 위에 `--mp-glass-*` 변수를 활용한 frosted glass CSS를 오버라이드하는 것(NAV-01~03)이다.

외부 라이브러리 추가는 Phosphor Icons 하나뿐이다(`@phosphor-icons/web@2.1.2`). 나머지는 모두 기존 CSS 파일 수정과 HTML 템플릿 교체다. Blowfish는 이미 `header.layout = "fixed"`를 통해 고정 헤더 패턴을 제공하며 `#menu-blur` 요소가 스크롤에 따라 opacity를 변경하는 JS까지 내장되어 있다. 이 메커니즘을 활용하되 배경 색상과 blur를 `--mp-glass-*` 토큰으로 교체하면 NAV-01 요건을 달성한다.

**Primary recommendation:** Phosphor `bold` + `regular` weight만 선택 로드(~120KB), `footer.html` 이모지를 `<i class="ph-bold ph-*"></i>` 패턴으로 교체, `layout-overrides.css`에 `#menu-blur` 오버라이드 CSS 추가.

---

## Standard Stack

### Core

| 라이브러리 | 버전 | 목적 | 근거 |
|-----------|------|------|------|
| `@phosphor-icons/web` | 2.1.2 | 아이콘 시스템 CDN 통합 | ICON-01 요건. jsDelivr 최신 버전(2025-03-31). MIT 라이선스. |

### Supporting

이 페이즈는 외부 라이브러리를 Phosphor Icons 하나만 추가한다. 나머지는 프로젝트 기존 스택(순수 CSS + Hugo partial 오버라이드)이다.

### Alternatives Considered

| 대신 | 사용 가능한 것 | 트레이드오프 |
|------|---------------|-------------|
| `@phosphor-icons/web@2.1.2` CSS 방식 | Phosphor Web Components (`@phosphor-icons/webcomponents`) | Web Components는 Shadow DOM을 사용해 CSS 상속이 끊어짐. CSS 방식이 Hugo/Blowfish 환경에서 더 안정적 |
| `bold` + `regular` 두 weight만 로드 | 전체 `<script src="...">` 방식 (6개 weight 전부) | 전체 로드는 ~3MB. bold+regular는 ~120KB. 성능 차이 큼 |
| Phosphor Icons | Font Awesome, Material Icons | ICON-01 요건에서 Phosphor로 명시. 변경 불가 |

**Installation:** CDN only — npm 설치 없음

```html
<!-- extend-head-uncached.html에 추가 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

---

## Architecture Patterns

### 현재 코드베이스 상태 (조사 결과)

#### 헤더 구조

```
params.toml:
  [header]
    layout = "fixed"

→ Blowfish가 렌더하는 파일:
  themes/blowfish/layouts/partials/header/fixed.html
```

`fixed.html` 내용 (핵심):
```html
<div class="min-h-[148px]"></div>  <!-- 헤더 높이만큼 여백 -->
<div class="fixed inset-x-0 z-100">
  <div
    id="menu-blur"
    class="absolute opacity-0 inset-x-0 top-0 h-full
           single_hero_background nozoom
           backdrop-blur-2xl shadow-2xl
           bg-neutral/25 dark:bg-neutral-800/25"></div>
  <div class="relative m-auto leading-7 max-w-7xl px-6 sm:px-14 md:px-24 lg:px-32">
    {{ partial "header/basic.html" . }}
  </div>
</div>
<script ... data-blur-id="menu-blur"></script>
```

`background-blur.js` 동작:
- 스크롤 위치에 따라 `#menu-blur`의 `opacity`를 `scroll / 300`으로 조절
- 페이지 최상단에서는 투명, 스크롤 내릴수록 불투명해짐

#### 현재 아이콘 현황

**교체 대상 (ICON-02 범위):**
| 파일 | 위치 | 현재 아이콘 | 제안 교체 |
|------|------|------------|----------|
| `layouts/partials/footer.html` | 모바일 바텀 네비 홈 버튼 | `🏠` (이모지) | `ph-bold ph-house` |
| `layouts/partials/footer.html` | 모바일 바텀 네비 브리핑 버튼 | `📰` (이모지) | `ph-bold ph-newspaper` |
| `layouts/partials/footer.html` | 모바일 바텀 네비 태그 버튼 | `🏷️` (이모지) | `ph-bold ph-tag` |
| `layouts/partials/footer.html` | 모바일 바텀 네비 맨 위로 버튼 | `⬆️` (이모지) | `ph-bold ph-arrow-up` |
| `layouts/partials/footer.html` | 푸터 SVG 막대 그래프 (장식) | 인라인 SVG 7개 rect | 유지 (브랜드 비주얼) OR `ph-bold ph-chart-bar` |

**교체 범위 밖:**
- `layouts/partials/home/custom.html` ECG SVG — 브랜드 고유 시각 요소, 교체하지 않음
- Blowfish 테마 내장 아이콘 (`bars`, `xmark`, `chevron-down`, `moon`, `sun`, `search`) — Blowfish 자체 SVG 시스템, 교체 불필요

#### CSS 파일 구조

```
assets/css/
├── custom.css              ← 전역 변수 (--mp-glass-*, --mp-neon-*, etc.)
├── custom/
│   └── layout-overrides.css  ← 헤더 오버라이드 추가 위치
└── schemes/
    └── cyberpunk.css       ← Blowfish 색상 토큰 정의
```

### Pattern 1: Phosphor Icons CDN 로드 (선택적 weight)

**What:** 필요한 weight CSS 파일만 로드해 용량 최소화
**When to use:** 특정 weight 2개 이하를 사용할 때
**Example:**
```html
<!-- Source: github.com/phosphor-icons/web README, CDN 방식 -->
<!-- extend-head-uncached.html의 기존 fonts_css_url 링크 아래에 추가 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

아이콘 사용 패턴:
```html
<!-- bold weight -->
<i class="ph-bold ph-house"></i>
<!-- regular weight -->
<i class="ph ph-house"></i>
```

### Pattern 2: Frosted Glass 헤더 CSS 오버라이드

**What:** Blowfish `#menu-blur`의 Tailwind 클래스를 `--mp-glass-*` 변수로 오버라이드
**When to use:** 테마 파일 수정 없이 커스텀 CSS로 헤더 스타일 교체할 때

`layout-overrides.css`에 추가:
```css
/* Source: 코드베이스 조사 결과 + Phase 1 glass 변수 시스템 */

/* NAV-01: Frosted glass sticky header */
#menu-blur {
  /* Blowfish의 bg-neutral/25, dark:bg-neutral-800/25 오버라이드 */
  background: rgba(10, 10, 26, 0.75) !important;    /* 다크 모드 기본 */
  -webkit-backdrop-filter: var(--mp-glass-blur) !important;
  backdrop-filter: var(--mp-glass-blur) !important;
  border-bottom: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.4);
}

/* NAV-02: 라이트 모드 대비 */
:root:not(.dark) #menu-blur {
  background: rgba(255, 255, 255, 0.85) !important;
  border-bottom-color: rgba(124, 58, 237, 0.1);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.08);
}
```

**핵심:** `!important`를 사용하는 이유는 Blowfish의 Tailwind 클래스(`bg-neutral/25`)가 이미 적용되어 있기 때문. 일반 특이성으로는 오버라이드 불가.

### Pattern 3: 모바일 바텀 네비 아이콘 교체

**What:** `footer.html`의 이모지 `<span>` → `<i>` 태그로 교체
**Example:**
```html
<!-- 변경 전 -->
<span class="mp-nav-icon">🏠</span>

<!-- 변경 후 -->
<i class="mp-nav-icon ph-bold ph-house"></i>
```

CSS에서 `.mp-nav-icon` 폰트 크기와 색상은 유지. Phosphor 아이콘은 `font-size`와 `color`를 상속받으므로 기존 `.mp-nav-icon { font-size: 1.2rem; }` 그대로 동작.

**주의:** `font-family`, `font-weight`, `text-transform`을 `.mp-nav-icon`에 적용하지 말 것 (Phosphor 아이콘 렌더링 파괴).

### Anti-Patterns to Avoid

- **Blowfish 테마 파일 직접 수정 금지:** `themes/blowfish/layouts/partials/header/fixed.html` 수정하지 말 것. Hugo 테마 업데이트 시 덮어씌워짐. 대신 CSS 오버라이드만 사용.
- **`backdrop-blur-2xl` Tailwind 클래스 의존 금지:** `#menu-blur`에 이미 있는 Tailwind backdrop-blur는 CSS 오버라이드 후에도 남아있어 이중 적용될 수 있음. `backdrop-filter: none`으로 먼저 리셋 후 `var(--mp-glass-blur)` 적용.
- **이모지 아이콘의 OS 렌더링 차이:** 이모지는 iOS/Android/Windows에서 시각적으로 다르게 보임. Phosphor 교체로 일관성 확보.
- **전체 weight 로드 금지:** `<script src=".../web@2.1.2">` 방식은 3MB 로드. 반드시 필요한 weight CSS만 선택 로드할 것.
- **`font-family` 오버라이드 금지:** `.mp-nav-icon`에 `font-family: var(--mp-font-sans)`처럼 폰트를 지정하면 Phosphor 아이콘 폰트가 깨짐.

---

## Don't Hand-Roll

| 문제 | 직접 구현 금지 | 사용할 방법 | 이유 |
|------|----------------|-------------|------|
| 스크롤 감지 헤더 투명도 | JS로 scroll listener + opacity 직접 제어 | Blowfish `background-blur.js` 기존 메커니즘 활용 | 이미 구현됨. `#menu-blur` CSS만 교체하면 됨 |
| 아이콘 SVG 직접 인라인 | `<svg>` 마크업 수작업 | Phosphor CDN CSS + `<i>` 태그 | CDN 방식이 접근성(aria), 스케일링, 색상 상속 모두 처리 |
| 헤더 고정 위치 JS | IntersectionObserver, position 계산 | Blowfish `position: fixed` + `min-h-[148px]` spacer 패턴 | 이미 구현됨. CSS 수정만 필요 |

---

## Common Pitfalls

### Pitfall 1: Blowfish Tailwind backdrop-blur 중복 적용

**What goes wrong:** `#menu-blur`에 `backdrop-blur-2xl` (Tailwind) + `backdrop-filter: var(--mp-glass-blur)` (커스텀)가 동시 적용되면 두 필터가 합산됨
**Why it happens:** Tailwind가 `--tw-backdrop-blur` 변수로 backdrop-filter를 설정하고, 우리의 `!important`가 전체 backdrop-filter를 교체함. `--tw-backdrop-*` 변수는 남아있음
**How to avoid:** 커스텀 CSS에서 `backdrop-filter: var(--mp-glass-blur) !important`로 Tailwind 값을 완전히 교체. Tailwind의 `--tw-backdrop-blur` 변수는 무시됨 (단축 속성 교체이므로)
**Warning signs:** 헤더가 지나치게 뿌옇게 보임 (이중 blur 아티팩트, Phase 1 FOUN-02와 동일한 패턴)

### Pitfall 2: `!important` 없이 Blowfish 클래스 오버라이드

**What goes wrong:** `#menu-blur { background: ... }` 커스텀 CSS가 Tailwind utility class `bg-neutral/25`에 밀림
**Why it happens:** Tailwind 컴파일 CSS가 `main.css`에서 먼저 로드되고, 커스텀 CSS가 `extend-head-uncached.html`에서 이후 로드되지만, Tailwind의 `@layer utilities` 특이성이 복잡함
**How to avoid:** Blowfish 기본값을 오버라이드할 때는 `!important` 필수. 단, 커스텀 컴포넌트(`.mp-*`)에는 `!important` 불필요
**Warning signs:** 다크 모드에서 헤더 배경이 검정이 아닌 회색으로 보임

### Pitfall 3: Phosphor `ph-regular` 클래스 오해

**What goes wrong:** regular weight 아이콘에 `class="ph-regular ph-house"`처럼 사용
**Why it happens:** 다른 아이콘 라이브러리(Font Awesome 등)가 `fa-regular` 패턴을 사용하여 혼동
**How to avoid:** Phosphor regular weight는 `ph` (접두사만), bold는 `ph-bold`. `<i class="ph ph-house"></i>` (regular), `<i class="ph-bold ph-house"></i>` (bold)
**Warning signs:** 아이콘이 아무것도 표시되지 않음 (CSS class miss)

### Pitfall 4: 라이트 모드 헤더 텍스트 대비 부족

**What goes wrong:** 라이트 모드에서 반투명 흰색 헤더 배경(`rgba(255,255,255,0.85)`) 위에 기본 텍스트 색상이 흰색이어서 텍스트가 보이지 않음
**Why it happens:** Blowfish cyberpunk 테마가 `--color-neutral: 226 232 240` (밝은 색)을 링크 색으로 사용하고, 라이트 배경이 이와 비슷한 밝기
**How to avoid:** 라이트 모드 헤더 텍스트/링크에 명시적 다크 색상 적용 (`#1E293B` 또는 `var(--mp-neon-purple)`). `.main-menu a`, `.main-menu span` 선택자 활용
**Warning signs:** 라이트 모드 탭에서 메뉴 항목이 안 보임

### Pitfall 5: `#menu-blur` `opacity` 초기값 0

**What goes wrong:** 커스텀 CSS에서 `opacity: 1 !important`를 추가하면 스크롤 JS 효과가 무력화됨
**Why it happens:** `background-blur.js`가 `element.style.opacity = scroll/300`으로 opacity를 인라인 스타일로 제어. CSS로 `opacity`를 설정하면 초기 상태는 오버라이드되지만 JS가 인라인으로 덮어씀
**How to avoid:** `#menu-blur`의 `opacity`는 건드리지 말 것. 초기값 `0`은 의도된 것 (스크롤 없을 때 투명). `background`와 `backdrop-filter`만 오버라이드

### Pitfall 6: Phosphor 아이콘 `font-family` 상속 파괴

**What goes wrong:** `.mp-nav-icon`에 `font-family: var(--mp-font-sans)` 같은 폰트 지정이 있으면 아이콘이 문자 코드(예: `\e036`)로 표시됨
**Why it happens:** Phosphor는 아이콘 폰트 파일을 사용. `font-family` 재정의가 폰트 파일 로드를 우선순위에서 밀어냄
**How to avoid:** `.mp-nav-icon`에서 `font-family` 속성 제거. Phosphor 아이콘 요소에 `font-family`, `font-weight`, `font-style`, `font-variant`, `text-transform` 적용 금지
**Warning signs:** 아이콘 위치에 이상한 글자나 네모 박스가 표시됨

---

## Code Examples

### ICON-01: extend-head-uncached.html에 Phosphor CDN 추가

```html
<!-- Source: github.com/phosphor-icons/web README -->
<!-- 기존 fonts_css_url 링크 바로 아래에 추가 -->
<link rel="stylesheet" href="{{ $fontsCssUrl }}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

**왜 두 weight?** 모바일 바텀 네비는 `bold` (가시성), 향후 텍스트 인라인 아이콘은 `regular`

### ICON-02: footer.html 이모지 교체 패턴

```html
<!-- Source: 코드베이스 조사 — layouts/partials/footer.html 74-89행 -->

<!-- 변경 전 (현재) -->
<a href="{{ $homePath | relURL }}" class="mp-nav-item {{ if .IsHome }}active{{ end }}">
  <span class="mp-nav-icon">🏠</span>
  <span>Home</span>
</a>
<a href="{{ $postsPath | relURL }}" class="mp-nav-item {{ if eq .Section "posts" }}active{{ end }}">
  <span class="mp-nav-icon">📰</span>
  <span>Briefing</span>
</a>
<a href="{{ $tagsPath | relURL }}" class="mp-nav-item {{ if eq .Section "tags" }}active{{ end }}">
  <span class="mp-nav-icon">🏷️</span>
  <span>Tags</span>
</a>
<a href="#" data-scroll-top="true" class="mp-nav-item mp-nav-item--top">
  <span class="mp-nav-icon">⬆️</span>
  <span>Top</span>
</a>

<!-- 변경 후 -->
<a href="{{ $homePath | relURL }}" class="mp-nav-item {{ if .IsHome }}active{{ end }}">
  <i class="mp-nav-icon ph-bold ph-house" aria-hidden="true"></i>
  <span>Home</span>
</a>
<a href="{{ $postsPath | relURL }}" class="mp-nav-item {{ if eq .Section "posts" }}active{{ end }}">
  <i class="mp-nav-icon ph-bold ph-newspaper" aria-hidden="true"></i>
  <span>Briefing</span>
</a>
<a href="{{ $tagsPath | relURL }}" class="mp-nav-item {{ if eq .Section "tags" }}active{{ end }}">
  <i class="mp-nav-icon ph-bold ph-tag" aria-hidden="true"></i>
  <span>Tags</span>
</a>
<a href="#" data-scroll-top="true" class="mp-nav-item mp-nav-item--top">
  <i class="mp-nav-icon ph-bold ph-arrow-up" aria-hidden="true"></i>
  <span>Top</span>
</a>
```

**`aria-hidden="true"` 이유:** 링크 텍스트(`<span>`)가 이미 의미를 전달하므로 아이콘을 스크린리더에서 숨김

### NAV-01 + NAV-02: layout-overrides.css 헤더 오버라이드

```css
/* Source: 코드베이스 조사 + Phase 1 glass 변수 시스템 */
/* 추가 위치: assets/css/custom/layout-overrides.css 상단 또는 Mobile Bottom Nav 섹션 이전 */

/* === NAV-01: Frosted Glass Sticky Header === */
#menu-blur {
  /* Tailwind의 bg-neutral/25, backdrop-blur-2xl 오버라이드 */
  background: rgba(10, 10, 26, 0.78) !important;
  -webkit-backdrop-filter: var(--mp-glass-blur) !important;
  backdrop-filter: var(--mp-glass-blur) !important;
  border-bottom: 1px solid rgba(124, 58, 237, 0.12);
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.5);
  /* opacity는 건드리지 않음 — background-blur.js가 scroll에 따라 제어 */
}

/* === NAV-02: Light Mode Navigation Contrast === */
:root:not(.dark) #menu-blur {
  background: rgba(255, 255, 255, 0.88) !important;
  border-bottom-color: rgba(124, 58, 237, 0.08);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.06);
}

/* NAV-02: 다크 모드 링크 색상 명확화 */
.dark .main-menu a,
.dark .main-menu span {
  color: rgba(var(--color-neutral-100), 1);
}
.dark .main-menu a:hover {
  color: rgba(var(--color-primary-400), 1); /* cyberpunk: 124 58 237 */
}

/* NAV-02: 라이트 모드 링크 명시 (흰 배경 위 어두운 텍스트) */
:root:not(.dark) .main-menu a,
:root:not(.dark) .main-menu span {
  color: rgba(var(--color-neutral-900), 1); /* cyberpunk: 10 10 26 */
}
:root:not(.dark) .main-menu a:hover {
  color: rgba(var(--color-primary-400), 1); /* violet-600 */
}
```

### NAV-03: 모바일 바텀 네비 아이콘 사이즈 (CSS)

```css
/* Source: 코드베이스 조사 — layout-overrides.css 149-151행 현재 상태 */
/* .mp-nav-icon은 현재 font-size: 1.2rem 적용 중 */
/* Phosphor 아이콘은 font-size와 color를 상속받으므로 추가 변경 불필요 */
/* 단, font-family를 절대 지정하지 말 것 */

/* 현재 규칙 유지 (변경 불필요): */
.mp-nav-icon {
  font-size: 1.2rem;
}
/* Phosphor <i> 태그가 이 font-size 상속 → 기존 레이아웃 유지 */
```

---

## State of the Art

| 구 접근 | 현재 접근 | 변경 이유 | 영향 |
|---------|-----------|-----------|------|
| 이모지 아이콘 (🏠📰🏷️⬆️) | Phosphor Icon CSS 클래스 | OS별 이모지 렌더링 불일치, 크기 조절 어려움 | 일관된 벡터 아이콘, 색상 상속 |
| Tailwind `bg-neutral/25` 헤더 | `--mp-glass-bg` 변수 기반 frosted glass | 디자인 시스템 일관성, 글래스모피즘 완성 | Phase 1 토큰 시스템 활용 |
| 이모지의 `line-height` 맞추기 어려움 | `<i>` 아이콘 요소의 `font-size` 통일 | 레이아웃 정밀도 | 아이콘-텍스트 정렬 개선 |

**Deprecated/outdated:**
- 이모지 아이콘 (`🏠`, `📰`, `🏷️`, `⬆️`): ICON-02 완료 후 교체됨
- `background: none; backdrop-blur-2xl` Tailwind 조합: NAV-01 완료 후 커스텀 CSS로 교체됨

---

## Open Questions

1. **footer.html SVG 막대 그래프(시각 장식) 처리**
   - What we know: `footer.html` 47-57행의 `<svg>` 7개 rect는 음파 모양의 장식용 비주얼. 데이터가 아니라 순수 장식.
   - What's unclear: ICON-02 요건("기존 인라인 SVG 아이콘을 Phosphor로 교체")에서 장식용 SVG도 포함인지 아니면 기능 아이콘(이모지)만인지
   - Recommendation: 장식 SVG는 교체하지 말 것. 이 SVG는 아이콘이 아니라 브랜드 시각 요소. Phosphor에 동일한 장식 SVG 패턴이 없고, 교체해도 시각적 개선 없음.

2. **헤더 높이와 `min-h-[148px]` spacer**
   - What we know: Blowfish `fixed.html`이 `<div class="min-h-[148px]">` spacer를 사용해 헤더 아래 콘텐츠 위치를 잡음. 현재 실제 헤더 높이는 약 64px (`h-12` nav + 패딩).
   - What's unclear: 148px spacer가 실제 헤더보다 훨씬 크다. 서브내비게이션 메뉴가 있을 때의 높이 고려값인 것으로 보임.
   - Recommendation: spacer 높이는 건드리지 말 것. 테마 기본값 유지.

3. **`autoSwitchAppearance = true` + 커스텀 헤더 CSS**
   - What we know: `params.toml`에 `autoSwitchAppearance = true`로 설정됨. Blowfish가 OS 다크모드 설정을 `.dark` 클래스 토글로 반영. Phase 1 선행 결정: `.dark` 클래스 방식만 사용.
   - What's unclear: `autoSwitchAppearance`가 정확히 어떻게 `.dark` 클래스를 제어하는지 (JS 로직)
   - Recommendation: `:root:not(.dark)` + `.dark` 분기는 Phase 1과 동일하게 유지. `autoSwitchAppearance`는 내부 구현 상세이므로 CSS 레이어에서는 클래스 기반으로만 처리.

---

## Sources

### Primary (HIGH confidence)

- `layouts/partials/extend-head-uncached.html` 직접 조사 — CDN 추가 위치 및 Hugo template 구조 확인
- `themes/blowfish/layouts/partials/header/fixed.html` 직접 조사 — `#menu-blur`, `background-blur.js` 메커니즘 확인
- `themes/blowfish/layouts/partials/header/basic.html` 직접 조사 — `.main-menu` 구조, 데스크탑/모바일 분기
- `themes/blowfish/layouts/partials/header/components/desktop-menu.html` 직접 조사 — 메뉴 링크 구조 확인
- `themes/blowfish/layouts/partials/header/components/mobile-menu.html` 직접 조사 — 모바일 메뉴 구조 확인
- `themes/blowfish/assets/js/background-blur.js` 직접 조사 — scroll opacity 제어 메커니즘
- `assets/css/custom/layout-overrides.css` 직접 조사 — 기존 `#mp-mobile-bottom-nav` CSS, 헤더 오버라이드 추가 위치 결정
- `layouts/partials/footer.html` 직접 조사 — 교체 대상 이모지 아이콘 4개, 장식 SVG 위치 확인
- `config/_default/params.toml` 직접 조사 — `header.layout = "fixed"` 설정 확인
- `assets/css/schemes/cyberpunk.css` 직접 조사 — `--color-primary-400`, `--color-neutral-*` 토큰 확인
- `github.com/phosphor-icons/web` README — CDN URL 패턴, weight 클래스명, 아이콘명 형식 (HIGH confidence)
- `jsdelivr.com/package/npm/@phosphor-icons/web` — 최신 버전 2.1.2 확인 (2025-03-31)

### Secondary (MEDIUM confidence)

- Phosphor Icons 공식 사이트 (`phosphoricons.com`) — 아이콘 목록 확인 (웹페이지 콘텐츠 미표시로 상세 확인 불가)
- WebSearch: Phosphor Icons v2 CDN 통합 패턴 — `<i>` 태그 + CSS class 방식, weight별 style.css 분리 방식 확인

### Tertiary (LOW confidence)

- 없음

---

## Metadata

**Confidence breakdown:**
- Phosphor Icons CDN URL 및 사용법: HIGH — 공식 GitHub README에서 직접 확인
- Blowfish 헤더 메커니즘 (`fixed.html`, `background-blur.js`): HIGH — 테마 파일 직접 조사
- 교체 대상 아이콘 목록: HIGH — `layouts/partials/footer.html` 직접 조사
- CSS 오버라이드 전략 (`!important`, `:root:not(.dark)`): HIGH — Phase 1 검증된 패턴 재사용
- Phosphor 구체적 아이콘명 (`ph-house`, `ph-newspaper` 등): MEDIUM — README + WebSearch 확인, 실제 CDN 파일 내부까지 검증 안 됨

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (Phosphor 2.1.2는 안정 릴리스, 30일 유효)
