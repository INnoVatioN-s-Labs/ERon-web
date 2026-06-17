# ER On (이리온)
## Frontend Architecture Design Document

Version 1.0

# 1. 프로젝트 소개

ER On은 이터널 리턴 플레이어를 위한 데이터 플랫폼이다.

- 전적 검색
- 실험체 분석
- 메타 분석
- 조합 분석
- 플레이 스타일 분석
- AI 기반 피드백

# 2. 서비스 비전

## Phase 1 - Search
DAK.GG 수준의 전적 검색 서비스

- 닉네임 검색
- 최근 경기 조회
- 시즌 통계
- 실험체별 통계

## Phase 2 - Analytics
ERWAGG 수준의 데이터 분석 서비스

- 실험체 메타 분석
- 패치별 승률 분석
- 픽률 분석
- 티어 분석
- 조합 분석
- 시너지 분석

## Phase 3 - Coaching
LOL.PS 수준의 데이터 기반 코칭 플랫폼

- 플레이 스타일 분석
- 운영 데이터 분석
- 상위권 유저 비교
- AI 기반 피드백
- 실험체 추천
- 루트 추천

# 3. 기술 스택

## Core
- React 19
- TypeScript
- Vite

## UI
- TailwindCSS
- shadcn/ui
- Lucide Icons

## Data
- TanStack Query

## State
- Zustand

## Chart
- Recharts

## Router
- React Router

## Test
- Vitest
- React Testing Library

# 4. 디자인 시스템

- CSS Variable 기반 Theme
- Design Token 기반 설계
- 색상 하드코딩 금지
- spacing/radius 하드코딩 최소화

토큰 관리 대상

- Color
- Typography
- Radius
- Shadow
- Spacing

목표:
컬러, 다크모드, 브랜딩 변경 시 최소 수정으로 대응 가능해야 한다.

# 5. 페이지 설계

## Home
- 닉네임 검색
- 최근 검색
- 현재 메타
- 인기 실험체
- 랭킹 TOP10
- 최신 패치

## Player Page
- 프로필
- 승률
- 평균 순위
- TOP3 비율
- 최근 경기
- 실험체별 전적
- 경기 추이 그래프

## Match Detail
- 게임 정보
- 참가자 정보
- 팀 정보

## Character Page
- 실험체 정보
- 메타 데이터
- 패치별 통계

## Meta Page
- 티어 리스트
- 승률
- 픽률
- 평균 순위

## Synergy Page
- 조합 추천
- 승률
- 평균 순위
- 게임 수

## Ranking Page
- RP
- 승률
- TOP3
- 게임 수

# 6. 프로젝트 구조

```text
src/

app/
pages/
widgets/

features/
 ├ player
 ├ match
 ├ meta
 ├ synergy
 ├ ranking
 └ character

entities/
 ├ player
 ├ match
 └ character

shared/
 ├ ui
 ├ api
 ├ hooks
 ├ utils
 ├ constants
 ├ types
 └ lib
```

# 7. shadcn/ui 사용 규칙

우선 사용

- Button
- Card
- Badge
- Table
- Tabs
- Dialog
- Sheet
- Select
- Dropdown Menu
- Tooltip
- Skeleton

# 8. 데이터 처리 규칙

- 컴포넌트 내부 fetch 금지
- TanStack Query 사용
- Zustand 사용
- API 계층 분리

# 9. 타입스크립트 규칙

- any 사용 금지
- strict mode 사용
- 모든 API 응답 타입 정의

# 10. 테스트 규칙

기능 수준 테스트 작성

대상

- API
- Hook
- Zustand Store
- Utils

도구

- Vitest
- React Testing Library

필수 수행

```bash
npm run lint
npm run test
npm run build
```

# 11. 최종 목표

ER On은 단순 전적 검색 사이트가 아니다.

초기에는 DAK.GG 수준의 검색 서비스를 제공한다.
중기적으로는 ERWAGG 수준의 분석 서비스를 제공한다.
최종적으로는 LOL.PS 수준의 데이터 기반 코칭 플랫폼을 지향한다.

모든 프론트엔드 구조는 확장성을 고려하여 설계한다.
