---
title: "API Documentation"
description: "Market Pulse 콘텐츠에 사용되는 주요 데이터 소스와 갱신 정책"
draft: false
---

## 데이터 소스

Market Pulse는 시장 지표/뉴스/일정 데이터를 조합해 브리핑을 구성합니다.

- 가격 데이터: Yahoo Finance 등 공개 소스
- 가상자산 데이터: CoinGecko
- 심리 지표: Alternative.me Fear & Greed
- 뉴스 피드: Google News RSS, 국내 경제 매체 RSS
- 일정 데이터: ForexFactory 및 정적 캘린더 파일

## 갱신 주기

- 홈 데이터: 일 단위 파일(`chart-data-YYYY-MM-DD.json`) 기반 갱신
- 브리핑: 개장전/장중/장후 3개 슬롯 기준 발행

## 품질 원칙

- 결측치/비정상치가 감지되면 기본값 또는 보수적 표시로 대체합니다.
- 데이터 지연 시 가장 최신 유효 날짜를 사용하고, 화면에 기준 날짜를 표기합니다.
