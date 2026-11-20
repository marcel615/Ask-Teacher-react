# ASK-20 게시글 댓글 프론트엔드

- [ASK-20](https://marcel615.atlassian.net/browse/ASK-20)은 유일한 프론트엔드 착수 가능 Task였다. 사용자가 2026-11-20 15:40 KST에 Jira에서 착수 가능으로 전환했다(이력 10139). 선행 [ASK-23](https://marcel615.atlassian.net/browse/ASK-23) 완료 및 [Specs PR #15](https://github.com/marcel615/Ask-Teacher-specs/pull/15)와 [Spring PR #38](https://github.com/marcel615/Ask-Teacher-spring/pull/38) 병합을 확인했다.
- React 기준은 develop의 9ab4b829a76322ba1e364fb5bbc2abff8f2e8d99, 작업 브랜치는 feature/issue-20-post-comments다. Spring 댓글 API 대조 기준은 develop의 2c4d02d76cfe5690755c4b0a8deddd0e28df7eac다.
- 게시글 상세에 공개 댓글 목록과 댓글 좋아요 수를 표시한다. 최신순이 기본이며 서버 좋아요순, 이전·다음 탐색, 로딩·빈 결과·조회 오류와 재시도를 제공한다. 작성·수정·삭제·좋아요 등록과 취소는 기존 인증 요청을 사용하고, 수정·삭제는 현재 세션의 사용자 ID와 댓글 작성자 ID가 일치할 때만 표시한다.
- [상세화 결정](https://marcel615.atlassian.net/wiki/spaces/ASK/pages/3407873/ASK-20)에 따라 비로그인 시 상세에서 로그인 안내와 링크를 표시한다. 정렬은 첫 페이지로 돌아가며 댓글 변경 후에는 현재 페이지를 서버에서 다시 조회한다. 마지막 페이지의 댓글을 모두 삭제하면 이전의 마지막 유효 페이지를 표시한다. 불확실한 좋아요 변경은 목록을 다시 읽은 뒤 실제 상태에 따라 같은 방향으로 재시도할 수 있다.
- 대댓글, 댓글 신고·알림·검색, 관리자 삭제, 삭제 댓글 복구, 좋아요 사용자 이력, Spring·Specs 변경은 범위에서 제외한다.
- 검증 범위는 React lint/build, 기존 자동 검증, 격리된 Spring 및 React 브라우저에서 비로그인·두 계정 권한, 정렬·페이지, 입력·오류·중복·재시도·세션 전환이다.

## 공식 기준

Specs main의 5ab2a679605311b78be14e1a9fd96397de620baf에서 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/5ab2a679605311b78be14e1a9fd96397de620baf/docs/requirements.md), [OpenAPI](https://github.com/marcel615/Ask-Teacher-specs/blob/5ab2a679605311b78be14e1a9fd96397de620baf/docs/openapi.yaml#L695), [인증](https://github.com/marcel615/Ask-Teacher-specs/blob/5ab2a679605311b78be14e1a9fd96397de620baf/docs/auth-policy.md), [UI](https://github.com/marcel615/Ask-Teacher-specs/blob/5ab2a679605311b78be14e1a9fd96397de620baf/docs/ui-spec.md#L175), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/5ab2a679605311b78be14e1a9fd96397de620baf/docs/schema.dbml)을 확인했다. 댓글 API 여섯 경로의 요청과 인증, 성공 응답은 현재 Spring 구현과 일치한다.
