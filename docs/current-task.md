# ASK-21 React TypeScript 전환

- [ASK-21](https://marcel615.atlassian.net/browse/ASK-21)은 유일한 프론트엔드 착수 가능 작업이었다. 박민재가 2026-11-23 13:59 KST에 착수 가능으로 전환했다. 이전 ASK-18은 완료됐으며 [PR #34](https://github.com/marcel615/Ask-Teacher-react/pull/34) 병합과 월별 devlog를 확인했다.
- React develop의 원격 기준은 ab42444367ccf33d7fca8ad7dcb036ddbb27162e다. 같은 작업 브랜치와 PR에서 앱 소스 30개를 단계적으로 전환한다.
- 1단계는 엄격한 TypeScript 검사와 JS·JSX 공존, TS·TSX 린트, Vite 개발·빌드 검증이다. 완료하면 Draft PR을 연다.
- 2단계는 게시글 목록, 카테고리, 검색, 페이징이다. 3단계는 다른 게시글 화면, 댓글, 첨부 및 공통 코드다. 4단계는 인증·세션과 최종 검증이다.
- 기존 API·화면 동작과 공식 계약을 유지한다. CSS·정적 자산은 기존 형식을 사용한다.
- 단계별 타입 검사·린트·빌드와 합의한 브라우저 흐름을 검증한다. 기존 로컬 인증·첨부 테스트는 회귀 확인에 재사용한다. 백엔드 연동 테스트는 격리된 대상 환경의 설정 여부를 확인한다.

## 공식 기준

Specs main ee0ef5313acab5887ee11b59272c29d88af9f504의 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/requirements.md), [OpenAPI](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/openapi.yaml), [인증 정책](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/auth-policy.md), [UI 명세](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/ui-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/schema.dbml)를 적용한다.
