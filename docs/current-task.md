# ASK-17 게시글 좋아요 프론트엔드

- [ASK-17](https://marcel615.atlassian.net/browse/ASK-17)에서 박민재가 2026-11-20 13:55 KST에 착수를 승인했다(Jira 이력 10086). 프론트엔드 착수 가능 Task 중 유일한 후보였다. 차단 링크는 없으며 ASK-14 완료, [React PR #30](https://github.com/marcel615/Ask-Teacher-react/pull/30)과 [Spring PR #28](https://github.com/marcel615/Ask-Teacher-spring/pull/28)의 develop 병합을 확인했다.
- React 기준 `3f2fb770a7beb8648a560a9ebea248086356dc95`, 브랜치 `feature/issue-17-post-likes`. Spring develop API 대조 기준 `2c4d02d76cfe5690755c4b0a8deddd0e28df7eac`.
- 목록과 상세에 서버의 좋아요 수를 표시한다. 상세에서 서버의 내 좋아요 여부를 접근 가능한 하트 버튼으로 표시한다. [상세화 결정](https://marcel615.atlassian.net/wiki/spaces/ASK/pages/3178497/ASK-17)에 따라 비로그인 클릭 시 같은 글에 로그인 안내와 링크를 표시한다.
- 로그인 사용자의 등록과 취소는 기존 인증 요청을 재사용한다. 해당 글과 인증 세대에 대해 중복 실행을 막는다. 완료 후 서버 값을 조회하며, 실패 시 재조회한 현재 상태에서 재시도를 제공한다. 현재 세대의 상세 쿼리만 갱신하고 공개 목록은 별도로 무효화한다.
- 제외 범위는 신규 Backend 구현, 공식 명세 변경, 검색·필터·페이징, 댓글 반응과 로그인 뒤 자동 좋아요 등록이다.
- 검증은 lint/build와 기존 자동 검증을 실행하고, 격리된 Spring 및 React의 브라우저에서 비로그인, 등록·취소, 새로고침, 중복 클릭, 오류 복구와 계정 전환 흐름을 확인한다.

## 공식 기준

Specs main `bb06abd9d2557a37ca19ae1bde3bc1b23f878357`의 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/requirements.md), [API](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/openapi.yaml), [인증](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/auth-policy.md), [UI](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/ui-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/schema.dbml)를 확인했다. OpenAPI의 구현 예정 표기와 별개로 Spring develop에 등록 200과 취소 204가 있으며 메서드, 경로, 빈 본문이 계약과 일치한다.
