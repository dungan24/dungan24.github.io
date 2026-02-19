# Phase 3: Background & Regime - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

글래스 카드 뒤에 블러할 대상(ambient orbs)을 배경에 추가하고, Bull/Bear/Neutral regime 상태를 글래스 카드 색감에 반영한다. 컴포넌트 리디자인(Phase 4)과 퍼포먼스 최적화(Phase 5)는 별도 페이즈 영역이다.

</domain>

<decisions>
## Implementation Decisions

### Orb 디자인
- 존재감: 은은하지만 눈치채는 수준 — 스크롤 중 "오 배경 예쁜데?" 정도의 인지
- JS 허용 — 위치/색상 동적 제어, 스크롤 반응 등 구현 가능
- 느낌, 개수, 크기, 배치 패턴은 Claude 재량 (프리미엄 인상에 맞게 판단)

### Orb 애니메이션
- 움직임 패턴(떠다니기/호흡/정적), 속도, 강도 모두 Claude 재량
- 스크롤 반응 여부(패럴랙스 등) Claude 재량
- 페이지 로드 시 등장 방식 Claude 재량
- **필수 제약:** `prefers-reduced-motion` 설정 시 orb 애니메이션 정지

### Regime 색상 체계
- **Bull = 빨강 (한국 시장 기준: 상승=적색)**
- **Bear = 파랑 (한국 시장 기준: 하락=청색)**
- **Neutral = 슬레이트**
- 이것은 미국 시장과 반대이며, 한국 브리핑 대상이므로 한국장 컨벤션을 따른다

### Regime 틴팅 강도
- 은은하지만 인지 가능한 수준 — "오늘 불장이네" 느낌이 카드에서 전달되어야 함
- 적용 대상(카드 배경, 테두리 등) Claude 재량
- 데이터 소스(front matter regime 필드, window.__MP_PAGE 등) Claude 재량 — 기존 데이터 파이프라인 확인 후 판단

### 모드별 표현
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

</decisions>

<specifics>
## Specific Ideas

- 한국 시장 컨벤션: Bull=빨강, Bear=파랑 (미국과 반대) — 이 프로젝트의 대상 독자는 한국 투자자
- Orb 존재감은 "의식 못할 정도"와 "확실한 디자인 요소" 사이의 중간 — 눈치채는 수준
- Regime 틴팅도 동일한 강도 — "오늘 불장/약장이네" 직관적 인지 가능

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-background-regime*
*Context gathered: 2026-02-19*
