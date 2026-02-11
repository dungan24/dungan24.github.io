# Market Pulse 블로그 Cyberpunk 리디자인 — 세부 작업계획서

## Context

현재 Fintech/Bloomberg 스타일(인디고+틸, glass morphism) → **Cyberpunk** 스타일로 전면 교체.
네온 퍼플/시안 글로우, 다크 배경, Orbitron 헤딩, 스캔라인, 글리치 효과 적용.
Hugo + Blowfish 테마 기반. colorScheme 시스템과 custom.css 전체 교체.

## 디자인 시스템

```
Primary:      #7C3AED   (네온 퍼플)
Secondary:    #00F0FF   (사이버 시안)
Accent/CTA:   #F43F5E   (네온 로즈)
Background:   #0A0A1A   (딥 다크)
Surface:      #12122A   (카드 배경)
Border:       #1E1E3A   (다크 보더)
Neon Border:  rgba(124,58,237,0.3)  (퍼플 글로우 보더)
Text:         #E2E8F0   (라이트 슬레이트)
Text Muted:   #64748B   (슬레이트)
상승:         #00FF88   (사이버 그린)
하락:         #FF3366   (네온 핑크)
경고:         #FFD600   (네온 옐로우)

Heading Font: Orbitron (Google Fonts)
Body Font:    Exo 2 (Google Fonts)
Mono Font:    JetBrains Mono (유지)
```

## 상태 추적

```
[진행률] ░░░░░░░░░░ 0/5 Waves
```

- [ ] **Wave 1**: 색상 스킴 + 폰트 교체 (기반)
- [ ] **Wave 2**: Custom CSS 전면 리라이트 (핵심)
- [ ] **Wave 3**: 홈페이지 레이아웃 + SVG + 효과
- [ ] **Wave 4**: 차트 Cyberpunk 테마
- [ ] **Wave 5**: 마무리 + 최종 검증

---

## 대상 파일

**리포**: `C:\Users\sc\.aidocs\market-pulse-blog\`
**브랜치**: `feature/cyberpunk-redesign` (main에서 생성)

| # | 파일 경로 | 현재 줄수 | 변경 범위 | Wave |
|---|----------|---------|----------|------|
| 1 | `assets/css/schemes/cyberpunk.css` | NEW | 새 파일 생성 | 1 |
| 2 | `config/_default/params.toml` | 50 | 1줄 변경 | 1 |
| 3 | `layouts/partials/extend-head-uncached.html` | 109 | 폰트 import 변경 | 1 |
| 4 | `assets/css/custom.css` | 938 | **전면 리라이트** | 2 |
| 5 | `layouts/partials/home/custom.html` | 279 | 부분 수정 | 3 |
| 6 | `assets/img/hero.svg` | 41 | 색상 교체 | 3 |
| 7 | `static/js/render-charts.js` | 370 | 색상 상수 교체 | 4 |
| 8 | `layouts/shortcodes/market-charts.html` | ~70 | 라벨 교체 | 4 |

## 가드레일

**MUST DO:**
- 모든 `backdrop-filter` 사용 시 opaque fallback `background`를 먼저 선언
- `prefers-reduced-motion` 미디어 쿼리 유지 (애니메이션+blur 비활성화)
- 반응형 브레이크포인트 유지 (640px, 768px, 1024px)
- regime 런타임 색상 시스템 (`--regime-color`, `--regime-color-rgb`) 유지
- Wave 완료마다 `hugo server -D` 빌드 확인

**MUST NOT DO:**
- `METRIC_COLORS` (자산별 고유 색상 SPX/NDX/BTC 등) 변경 금지
- regime 런타임 색상(green/amber/red) 변경 금지
- 기능 로직(DOM 변환, 데이터 fetch, 차트 데이터 처리) 수정 금지
- main 브랜치에서 직접 작업 금지
- Light mode 지원 완전 제거 금지 (최소한의 fallback 유지)

---

## Wave 1: 색상 스킴 + 폰트 교체 (기반)

> 목표: Blowfish 테마 변수를 cyberpunk 색상으로 교체하고, 폰트를 Orbitron/Exo 2로 전환

### Task 1.1: feature 브랜치 생성

```bash
cd C:\Users\sc\.aidocs\market-pulse-blog
git checkout -b feature/cyberpunk-redesign
```

### Task 1.2: cyberpunk.css 색상 스킴 생성

**파일**: `assets/css/schemes/cyberpunk.css` (NEW)
**작업**: 새 파일 생성, 아래 내용 그대로 복사

```css
/* Market Pulse — Cyberpunk Neon Theme */
/* neutral: 딥 다크, primary: 네온 퍼플, secondary: 사이버 시안 */
:root {
  --color-neutral: 226, 232, 240;
  --color-neutral-50: 30, 30, 58;
  --color-neutral-100: 226, 232, 240;
  --color-neutral-200: 203, 213, 225;
  --color-neutral-300: 148, 163, 184;
  --color-neutral-400: 100, 116, 139;
  --color-neutral-500: 71, 85, 105;
  --color-neutral-600: 30, 30, 58;
  --color-neutral-700: 18, 18, 42;
  --color-neutral-800: 12, 12, 30;
  --color-neutral-900: 10, 10, 26;

  --color-primary-50: 245, 232, 255;
  --color-primary-100: 233, 213, 255;
  --color-primary-200: 196, 153, 255;
  --color-primary-300: 167, 119, 255;
  --color-primary-400: 124, 58, 237;
  --color-primary-500: 109, 40, 217;
  --color-primary-600: 91, 33, 182;
  --color-primary-700: 76, 29, 149;
  --color-primary-800: 59, 21, 119;
  --color-primary-900: 46, 16, 101;

  --color-secondary-50: 207, 250, 254;
  --color-secondary-100: 165, 243, 252;
  --color-secondary-200: 103, 232, 249;
  --color-secondary-300: 0, 240, 255;
  --color-secondary-400: 0, 220, 235;
  --color-secondary-500: 0, 188, 212;
  --color-secondary-600: 0, 151, 167;
  --color-secondary-700: 0, 121, 134;
  --color-secondary-800: 0, 96, 107;
  --color-secondary-900: 0, 77, 86;
}
```

### Task 1.3: params.toml colorScheme 변경

**파일**: `config/_default/params.toml`
**변경**: 1행

```
변경 전: colorScheme = "fintech"
변경 후: colorScheme = "cyberpunk"
```

### Task 1.4: 폰트 import 변경

**파일**: `assets/css/custom.css` 3행
**변경**: Google Fonts import URL 교체

```
변경 전:
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

변경 후:
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### Task 1.5: body 폰트 교체

**파일**: `assets/css/custom.css` 7~11행
**변경**:

```
변경 전:
body {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
}

변경 후:
body {
  font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  letter-spacing: 0.01em;
}
```

### Task 1.6: extend-head-uncached.html 차트 카드 폰트

**파일**: `layouts/partials/extend-head-uncached.html`
**변경**: `<style>` 블록 내 `font-family: ui-monospace, ...` (40~41행) 부분 → `'JetBrains Mono', monospace`로 교체 (총 2곳)

```
변경 전: font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
변경 후: font-family: 'JetBrains Mono', monospace;
```

### Task 1.7: Wave 1 빌드 검증

```bash
hugo server -D
```

검증 항목:
- [ ] 빌드 에러 없음
- [ ] 페이지 로드 시 Orbitron/Exo 2 폰트 적용 확인
- [ ] 색상 스킴이 퍼플/시안 계열로 변경됨

---

## Wave 2: Custom CSS 전면 리라이트 (핵심)

> 목표: 모든 CSS 변수, 카드, 효과를 cyberpunk 스타일로 교체. 네온 글로우, 스캔라인, 글리치 효과 추가.

### Task 2.1: CSS 루트 변수 교체

**파일**: `assets/css/custom.css` 17~30행
**변경**: `:root` 블록 전체 교체

```css
변경 전:
:root {
  --mp-border: rgb(var(--color-neutral-400) / 0.15);
  --mp-glass-bg: rgb(var(--color-neutral-800) / 0.5);
  --mp-glass-border: rgb(255 255 255 / 0.08);
  --mp-accent-fact: rgb(var(--color-primary-400));
  --mp-accent-opinion: rgb(var(--color-secondary-400));
  --mp-shadow-sm: 0 2px 8px -2px rgb(0 0 0 / 0.2);
  --mp-shadow-md: 0 8px 24px -8px rgb(0 0 0 / 0.3);
  --mp-shadow-lg: 0 16px 48px -12px rgb(0 0 0 / 0.4);
  --mp-radius-sm: 12px;
  --mp-radius-md: 16px;
  --mp-radius-lg: 24px;
}

변경 후:
:root {
  --mp-border: rgba(124, 58, 237, 0.15);
  --mp-glass-bg: rgba(18, 18, 42, 0.85);
  --mp-glass-border: rgba(124, 58, 237, 0.2);
  --mp-accent-fact: #7C3AED;
  --mp-accent-opinion: #00F0FF;
  --mp-shadow-sm: 0 2px 12px -2px rgba(124, 58, 237, 0.15);
  --mp-shadow-md: 0 8px 24px -8px rgba(124, 58, 237, 0.25);
  --mp-shadow-lg: 0 16px 48px -12px rgba(124, 58, 237, 0.35);
  --mp-shadow-neon: 0 0 15px rgba(124, 58, 237, 0.3), 0 0 30px rgba(124, 58, 237, 0.1);
  --mp-radius-sm: 4px;
  --mp-radius-md: 8px;
  --mp-radius-lg: 12px;
  --mp-neon-purple: #7C3AED;
  --mp-neon-cyan: #00F0FF;
  --mp-neon-rose: #F43F5E;
  --mp-neon-green: #00FF88;
  --mp-neon-pink: #FF3366;
  --mp-neon-yellow: #FFD600;
}
```

### Task 2.2: 제목(h1) 사이버펑크 스타일

**파일**: `assets/css/custom.css` 33~49행
**변경**: `.prose h1` + `@keyframes` 교체

```css
변경 후:
.prose h1 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: #7C3AED;
  text-shadow: 0 0 10px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.2);
  display: inline-block;
  position: relative;
}

/* 글리치 효과 */
@keyframes glitch {
  0%, 100% { text-shadow: 0 0 10px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.2); transform: translate(0); }
  20% { text-shadow: 0 0 10px rgba(0, 240, 255, 0.5), -2px 0 #00F0FF; transform: translate(-1px, 1px); }
  40% { text-shadow: 0 0 10px rgba(244, 63, 94, 0.5), 2px 0 #F43F5E; transform: translate(1px, -1px); }
  60% { text-shadow: 0 0 10px rgba(0, 240, 255, 0.5), -1px 0 #00F0FF; transform: translate(-1px, 0); }
  80% { text-shadow: 0 0 10px rgba(124, 58, 237, 0.5), 1px 0 #7C3AED; transform: translate(1px, 1px); }
}
```

> 주의: `gradient-shift` keyframes는 삭제. `-webkit-background-clip`, `-webkit-text-fill-color` 관련 속성도 삭제.

### Task 2.3: 서브타이틀 사이버펑크

**파일**: `assets/css/custom.css` 51~60행
**변경**:

```css
변경 후:
.prose h2.hero-subtitle {
  font-family: 'Exo 2', sans-serif;
  font-weight: 400;
  color: #00F0FF;
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
```

### Task 2.4: briefing-section 카드 사이버펑크

**파일**: `assets/css/custom.css` 63~95행
**변경**: 카드를 네온 보더 + 다크 서피스로 교체

```css
변경 후:
.briefing-section {
  position: relative;
  background: rgba(18, 18, 42, 0.95);
  background: var(--mp-glass-bg);
  border: 1px solid var(--mp-glass-border);
  border-radius: var(--mp-radius-md);
  box-shadow: var(--mp-shadow-sm);
  padding: 1.75rem;
  margin: 2.5rem 0;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.briefing-section:hover {
  border-color: rgba(124, 58, 237, 0.5);
  box-shadow: var(--mp-shadow-neon);
}

.briefing-section::before {
  content: attr(data-label);
  position: absolute;
  top: -10px;
  left: 12px;
  background: #0A0A1A;
  padding: 2px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--mp-neon-cyan);
  letter-spacing: 0.1em;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 2px;
  text-transform: uppercase;
  z-index: 10;
}

.briefing-section--fact {
  border-left: 3px solid var(--mp-neon-purple);
}
.briefing-section--fact::before {
  color: var(--mp-neon-purple);
  border-color: rgba(124, 58, 237, 0.3);
  content: "// FACTS :: MARKET DATA";
}

.briefing-section--opinion {
  border-left: 3px solid var(--mp-neon-cyan);
}
.briefing-section--opinion::before {
  color: var(--mp-neon-cyan);
  border-color: rgba(0, 240, 255, 0.3);
  content: "// ANALYSIS :: OPINION";
}

.briefing-section h2 {
  font-family: 'Orbitron', sans-serif;
  margin-top: 0 !important;
  margin-bottom: 1.5rem !important;
  font-size: 1.15rem !important;
  border-bottom: 1px solid var(--mp-border);
  padding-bottom: 0.5rem;
  color: #E2E8F0;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
```

### Task 2.5: 상승/하락 색상 교체

**파일**: `assets/css/custom.css` 122~141행

```css
변경 후:
.num-up {
  color: var(--mp-neon-green) !important;
  font-weight: 600 !important;
  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
}

.num-down {
  color: var(--mp-neon-pink) !important;
  font-weight: 600 !important;
  text-shadow: 0 0 6px rgba(255, 51, 102, 0.3);
}

.stat-highlight {
  background: rgba(124, 58, 237, 0.15);
  color: var(--mp-neon-purple) !important;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: 600;
  border: 1px solid rgba(124, 58, 237, 0.3);
}
```

### Task 2.6: Light Mode 간소화

**파일**: `assets/css/custom.css` - 모든 `:root:not(.dark)` 블록
**변경**: Light mode는 최소한으로 유지 (사이버펑크는 기본 dark)

```css
/* Light Mode — Minimal Cyberpunk (밝은 배경에서도 네온 유지) */
:root:not(.dark) .briefing-section {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
}
:root:not(.dark) .briefing-section::before {
  background: white;
}
:root:not(.dark) .briefing-section h2 {
  color: #1E1E3A;
}
:root:not(.dark) .num-up { color: #059669 !important; text-shadow: none; }
:root:not(.dark) .num-down { color: #DC2626 !important; text-shadow: none; }
```

### Task 2.7: 테이블 사이버펑크

**파일**: `assets/css/custom.css` 162~206행

```css
변경 후:
.prose table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0;
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
  background: rgba(18, 18, 42, 0.6);
}

.prose thead th {
  background: rgba(124, 58, 237, 0.15);
  color: var(--mp-neon-cyan);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
}

.prose tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(124, 58, 237, 0.08);
  color: #CBD5E1;
}

.prose tbody tr:last-child td { border-bottom: none; }
.prose tbody tr:hover td {
  background: rgba(124, 58, 237, 0.08);
}

.prose thead th:not(:first-child),
.prose td:not(:first-child) {
  text-align: right !important;
}
```

### Task 2.8: regime 기본 색상 변경

**파일**: `assets/css/custom.css` 234~237행

```
변경 전:
  --regime-color: #818cf8;
  --regime-color-rgb: 129 140 248;

변경 후:
  --regime-color: #7C3AED;
  --regime-color-rgb: 124 58 237;
```

### Task 2.9: 네온 글로우 애니메이션 교체

**파일**: `assets/css/custom.css` 240~243행

```css
변경 후:
@keyframes pulse-glow {
  0%, 100% { text-shadow: 0 0 8px rgba(var(--regime-color-rgb) / 0.3); }
  50% { text-shadow: 0 0 20px rgba(var(--regime-color-rgb) / 0.5), 0 0 40px rgba(var(--regime-color-rgb) / 0.15); }
}
```

### Task 2.10: mp-heartbeat 사이버펑크

**파일**: `assets/css/custom.css` 246~252행

```css
변경 후:
.mp-heartbeat {
  font-family: 'Orbitron', sans-serif;
  color: var(--regime-color);
  animation: pulse-glow 3s ease-in-out infinite, glitch 8s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

### Task 2.11: Regime badge 사이버펑크

**파일**: `assets/css/custom.css` 264~278행

```css
변경 후:
.mp-regime-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--regime-color);
  color: var(--regime-color);
  background: rgba(var(--regime-color-rgb) / 0.1);
  box-shadow: 0 0 10px rgba(var(--regime-color-rgb) / 0.2), inset 0 0 10px rgba(var(--regime-color-rgb) / 0.05);
}
```

### Task 2.12: Ticker Group 사이버펑크

**파일**: `assets/css/custom.css` 294~374행

```css
변경 후:
.mp-ticker-groups {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.mp-ticker-group {
  background: rgba(18, 18, 42, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: var(--mp-radius-md);
  padding: 1rem;
  box-shadow: var(--mp-shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.mp-ticker-group:hover {
  transform: translateY(-1px);
  border-color: rgba(124, 58, 237, 0.4);
  box-shadow: var(--mp-shadow-neon);
}

.mp-ticker-group__title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--mp-neon-cyan);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
}

.mp-ticker-row {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  gap: 0.5rem;
  border-radius: 2px;
  transition: background 0.2s ease;
}

.mp-ticker-row:hover {
  background: rgba(124, 58, 237, 0.08);
}

.mp-ticker-row:not(:last-child) {
  border-bottom: 1px solid rgba(124, 58, 237, 0.06);
}

.mp-ticker-name {
  flex: 1;
  color: #E2E8F0;
  font-weight: 500;
}

.mp-ticker-price {
  font-family: 'JetBrains Mono', monospace;
  color: #94A3B8;
  font-size: 0.8rem;
}

.mp-ticker-change {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 60px;
  text-align: right;
}

.mp-sparkline {
  width: 60px;
  height: 20px;
  flex-shrink: 0;
}
```

### Task 2.13: Section Header 사이버펑크

**파일**: `assets/css/custom.css` 376~397행

```css
변경 후:
.mp-section-header {
  position: relative;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--mp-neon-cyan);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 3rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
}

.mp-section-header::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 40px;
  height: 2px;
  background: var(--mp-neon-cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
```

### Task 2.14: Briefing Cards 사이버펑크

**파일**: `assets/css/custom.css` 399~470행

```css
변경 후:
.mp-briefing-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.mp-briefing-card {
  display: block;
  background: rgba(18, 18, 42, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-left: 3px solid #64748B;
  border-radius: var(--mp-radius-md);
  padding: 1.25rem;
  box-shadow: var(--mp-shadow-sm);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.mp-briefing-card:hover {
  transform: translateY(-3px);
  border-color: rgba(124, 58, 237, 0.4);
  box-shadow: var(--mp-shadow-neon);
}

.mp-briefing-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.mp-briefing-card__title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: #E2E8F0;
  flex: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.mp-briefing-card__header time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #64748B;
}

.mp-briefing-card__summary {
  color: #94A3B8;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

.mp-briefing-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.mp-briefing-card__tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--mp-neon-cyan);
  background: rgba(0, 240, 255, 0.08);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  letter-spacing: 0.03em;
}
```

### Task 2.15: Post Hero 사이버펑크

**파일**: `assets/css/custom.css` 508~544행

```css
변경 후:
.mp-post-hero {
  position: relative;
  border-left: 4px solid var(--regime-color, #7C3AED);
  border-radius: 0 var(--mp-radius-md) var(--mp-radius-md) 0;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0 2rem;
  background: rgba(18, 18, 42, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-left: 4px solid var(--regime-color, #7C3AED);
  box-shadow: var(--mp-shadow-sm);
}

.mp-post-hero__top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.mp-post-hero__summary {
  color: #CBD5E1;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

:root:not(.dark) .mp-post-hero {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(124, 58, 237, 0.15);
}
:root:not(.dark) .mp-post-hero__summary { color: #475569; }
```

### Task 2.16: FACT/OPINION 카드 배경 교체

**파일**: `assets/css/custom.css` 588~616행

```css
변경 후:
.briefing-section--fact {
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.05), transparent 40%),
    var(--mp-glass-bg);
}
.briefing-section--fact::before {
  content: "// FACTS :: MARKET DATA";
}

.briefing-section--opinion {
  background:
    linear-gradient(135deg, rgba(0, 240, 255, 0.05), transparent 40%),
    var(--mp-glass-bg);
}
.briefing-section--opinion::before {
  content: "// ANALYSIS :: OPINION";
}

:root:not(.dark) .briefing-section--fact {
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.04), transparent 40%),
    rgba(255, 255, 255, 0.9);
}
:root:not(.dark) .briefing-section--opinion {
  background:
    linear-gradient(135deg, rgba(0, 240, 255, 0.04), transparent 40%),
    rgba(255, 255, 255, 0.9);
}
```

### Task 2.17: News Cards 사이버펑크

**파일**: `assets/css/custom.css` 618~693행

```css
변경 후:
.mp-news-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.mp-news-card {
  background: rgba(18, 18, 42, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: var(--mp-radius-md);
  padding: 1rem 1.25rem;
  box-shadow: var(--mp-shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.mp-news-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
}

.mp-news-card__source {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mp-neon-purple);
  background: rgba(124, 58, 237, 0.1);
  padding: 0.1rem 0.5rem;
  border-radius: 2px;
  margin-bottom: 0.5rem;
}

.mp-news-card__headline {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.4rem;
  color: #E2E8F0;
}

.mp-news-card__headline a { color: inherit; text-decoration: none; }
.mp-news-card__headline a:hover {
  color: var(--mp-neon-cyan);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.mp-news-card__meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #64748B;
}

.mp-news-card__excerpt {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid rgba(124, 58, 237, 0.3);
  font-size: 0.8rem;
  color: #94A3B8;
  line-height: 1.5;
}

:root:not(.dark) .mp-news-card { background: rgba(255, 255, 255, 0.9); }
:root:not(.dark) .mp-news-card__headline { color: #1E1E3A; }
:root:not(.dark) .mp-news-card__meta { color: #64748B; }
:root:not(.dark) .mp-news-card__excerpt { color: #64748B; }
```

### Task 2.18: More Link 사이버펑크

**파일**: `assets/css/custom.css` 744~757행

```css
변경 후:
.mp-more-link {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--mp-neon-cyan);
  text-decoration: none;
  display: inline-block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: transform 0.25s ease, color 0.25s ease, text-shadow 0.25s ease;
}

.mp-more-link:hover {
  color: var(--mp-neon-purple);
  transform: translateX(4px);
  text-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
}
```

### Task 2.19: 스크롤바 사이버펑크

**파일**: `assets/css/custom.css` 225~229행

```css
변경 후:
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0A0A1A; }
::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.4); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.7); }
```

### Task 2.20: 스캔라인 오버레이 추가 (NEW)

**파일**: `assets/css/custom.css` — 파일 상단에 새 블록 추가

```css
/* --- Cyberpunk Scanline Overlay --- */
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.03) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.4;
}

:root:not(.dark) body::after {
  opacity: 0;
}
```

### Task 2.21: Ambient Orbs 사이버펑크 교체

**파일**: `assets/css/custom.css` 733~742행

```css
변경 후:
.mp-ambient-orbs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

:root:not(.dark) .mp-ambient-orbs {
  display: none;
}
```

### Task 2.22: 애니메이션 교체

**파일**: `assets/css/custom.css` 812~868행

```css
변경 후:
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1) translate(-50%, -50%); }
  50% { opacity: 0.5; transform: scale(1.15) translate(-50%, -50%); }
}
@keyframes pulse-slower {
  0%, 100% { opacity: 0.2; transform: scale(1) translate(0, 50%); }
  50% { opacity: 0.4; transform: scale(1.2) translate(0, 50%); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 네온 보더 펄스 */
@keyframes neon-border-pulse {
  0%, 100% { border-color: rgba(124, 58, 237, 0.2); }
  50% { border-color: rgba(124, 58, 237, 0.5); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.animate-pulse-slower {
  animation: pulse-slower 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.briefing-section,
.mp-ticker-group {
  animation: fade-in-up 0.6s ease both;
}

/* stagger delays 유지 */
.mp-ticker-group:nth-child(1), .briefing-section:nth-child(1) { animation-delay: 0.08s; }
.mp-ticker-group:nth-child(2), .briefing-section:nth-child(2) { animation-delay: 0.16s; }
.mp-ticker-group:nth-child(3), .briefing-section:nth-child(3) { animation-delay: 0.24s; }
.mp-ticker-group:nth-child(4), .briefing-section:nth-child(4) { animation-delay: 0.32s; }
.mp-ticker-group:nth-child(5), .briefing-section:nth-child(5) { animation-delay: 0.4s; }

html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
  .briefing-section, .mp-ticker-group, .mp-briefing-card, .mp-news-card, .mp-post-hero {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  body::after { display: none; } /* 스캔라인도 끄기 */
}
```

### Task 2.23: TOC 스타일 사이버펑크

**파일**: `assets/css/custom.css` 886~921행

```css
변경 후:
.toc-custom a {
  display: block;
  padding: 0.25rem 0;
  color: #64748B;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  padding-left: 0.75rem;
}
.dark .toc-custom a { color: #64748B; }
.toc-custom a:hover {
  color: var(--mp-neon-purple);
  border-left-color: rgba(124, 58, 237, 0.3);
}
.dark .toc-custom a:hover {
  color: var(--mp-neon-purple);
  border-left-color: rgba(124, 58, 237, 0.3);
}
.toc-custom a.active {
  color: var(--mp-neon-cyan);
  font-weight: 600;
  border-left-color: var(--mp-neon-cyan);
}
.dark .toc-custom a.active {
  color: var(--mp-neon-cyan);
  border-left-color: var(--mp-neon-cyan);
}
.toc-custom ul { list-style: none; margin: 0; padding: 0; }
.toc-custom li ul { padding-left: 1rem; }
```

### Task 2.24: TOC ScrollSpy 색상 교체

**파일**: `assets/css/custom.css` 793~798행

```css
변경 후:
.toc a.is-active {
  color: var(--regime-color, var(--mp-neon-cyan)) !important;
  font-weight: 600;
  border-left: 2px solid var(--regime-color, var(--mp-neon-cyan));
  padding-left: 0.5rem;
}
```

### Task 2.25: Light mode ticker/card 오버라이드 교체

**파일**: `assets/css/custom.css` 484~503행 전체 교체

```css
변경 후:
:root:not(.dark) .mp-hero-summary { color: #475569; }
:root:not(.dark) .mp-ticker-name { color: #1E1E3A; }
:root:not(.dark) .mp-ticker-price { color: #475569; }
:root:not(.dark) .mp-ticker-group {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(124, 58, 237, 0.1);
  box-shadow: 0 4px 16px -4px rgba(124, 58, 237, 0.08);
}
:root:not(.dark) .mp-briefing-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(124, 58, 237, 0.1);
  box-shadow: 0 4px 16px -4px rgba(124, 58, 237, 0.08);
}
:root:not(.dark) .mp-briefing-card__title { color: #1E1E3A; }
:root:not(.dark) .mp-briefing-card__summary { color: #475569; }
```

### Task 2.26: Wave 2 빌드 검증

```bash
hugo server -D
```

검증 항목:
- [ ] 전체 페이지 다크 배경 + 네온 퍼플/시안 색상
- [ ] 카드 hover 시 네온 글로우
- [ ] Orbitron 헤딩, Exo 2 본문, JetBrains Mono 코드
- [ ] 스캔라인 오버레이 보이는지
- [ ] 상승 녹색(#00FF88), 하락 핑크(#FF3366) 맞는지
- [ ] 반응형 (640px, 768px) 정상 작동

---

## Wave 3: 홈페이지 레이아웃 + SVG + 효과

> 목표: 홈페이지의 ambient orbs, ECG 라인, hero SVG를 cyberpunk 테마로 교체

### Task 3.1: Ambient Orbs 사이버펑크 교체

**파일**: `layouts/partials/home/custom.html` 3~6행

```html
변경 전:
<div class="mp-ambient-orbs">
  <div style="position:absolute;top:-10%;left:-5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgb(99 102 241 / 0.15),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slow"></div>
  <div style="position:absolute;top:40%;right:-10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgb(45 212 191 / 0.1),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slower"></div>
</div>

변경 후:
<div class="mp-ambient-orbs">
  <div style="position:absolute;top:-10%;left:-5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.2),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slow"></div>
  <div style="position:absolute;top:40%;right:-10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,240,255,0.12),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slower"></div>
</div>
```

### Task 3.2: ECG SVG 색상

**파일**: `layouts/partials/home/custom.html` 18행

```
변경 전: stroke="#818cf8" stroke-width="1"
변경 후: stroke="#00F0FF" stroke-width="1.5"
```

### Task 3.3: 서브타이틀 텍스트

**파일**: `layouts/partials/home/custom.html` 24행

```html
변경 전:
<p style="font-family:'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;font-size:0.78rem;color:rgb(var(--color-neutral-500));letter-spacing:0.06em;margin:0.5rem 0 1.5rem">
  Fact-Driven Market Intelligence
</p>

변경 후:
<p style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:#00F0FF;letter-spacing:0.15em;margin:0.5rem 0 1.5rem;text-transform:uppercase;text-shadow:0 0 8px rgba(0,240,255,0.3)">
  // FACT-DRIVEN MARKET INTELLIGENCE
</p>
```

### Task 3.4: Hero SVG 사이버펑크

**파일**: `assets/img/hero.svg` 전체 교체

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" fill="none">
  <!-- Cyberpunk grid -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(124,58,237,0.08)" stroke-width="1"/>
    </pattern>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#00F0FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="300" fill="url(#grid)"/>

  <!-- Price line (gradient purple to cyan) -->
  <polyline points="40,220 100,200 160,210 220,180 280,190 340,150 400,160 460,120 520,130 560,100 620,110 680,80 740,60"
    stroke="url(#lineGrad)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Area fill -->
  <polyline points="40,220 100,200 160,210 220,180 280,190 340,150 400,160 460,120 520,130 560,100 620,110 680,80 740,60 740,280 40,280"
    fill="url(#areaGrad)" opacity="0.3"/>

  <!-- Volatility line -->
  <polyline points="40,180 100,190 160,170 220,200 280,175 340,195 400,170 460,185 520,165 560,190 620,170 680,185 740,175"
    stroke="#FFD600" stroke-width="1.5" fill="none" opacity="0.3" stroke-dasharray="6,4"/>

  <!-- Candlestick hints (neon) -->
  <g opacity="0.6">
    <line x1="160" y1="200" x2="160" y2="220" stroke="#FF3366" stroke-width="3" stroke-linecap="round"/>
    <line x1="280" y1="180" x2="280" y2="200" stroke="#00FF88" stroke-width="3" stroke-linecap="round"/>
    <line x1="400" y1="150" x2="400" y2="170" stroke="#00FF88" stroke-width="3" stroke-linecap="round"/>
    <line x1="520" y1="120" x2="520" y2="140" stroke="#FF3366" stroke-width="3" stroke-linecap="round"/>
    <line x1="680" y1="70" x2="680" y2="90" stroke="#00FF88" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Data point glow (neon purple) -->
  <circle cx="740" cy="60" r="4" fill="#7C3AED"/>
  <circle cx="740" cy="60" r="8" fill="#7C3AED" opacity="0.3"/>
  <circle cx="740" cy="60" r="14" fill="#7C3AED" opacity="0.08"/>
  <circle cx="740" cy="60" r="22" fill="#00F0FF" opacity="0.04"/>
</svg>
```

### Task 3.5: JS Regime Colors (homepage)

**파일**: `layouts/partials/home/custom.html` 90~95행

```javascript
변경 전:
var REGIME_COLORS = {
  'RISK_ON':  { hex: '#4ade80', rgb: '74 222 128' },
  'CAUTIOUS': { hex: '#fbbf24', rgb: '251 191 36' },
  'RISK_OFF': { hex: '#f87171', rgb: '248 113 113' },
  'PANIC':    { hex: '#ef4444', rgb: '239 68 68' }
};

변경 후:
var REGIME_COLORS = {
  'RISK_ON':  { hex: '#00FF88', rgb: '0 255 136' },
  'CAUTIOUS': { hex: '#FFD600', rgb: '255 214 0' },
  'RISK_OFF': { hex: '#FF3366', rgb: '255 51 102' },
  'PANIC':    { hex: '#FF0040', rgb: '255 0 64' }
};
```

### Task 3.6: JS Sparkline 색상 (homepage)

**파일**: `layouts/partials/home/custom.html` 178~181행

```javascript
변경 전:
var changeColor = changePct === 0 ? 'rgb(var(--color-neutral-400))'
  : isPositive ? '#4ade80' : '#f87171';
var sparkColor = changePct === 0 ? '#6b7280' : isPositive ? '#4ade80' : '#f87171';

변경 후:
var changeColor = changePct === 0 ? 'rgb(var(--color-neutral-400))'
  : isPositive ? '#00FF88' : '#FF3366';
var sparkColor = changePct === 0 ? '#64748B' : isPositive ? '#00FF88' : '#FF3366';
```

### Task 3.7: Wave 3 빌드 검증

```bash
hugo server -D
```

검증 항목:
- [ ] 홈페이지 ambient orbs = 퍼플 + 시안 글로우
- [ ] ECG 라인 = 시안(#00F0FF)
- [ ] Hero SVG = 퍼플→시안 그라데이션 라인
- [ ] Regime badge = 새 색상 (녹색/노랑/핑크/빨강)
- [ ] Sparkline 색상 = 녹색/핑크

---

## Wave 4: 차트 Cyberpunk 테마

> 목표: ECharts 차트의 색상, 툴팁, 축 스타일을 cyberpunk으로 교체

### Task 4.1: COLORS 객체 교체

**파일**: `static/js/render-charts.js` 8~16행

```javascript
변경 전:
const COLORS = {
  primary: '#818cf8',
  success: '#4ade80',
  danger: '#f87171',
  warning: '#fbbf24',
  muted: '#94a3b8',
  bg: '#080c20',
  text: '#e2e8f0',
};

변경 후:
const COLORS = {
  primary: '#7C3AED',
  success: '#00FF88',
  danger: '#FF3366',
  warning: '#FFD600',
  muted: '#64748B',
  bg: '#0A0A1A',
  text: '#E2E8F0',
};
```

> 주의: `METRIC_COLORS` (18~28행)는 변경하지 않음! 자산별 고유 색상은 유지.

### Task 4.2: GLASS_TOOLTIP 교체

**파일**: `static/js/render-charts.js` 30~37행

```javascript
변경 전:
const GLASS_TOOLTIP = {
  backgroundColor: 'rgba(15, 23, 43, 0.9)',
  borderColor: 'rgba(129, 140, 248, 0.2)',
  borderWidth: 1,
  borderRadius: 12,
  textStyle: { color: '#e2e8f0', fontSize: 13 },
  extraCssText: 'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 8px 32px -8px rgba(0,0,0,0.5)',
};

변경 후:
const GLASS_TOOLTIP = {
  backgroundColor: 'rgba(10, 10, 26, 0.95)',
  borderColor: 'rgba(124, 58, 237, 0.3)',
  borderWidth: 1,
  borderRadius: 4,
  textStyle: { color: '#E2E8F0', fontSize: 13 },
  extraCssText: 'box-shadow:0 0 15px rgba(124,58,237,0.2),0 8px 32px -8px rgba(0,0,0,0.5)',
};
```

### Task 4.3: getTheme() 교체

**파일**: `static/js/render-charts.js` 45~55행

```javascript
변경 전:
function getTheme() {
  const dark = isDarkMode();
  return {
    bg: dark ? '#0a0f1e' : '#ffffff',
    text: dark ? '#e2e8f0' : '#334155',
    axis: dark ? '#334155' : '#cbd5e1',
    tooltip: dark ? '#1e293b' : '#ffffff',
    success: dark ? '#4ade80' : '#16a34a',
    danger: dark ? '#f87171' : '#dc2626',
  };
}

변경 후:
function getTheme() {
  const dark = isDarkMode();
  return {
    bg: dark ? '#0A0A1A' : '#ffffff',
    text: dark ? '#E2E8F0' : '#1E1E3A',
    axis: dark ? '#1E1E3A' : '#cbd5e1',
    tooltip: dark ? '#12122A' : '#ffffff',
    success: dark ? '#00FF88' : '#059669',
    danger: dark ? '#FF3366' : '#DC2626',
  };
}
```

### Task 4.4: Regime Gauge 색상

**파일**: `static/js/render-charts.js` 198~205행

```javascript
변경 전:
color: [
  [0.2, COLORS.danger],
  [0.4, COLORS.warning],
  [0.7, '#94a3b8'],
  [1, COLORS.success],
],

변경 후:
color: [
  [0.2, '#FF3366'],
  [0.4, '#FFD600'],
  [0.7, '#64748B'],
  [1, '#00FF88'],
],
```

### Task 4.5: extend-head-uncached.html 차트 스타일

**파일**: `layouts/partials/extend-head-uncached.html` 9~14행

```css
변경 전:
:root {
  --mp-chart-card-bg: rgb(var(--color-neutral-900) / 0.55);
  --mp-chart-border: rgb(var(--color-neutral-400) / 0.22);
  --mp-chart-accent: rgb(99, 102, 241);
  --mp-chart-text-muted: rgb(var(--color-neutral-400));
}

변경 후:
:root {
  --mp-chart-card-bg: rgba(18, 18, 42, 0.85);
  --mp-chart-border: rgba(124, 58, 237, 0.2);
  --mp-chart-accent: #7C3AED;
  --mp-chart-text-muted: #64748B;
}
```

### Task 4.6: 차트 카드 보더

**파일**: `layouts/partials/extend-head-uncached.html` 19행

```css
변경 전: border: 1px solid rgb(255 255 255 / 0.08);
변경 후: border: 1px solid rgba(124, 58, 237, 0.2);
```

### Task 4.7: 차트 카드 배경

**파일**: `layouts/partials/extend-head-uncached.html` 22~27행

```css
변경 전:
background: rgb(15 23 43 / 0.85);
background:
  linear-gradient(160deg, rgb(255 255 255 / 0.03), transparent 30%),
  var(--mp-chart-card-bg);
box-shadow: 0 8px 28px -14px rgb(0 0 0 / 0.55);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);

변경 후:
background: rgba(18, 18, 42, 0.95);
background:
  linear-gradient(160deg, rgba(124, 58, 237, 0.03), transparent 30%),
  var(--mp-chart-card-bg);
box-shadow: 0 0 15px rgba(124, 58, 237, 0.1), 0 8px 28px -14px rgba(0, 0, 0, 0.55);
```

> `backdrop-filter` 행을 삭제 (차트 카드에서 불필요)

### Task 4.8: 차트 카드 border-radius

**파일**: `layouts/partials/extend-head-uncached.html` 20행

```css
변경 전: border-radius: 16px;
변경 후: border-radius: 8px;
```

### Task 4.9: 차트 라벨 배지

**파일**: `layouts/partials/extend-head-uncached.html` 38행

```css
변경 전: border-bottom-right-radius: 12px;
변경 후: border-bottom-right-radius: 4px;
```

### Task 4.10: Wave 4 빌드 검증

```bash
hugo server -D
```

검증 항목:
- [ ] 5종 차트 정상 렌더링
- [ ] 차트 카드 = 다크 배경 + 퍼플 보더
- [ ] 툴팁 = 다크 배경 + 퍼플 보더 + 네온 글로우
- [ ] Gauge = 네온 그린/옐로우/핑크/슬레이트
- [ ] 상승/하락 바 = #00FF88 / #FF3366

---

## Wave 5: 마무리 + 최종 검증

### Task 5.1: Prose body 스타일

**파일**: `assets/css/custom.css` 929~936행 (확인 후)

```css
.prose {
  font-size: 1.125rem;
  line-height: 1.8;
}
.prose p {
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}
```

> 이 부분은 유지 (Exo 2 가독성 좋음)

### Task 5.2: 모바일 반응형 확인/조정

**파일**: `assets/css/custom.css` - 모든 `@media` 블록
**작업**: border-radius, padding 확인

```css
@media (max-width: 640px) {
  .prose { font-size: 0.95rem; }
  .prose table { font-size: 0.75rem; }
  .briefing-section {
    padding: 1.5rem 1rem;
    margin: 2rem -1.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .briefing-section::before { left: 1.5rem; }
  .mp-ticker-groups { grid-template-columns: 1fr; }
  .mp-briefing-cards { grid-template-columns: 1fr; }
  .mp-sparkline { display: none; }
  .mp-ecg-wrap { max-width: 100%; }
}

@media (max-width: 768px) {
  .mp-news-grid { grid-template-columns: 1fr; }
  .mp-chart-dashboard { grid-template-columns: 1fr; }
  .mp-post-hero { margin: 1rem -0.5rem 1.5rem; border-radius: 0; }
}

@media (max-width: 1024px) {
  .mp-ticker-groups { grid-template-columns: repeat(2, 1fr); }
}
```

### Task 5.3: 전체 파일 정리

1. 사용하지 않는 `gradient-shift` keyframes 삭제
2. 중복 `:root` 블록 병합
3. 주석 정리 (`/* ===== Cyberpunk ... =====  */`)

### Task 5.4: 최종 검증 체크리스트

```
빌드:
- [ ] hugo server -D 에러 없음

홈페이지 (다크):
- [ ] 네온 퍼플/시안 ambient orbs
- [ ] Orbitron 제목 + 글리치 효과
- [ ] 시안 ECG 라인
- [ ] Regime badge 네온 글로우
- [ ] Ticker groups 네온 보더 hover
- [ ] Briefing cards 네온 보더 hover
- [ ] 스캔라인 오버레이

홈페이지 (라이트):
- [ ] 스캔라인 비활성화
- [ ] ambient orbs 비활성화
- [ ] 카드 밝은 배경
- [ ] 텍스트 가독성

포스트 페이지:
- [ ] Regime hero banner 네온 보더
- [ ] FACT/OPINION 카드 구분
- [ ] 차트 5종 정상 렌더링
- [ ] 뉴스 카드 네온 hover
- [ ] TOC 시안 active 상태

반응형:
- [ ] 375px: 1열 레이아웃, 가로 스크롤 없음
- [ ] 768px: 2열 그리드
- [ ] 1024px: 3열 ticker groups
- [ ] 1440px: 정상 레이아웃

접근성:
- [ ] prefers-reduced-motion: 모든 애니메이션 + 스캔라인 비활성화
- [ ] 텍스트 대비 4.5:1 이상

기타:
- [ ] 검색 모달 정상
- [ ] 404 페이지 정상
- [ ] 태그 페이지 정상
```

### Task 5.5: 커밋

```bash
git add assets/css/schemes/cyberpunk.css assets/css/custom.css config/_default/params.toml layouts/partials/extend-head-uncached.html layouts/partials/home/custom.html assets/img/hero.svg static/js/render-charts.js
git commit -m "feat: 사이버펑크 테마 전면 리디자인 #cyberpunk-redesign"
```
