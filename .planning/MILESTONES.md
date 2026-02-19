# Milestones

## v1.0 UI/UX Redesign (Shipped: 2026-02-19)

**Phases completed:** 5 phases, 10 plans, 1 tasks

**Key accomplishments:**
- CSS 3티어 토큰 시스템 구축 + 라이브 버그 3종 수정 (중복 :root:not(.dark), 중첩 backdrop-filter, reduced-motion 누락)
- Phosphor Icons v2 CDN 통합 + Frosted glass 스크롤 반응 스티키 헤더 + 모바일 바텀 네비게이션
- Ambient orbs 배경 레이어 + 한국 컨벤션 기반 Regime 글래스 틴팅 (Bull/Bear/Neutral)
- 뉴스 카드 글래스 리디자인 (카테고리 뱃지 10종, 호버 효과, 모바일 1열)
- 캘린더 이벤트 상태 시각화 (지남/진행중/예정) + 차트 ECharts 팔레트 동기화
- backdrop-filter 성능 최적화 — 중첩 위반 4건 제거, 모바일 blur cascade, reduced-motion 가드 14셀렉터

**Stats:** 30 commits, 30 files modified, +4,102/-375 lines, 5,441 CSS LOC
**Tech debt:** 3 hardcoded blur values (chart-cards, terminal-footer, calendar tooltip) — tracked in v1.0-MILESTONE-AUDIT.md

---

