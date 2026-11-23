# ASK-19 게시글 목록 검색·필터·페이지 이동

- [ASK-19](https://marcel615.atlassian.net/browse/ASK-19)은 진행 중인 다른 프론트엔드 작업이 없는 상태에서 유일한 착수 가능 작업이었다. 사용자가 2026-11-23 11:41 KST에 Jira에서 착수 가능으로 전환했다(이력 10197). [ASK-25](https://marcel615.atlassian.net/browse/ASK-25)는 완료됐고 [Specs PR #16](https://github.com/marcel615/Ask-Teacher-specs/pull/16)은 main에 병합됐다.
- React 기준 7714408d6a169efdb21d7fb476d9de5735c91c22, 브랜치 feature/issue-19-post-list-search. Spring API 대조 기준 2c4d02d76cfe5690755c4b0a8deddd0e28df7eac.
- 검색 버튼과 Enter는 검색어와 카테고리를 함께 적용하고 첫 페이지로 이동한다. URL과 브라우저 이력은 마지막 적용 조건 및 페이지를 복원한다. 입력 중에는 목록 요청을 변경하지 않는다.
- 공개 게시글 API의 서버 정렬과 페이지 메타데이터를 사용한다. 페이지 경계를 표시하고 범위를 벗어난 URL을 보정한다. 카테고리 조회와 목록의 로딩·오류·재시도를 각각 처리하고 필터가 있는 빈 목록과 기본 빈 목록을 구분한다.
- 별도 정렬·페이지 크기 UI 및 서버·공식 계약 변경은 범위 밖이다.

## 공식 기준

Specs main 8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44의 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44/docs/requirements.md), [OpenAPI](https://github.com/marcel615/Ask-Teacher-specs/blob/8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44/docs/openapi.yaml), [인증 정책](https://github.com/marcel615/Ask-Teacher-specs/blob/8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44/docs/auth-policy.md), [UI §4–5](https://github.com/marcel615/Ask-Teacher-specs/blob/8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44/docs/ui-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/8cd61ec7502fed9f99c8ab8d1137f164a0fd3c44/docs/schema.dbml)를 확인했다. URL 페이지는 화면과 같은 1부터 시작하며 API 요청에서 0부터 시작하도록 변환한다. 첫 페이지는 URL에서 생략한다.
