# Market Pulse 블로그 전체 리디자인 — 실행 계획

## Context

Bloomberg Terminal 스타일 → **모던 핀테크 SaaS** 스타일로 전환.
글래스모피즘 + Indigo/Violet 액센트 + 부드러운 그라디언트.
홈페이지, 포스트 페이지, 차트 전부 포함하는 전체 리디자인.

## Metis 검증 결과 반영

- [x] `bloomberg.css` → `fintech.css` 리네임 + `params.toml` 동기화
- [x] Wave 1+2 합침 → 중간 깨짐 방지
- [x] 그라디언트 orb → `.dark` 전용으로 제한 (라이트모드 얼룩 방지)
- [x] `backdrop-filter` fallback: opaque 배경 먼저 선언
- [x] `hero.svg` 색상 확인 Task 추가
- [x] `--mp-card-bg` 불필요 변수 제거 → `--mp-glass-bg`만 사용
- [x] Blowfish 검색/404/태그 페이지 검증 추가
- [x] `prefers-reduced-motion` 시 blur 제거 (모바일 성능)

## 상태 추적

```
[진행률] ░░░░░░░░░░ 0/5 Waves
```

- [ ] **Wave 1**: 컬러 스킴 + 글래스모피즘 카드 (합침)
- [ ] **Wave 2**: 배경 장식 + 타이포그래피
- [ ] **Wave 3**: 마이크로 애니메이션
- [ ] **Wave 4**: 차트 폴리시
- [ ] **Wave 5**: 레이아웃 마무리 + 최종 검증

---

## 대상 리포 및 파일

**리포**: `C:\Users\sc\.aidocs\market-pulse-blog\`
**브랜치**: `feature/fintech-redesign`

| # | 파일 경로 | 현재 줄수 | 변경 범위 | Wave |
|---|----------|---------|----------|------|
| 1 | `assets/css/schemes/bloomberg.css` → **`fintech.css`** | 40 | 리네임+재작성 | 1 |
| 2 | `config/_default/params.toml` | 50 | `colorScheme` 변경 | 1 |
| 3 | `assets/css/custom.css` | 789 | 대폭 수정 | 1-5 |
| 4 | `static/js/render-charts.js` | 358 | 부분 수정 | 1,4 |
| 5 | `layouts/partials/home/custom.html` | 273 | 부분 수정 | 2,5 |
| 6 | `layouts/partials/extend-head-uncached.html` | 107 | 부분 수정 | 1,4 |
| 7 | `layouts/shortcodes/market-charts.html` | 70 | 부분 수정 | 4 |
| 8 | `layouts/partials/home/recent-briefings.html` | 31 | 미세 조정 | 5 |
| 9 | `layouts/partials/extend-footer.html` | 436 | 미세 조정 | 3 |
| 10 | `assets/img/hero.svg` | ? | 색상 확인/교체 | 5 |

## 가드레일 (Metis)

**MUST DO:**
- [ ] `--terminal-*` 삭제와 동시에 **모든 참조** `--mp-*`로 교체 (부분 치환 금지)
- [ ] `backdrop-filter` 사용 시 반드시 opaque fallback `background` 먼저 선언
- [ ] 그라디언트 orb은 `.dark` 전용 (`html:not(.dark)` 에서 `display:none`)
- [ ] `hero.svg`의 cyan 색상 → 인디고로 교체 필요 시 대응
- [ ] Wave 완료마다 `hugo server` 정상 빌드 확인
- [ ] Blowfish 검색 모달 + 404 + 태그 페이지 최소 1회 시각 확인

**MUST NOT DO:**
- [ ] `METRIC_COLORS` (자산별 고유 색상) 변경 금지
- [ ] regime 런타임 색상(green/amber/red) 변경 금지
- [ ] 기능 로직(DOM 변환, zone 감지, 차트 데이터 처리) 수정 금지
- [ ] `!important` 추가 금지

---

## Wave 1: 컬러 스킴 + 글래스모피즘 (합침)

> Metis 권고: Wave 1+2 합침으로 `--terminal-*` → `--mp-*` 치환 후 바로 카드 스타일까지 적용. 중간 깨짐 없음.

### Task 1.1: bloomberg.css → fintech.css 리네임 + 재작성

**파일**: `assets/css/schemes/bloomberg.css` → `assets/css/schemes/fintech.css`
**작업**: 파일 리네임 후 전체 내용 교체

```css
/* Market Pulse — Modern Fintech Theme */
/* neutral: 슬레이트, primary: 인디고, secondary: 틸 */
:root {
  --color-neutral: 255, 255, 255;
  --color-neutral-50: 241, 245, 249;
  --color-neutral-100: 226, 232, 240;
  --color-neutral-200: 148, 163, 184;
  --color-neutral-300: 100, 116, 139;
  --color-neutral-400: 71, 85, 105;
  --color-neutral-500: 51, 65, 85;
  --color-neutral-600: 30, 41, 59;
  --color-neutral-700: 15, 23, 42;
  --color-neutral-800: 15, 23, 43;
  --color-neutral-900: 8, 12, 32;

  --color-primary-50: 238, 242, 255;
  --color-primary-100: 224, 231, 255;
  --color-primary-200: 199, 210, 254;
  --color-primary-300: 165, 180, 252;
  --color-primary-400: 129, 140, 248;
  --color-primary-500: 99, 102, 241;
  --color-primary-600: 79, 70, 229;
  --color-primary-700: 67, 56, 202;
  --color-primary-800: 55, 48, 163;
  --color-primary-900: 49, 46, 129;

  --color-secondary-50: 240, 253, 250;
  --color-secondary-100: 204, 251, 241;
  --color-secondary-200: 153, 246, 228;
  --color-secondary-300: 94, 234, 212;
  --color-secondary-400: 45, 212, 191;
  --color-secondary-500: 20, 184, 166;
  --color-secondary-600: 13, 148, 136;
  --color-secondary-700: 15, 118, 110;
  --color-secondary-800: 17, 94, 89;
  --color-secondary-900: 19, 78, 74;
}
```

### Task 1.2: params.toml colorScheme 변경

**파일**: `config/_default/params.toml`
**변경**: `colorScheme = "bloomberg"` → `colorScheme = "fintech"`

### Task 1.3: custom.css 루트 변수 교체 + 일괄 치환

**파일**: `assets/css/custom.css` 17~23행
**작업**:
1. `:root` 블록 내 변수를 아래로 교체
2. 파일 전체 검색-치환 (4건)

```css
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
```

일괄 치환 (전체 파일):
| 검색 | 치환 |
|------|------|
| `var(--terminal-border)` | `var(--mp-border)` |
| `var(--terminal-bg-card)` | `var(--mp-glass-bg)` |
| `var(--terminal-accent-fact)` | `var(--mp-accent-fact)` |
| `var(--terminal-accent-opinion)` | `var(--mp-accent-opinion)` |

> `--mp-card-bg` 불필요 변수 삭제 (Metis). `--mp-glass-bg`만 사용.

### Task 1.4: regime 기본색 변경

**파일**: `assets/css/custom.css` 208~211행
`--regime-color: #fbbf24` → `#818cf8`, `--regime-color-rgb: 251 191 36` → `129 140 248`

### Task 1.5: render-charts.js COLORS

**파일**: `static/js/render-charts.js` 8~16행
`primary: '#22d3ee'` → `'#818cf8'`, `bg: '#0a0f1e'` → `'#080c20'`

### Task 1.6~1.11: 글래스모피즘 카드 적용

모든 카드에 동일 패턴 적용. **backdrop-filter fallback 필수**: opaque `background`를 먼저 선언하고, `backdrop-filter`는 추가 레이어로.

```css
/* 패턴 예시 (모든 카드 동일) */
.some-card {
  background: rgb(15 23 43 / 0.85);              /* fallback: opaque */
  background: var(--mp-glass-bg);                 /* 지원 시 반투명 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--mp-glass-border);
  border-radius: var(--mp-radius-md);
  box-shadow: var(--mp-shadow-sm);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
```

| Task | 클래스 | 위치 | 비고 |
|------|--------|------|------|
| 1.6 | `.briefing-section` | custom.css 48~56행 | + `padding: 1.75rem`, `margin: 2.5rem 0` |
| 1.7 | `.briefing-section::before` | custom.css 58~74행 | `border-radius: 999px` (pill) + blur(8px) |
| 1.8 | `.mp-ticker-group` | custom.css 273~278행 | + hover: `translateY(-1px)` |
| 1.9 | `.mp-briefing-card` | custom.css 352~367행 | hover: `translateY(-3px)`, `--mp-shadow-lg` |
| 1.10 | `.mp-news-card` | custom.css 548~559행 | hover: border-color 인디고 |
| 1.11 | `.mp-post-hero` | custom.css 436~447행 | fallback default `#818cf8` |

### Task 1.12: .prose table

custom.css 139~150행:
- `border: 1px solid var(--mp-glass-border)`
- `border-radius: var(--mp-radius-sm)` (12px)
- `background: rgb(var(--color-neutral-900) / 0.15)` + `backdrop-filter: blur(8px)`
- thead: `background: rgb(var(--color-neutral-700) / 0.6)`

### Task 1.13: .market-chart-card

extend-head-uncached.html `<style>` 내:
- `border: 1px solid rgb(255 255 255 / 0.08)`
- `border-radius: 16px`
- `backdrop-filter: blur(16px)`
- `::before`: `background: rgb(99 102 241)`, `color: white`, `border-bottom-right-radius: 12px`
- `--mp-chart-accent: rgb(99, 102, 241)` (인디고)

### Task 1.14: 라이트 모드 오버라이드

모든 `:root:not(.dark)` 카드 오버라이드:
```css
:root:not(.dark) .briefing-section {
  background: rgb(255 255 255 / 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(0 0 0 / 0.06);
  box-shadow: 0 4px 16px -4px rgb(0 0 0 / 0.08);
}
/* .mp-ticker-group, .mp-briefing-card 동일 패턴 */
```

### Task 1.15: Wave 1 검증

```
- [ ] hugo server -D 정상 빌드
- [ ] 링크/버튼 인디고 색
- [ ] FACT 섹션 왼쪽 바 인디고, OPINION 틸
- [ ] 모든 카드 16px radius + 글래스 효과
- [ ] 호버 시 부드러운 lift
- [ ] 라이트 모드 반투명 흰색 카드
- [ ] 차트 정상 렌더링
```

---

## Wave 2: 배경 장식 + 타이포그래피

### Task 2.1: 그라디언트 orb (dark only)

**파일**: `layouts/partials/home/custom.html` 2행

wrapper에 `position:relative;overflow:hidden` 추가.
인디고+틸 orb 2개 삽입. **`.dark` 전용** (Metis):

```html
<div class="mp-ambient-orbs">
  <div style="position:absolute;top:-10%;left:-5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgb(99 102 241/0.15),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slow"></div>
  <div style="position:absolute;top:40%;right:-10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgb(45 212 191/0.1),transparent 70%);filter:blur(60px);pointer-events:none" class="animate-pulse-slower"></div>
</div>
```

custom.css에 추가:
```css
.mp-ambient-orbs { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
:root:not(.dark) .mp-ambient-orbs { display: none; }
```

### Task 2.2: Hero 제목 animated gradient

custom.css `.prose h1`:
```css
background: linear-gradient(135deg, rgb(var(--color-primary-300)), rgb(var(--color-primary-500)), rgb(var(--color-secondary-400)));
background-size: 200% 200%;
animation: gradient-shift 8s ease infinite;
```

`@keyframes gradient-shift` 추가.

### Task 2.3: ECG 라인

custom.html: `stroke="#818cf8" stroke-width="1" opacity="0.7"`

### Task 2.4: 서브타이틀

custom.html: mono → `Noto Sans KR`, `FACT-DRIVEN` → `Fact-Driven`

### Task 2.5: 섹션 헤더 인디고 underline

custom.css `.mp-section-header`: mono → body 폰트 + `::after` (40px × 2px 인디고)

### Task 2.6: pulse-glow 부드럽게

custom.css: opacity 줄이기, `3s` 사이클

### Task 2.7: Regime badge

custom.css: mono → body 폰트, `backdrop-filter: blur(8px)`, glow shadow

### Task 2.8: 태그 pill

custom.css `.mp-briefing-card__tag`: `border-radius: 999px`, `border` 추가

### Task 2.9: Wave 2 검증

```
- [ ] orb이 다크모드에서만 보이는가?
- [ ] orb이 overflow 되지 않는가?
- [ ] Hero 제목 animated gradient 작동
- [ ] ECG 인디고 + 가늘게
- [ ] 섹션 헤더에 accent underline
- [ ] 태그 pill 모양
```

---

## Wave 3: 마이크로 애니메이션

### Task 3.1: `@keyframes fade-in-up`

`from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) }`

### Task 3.2: 순차 애니메이션

`.briefing-section`, `.mp-ticker-group`에 `animation: fade-in-up` + `nth-child` delay (80ms 간격)

### Task 3.3: `prefers-reduced-motion` + 성능

```css
html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* Metis 권고: 모바일 성능 보호 — blur 제거 */
  .briefing-section,
  .mp-ticker-group,
  .mp-briefing-card,
  .mp-news-card,
  .mp-post-hero {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
```

### Task 3.4: Collapsible opacity

`.mp-collapsible`: `opacity: 0` → `.is-open`: `opacity: 1`

### Task 3.5: 티커 행 호버

`.mp-ticker-row:hover`: `background: rgb(var(--color-primary-400) / 0.05)`

### Task 3.6: Wave 3 검증

```
- [ ] 페이지 로드 시 순차 fade-in
- [ ] 접기/펼치기 자연스러움
- [ ] reduced-motion 시 애니메이션 + blur 전부 비활성화
- [ ] smooth scroll 작동
```

---

## Wave 4: 차트 폴리시

### Task 4.1: tooltip 글래스

render-charts.js 모든 차트 tooltip:
```javascript
{
  backgroundColor: 'rgba(15, 23, 43, 0.9)',
  borderColor: 'rgba(129, 140, 248, 0.2)',
  borderWidth: 1,
  borderRadius: 12,
  textStyle: { color: '#e2e8f0', fontSize: 13 },
  extraCssText: 'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 8px 32px -8px rgba(0,0,0,0.5)',
}
```

### Task 4.2: 그리드 라인

`splitLine.opacity: 0.3 → 0.15`, `type: 'dashed'` 추가

### Task 4.3: 카드 라벨

market-charts.html:
| 기존 | 새 |
|------|-----|
| `SYSTEM // SYNC` | `Loading` |
| `CHART // INTRA-DAY TREND` | `Trend` |
| `ANALYSIS // CORRELATION` | `Correlation` |
| `MARKET // REGIME SCORE` | `Regime` |
| `SECTOR // RELATIVE STRENGTH` | `Sectors` |
| `PERFORMANCE // 5-DAY CHANGE` | `5-Day` |
| `CONNECTING TO TERMINAL...` | `Loading market data...` |

### Task 4.4: 스피너 + 제목

extend-head-uncached.html: 스피너 `border-top-color` 인디고, `.chart-title-compact` font-weight 600

### Task 4.5: Wave 4 검증

```
- [ ] tooltip 글래스 스타일
- [ ] 그리드 점선 + 희미
- [ ] 라벨 간결
- [ ] 5종 차트 정상 렌더
```

---

## Wave 5: 레이아웃 마무리 + 최종 검증

### Task 5.1: "전체 브리핑 보기" 링크

custom.html: inline style → `.mp-more-link` 클래스 + hover 화살표 애니메이션

### Task 5.2: 카드 time 폰트

custom.css `.mp-briefing-card__header time`: mono → body 폰트

### Task 5.3: hero.svg 색상 확인 (Metis)

`assets/img/hero.svg` 읽어서 `#22d3ee`(cyan) → `#818cf8`(인디고) 교체 필요 시 대응

### Task 5.4: 최종 검증

```
- [ ] 홈페이지 다크모드: orb + 글래스 카드 + 인디고
- [ ] 홈페이지 라이트모드: 깨끗한 흰색
- [ ] 포스트 다크/라이트: regime 배너 + 차트 + FACT/OPINION
- [ ] 모바일 375px: 1열, 가로스크롤 없음
- [ ] 모바일 768px: 2열 그리드
- [ ] 차트 5종 인터랙션 (tooltip, zoom)
- [ ] 접기/펼치기 전체 작동
- [ ] TOC 스크롤스파이
- [ ] prefers-reduced-motion: 애니메이션+blur 비활성화
- [ ] Blowfish 검색 모달 정상 (Metis)
- [ ] 404 페이지 정상 (Metis)
- [ ] 태그 목록 페이지 정상 (Metis)
- [ ] 커밋 & PR
```
