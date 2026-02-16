# UI Renewal Plan (Operation: Neon Overhaul)

Last Updated: 2026-02-16
Branch: `ui/renewal`
Owner: Battlecruiser

## Goal

`PROJECT_MAP.md`의 커스터마이징 내역을 기반으로, "Hip & Cyberpunk" 컨셉을 극대화하고 반응형 완성도를 높인다. 단순한 스타일 변경이 아니라, 사용자 경험(UX)을 고려한 인터랙티브 요소 강화가 핵심이다.

## Phase 1: Typography & Color Polish (기초 공사)

- [ ] **폰트 검증**: `Noto Sans KR` 적용이 누락된 곳(특히 모바일, Safari 등) 전수 조사 및 수정.
- [ ] **네온 팔레트 재정비**: `custom.css`의 `--mp-neon-*` 변수들을 더 선명하고 일관된 Cyberpunk 톤으로 조정.
- [ ] **가독성 튜닝**: 글래스모피즘 배경의 불투명도와 블러 값을 조정하여 본문 가독성 확보.

## Phase 2: Core Components Overhaul (핵심 무기 강화)

- [ ] **Briefing Card (홈)**: 호버 시 네온 글로우 효과 강화, 태그 스타일 개선.
- [ ] **Ticker Card (본문)**: 상승/하락(`num-up`, `num-down`) 색상을 더 강렬하게(형광) 변경하고 스파크라인(미니 차트) 느낌 추가 검토.
- [ ] **News Card (본문)**: "원문" 링크와 "KR" 요약 간의 시각적 위계 명확화.
- [ ] **Chart Card**: 차트 로딩 애니메이션을 사이버펑크 스타일(스피너 대신 데이터 스트림 느낌)로 교체.

## Phase 3: Layout & Spacing (전술적 배치)

- [ ] **모바일 여백 최적화**: `390px` (iPhone) 기준 좌우 패딩과 폰트 사이즈 미세 조정.
- [ ] **헤더/푸터 디테일**: 터미널 푸터의 ASCII 아트나 장식 요소를 더 정교하게 다듬기.
- [ ] **테이블 가독성**: 모바일 가로 스크롤 시 우측 페이드아웃 효과(`mask-image`) 적용.

## Phase 4: Visual FX (특수 효과)

- [ ] **Scanline 개선**: `body::after` 스캔라인 효과를 더 부드럽고 덜 눈 아프게 조정.
- [ ] **Scroll Reveal**: 스크롤 시 섹션이 부드럽게 떠오르는 애니메이션 추가.
- [ ] **Interactive Elements**: 버튼/링크 클릭 시 "디지털 노이즈" 또는 "글리치" 효과 미세 적용.

## Phase 5: Verification (최종 검열)

- [ ] **Playwright 검증**: `tools/ui-viewport.smoke.spec.js` 확장하여 주요 컴포넌트 스냅샷 비교.
- [ ] **라이트 모드 체크**: 다크 모드 개선이 라이트 모드를 망치지 않는지 교차 검증.

## Next Step

1.  Phase 1 (Typography & Colors) 시작.
2.  `assets/css/custom.css` 분석 및 네온 변수 조정.
