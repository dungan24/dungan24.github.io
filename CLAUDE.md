# CLAUDE.md — market-pulse-blog

## 프로젝트 개요

Market Pulse 브리핑의 **프론트엔드 블로그**. Hugo + Blowfish 테마 + 사이버펑크 커스텀 CSS.
콘텐츠는 쌍둥이 레포 `../market-pulse`의 파이프라인(Writer → Publisher)이 자동 생성·발행한다.

## 쌍둥이 레포 관계

```
market-pulse (private)              market-pulse-blog (public)
├── ssot/writer/     → 마크다운 생성    ├── content/posts/   ← 마크다운 수신
├── ssot/publisher/  → git push        ├── static/data/     ← chart-data JSON
└── templates/pre-market.md           ├── assets/css/custom.css
                                      ├── layouts/partials/extend-footer.html  ← JS 변환
                                      └── https://dungan24.github.io
```

**데이터 흐름: market-pulse → market-pulse-blog (단방향)**
- Publisher가 `content/posts/pre-market-{date}.md` + `static/data/chart-data-{date}.json` 을 push
- 이 레포에서 코드를 수정하면, Writer/Publisher 쪽도 규약을 맞춰야 함

## 마크다운 → UI 변환 규약

`extend-footer.html`의 JS가 마크다운을 사이버펑크 UI로 변환한다.
**Writer가 아래 마크다운 패턴을 지켜야 UI가 정상 렌더링된다.**

### 뉴스 섹션 (글로벌)

```markdown
1. [**English Headline Here**](https://...)
   Source · 2026-02-12 11:04 KST · 카테고리
   > 한국어 번역/요약 (blockquote 필수)
```

- **영문 헤드라인**: `[**bold**](url)` — 원문 유지
- **메타 라인**: `출처 · 시각 · 카테고리` — `·` (middle dot) 구분자 3개
- **번역 (blockquote `>`)**: JS가 `KR` 태그를 붙여 별도 스타일링
- 번역이 없으면 blockquote 생략 가능 (카드에 excerpt 없이 렌더링)

### 뉴스 섹션 (국내)

```markdown
1. [**한글 제목**](https://...)
   출처 · 2026-02-12 09:20 KST · 카테고리
   > 요약 (선택)
```

### 메타 푸터 (문서 끝)

```html
<div class="mp-briefing-meta">
  <span>생성 시각: 2026-02-12 12:36:48 KST</span>
  <span>브리핑 슬롯: pre-market (개장전)</span>
  <span>데이터 기준 시각: 2026-02-12 12:36:48 KST</span>
</div>
```

**`**생성 시각**:` bold 마크다운 금지** — 반드시 위 HTML div 사용.

### 팩트/의견 영역 구분

```markdown
<!-- FACT_ZONE_START -->
(팩트 내용 — 보라색 좌측 보더)
<!-- FACT_ZONE_END -->

<!-- OPINION_ZONE_START -->
(해석 내용 — 시안 좌측 보더)
<!-- OPINION_ZONE_END -->
```

JS가 HTML 주석을 읽어 `.briefing-section--fact` / `.briefing-section--opinion` 클래스를 할당.

## CSS 체계

- `assets/css/custom.css` — 모든 커스텀 스타일
- CSS 변수: `--mp-glass-bg`, `--mp-glass-border`, `--mp-neon-purple`, `--mp-neon-cyan` 등
- 폰트: Orbitron (제목), Exo 2 (본문), JetBrains Mono (데이터/코드)
- 다크모드 기본, 라이트모드 `:root:not(.dark)` 오버라이드
- 모바일 반응형: 640px, 768px, 1024px 브레이크포인트

## JS 변환 (extend-footer.html)

| 기능 | 설명 |
|------|------|
| briefing-section wrapping | H2별로 `.briefing-section` div 생성 |
| 뉴스 카드 그리드 | `<ol>` → `.mp-news-grid` > `.mp-news-card` 2열 카드 |
| 티커 카드 | 핵심 수치 `<table>` → `.mp-ticker-groups` 카드 |
| Collapsible 섹션 | 용어 설명/출처 등 접기 가능 |
| Regime Hero | `window.__MP_PAGE.regime`으로 색상/배지 동적 생성 |
| TOC ScrollSpy | 스크롤 위치에 따라 TOC 활성 항목 하이라이트 |

## 주의사항

- `content/posts/` 파일은 파이프라인이 덮어쓰므로 **수동 편집 비권장** (다음 실행 시 소실)
- UI/CSS/JS 변경 시 Writer 출력 마크다운 패턴과 호환성 확인 필수
- `hello-world.md`는 `draft: true` — 네비게이션에서 제외됨
