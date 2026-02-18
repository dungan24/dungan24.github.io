---
title: "API Documentation"
description: "Market Pulse 데이터 소스, 갱신 정책, 렌더 계약 개요"
draft: false
---

## 데이터 소스

Market Pulse는 시장 지표/뉴스/일정을 조합해 브리핑을 구성합니다.

- 가격 데이터: Yahoo Finance 등 공개 시세 소스
- 가상자산 데이터: CoinGecko
- 심리 지표: Alternative.me Fear & Greed
- 뉴스 피드: Google News RSS, 국내 경제 매체 RSS
- 일정 데이터: 공개 경제 일정 피드 및 정적 캘린더 데이터

## 갱신 주기

- 홈/차트 데이터: 일 단위 파일(`chart-data-YYYY-MM-DD.json`) 기반 갱신
- 브리핑: 슬롯 기준 발행 (`pre-market`, `mid-day`, `post-market`)

## 렌더 계약(요약)

- 마크다운 포스트 + chart-data JSON 조합으로 렌더링합니다.
- 뉴스/캘린더/블록 메타는 계약 마커를 기반으로 파싱합니다.
- 계약 상세는 upstream 문서를 기준으로 관리합니다:
  - `../market-pulse/specs/render-contract.md`
  - `../market-pulse/specs/narrative-contract.md`

## 품질 원칙

- 결측/비정상 값은 fallback 렌더링으로 처리합니다.
- 데이터 지연 시 최신 유효 날짜를 사용하고 기준 날짜를 표기합니다.
- 계약 변경 시 양쪽 레포 문서를 동기화합니다.
