# ASK-19 작업 기록

- 이전 ASK-20의 Jira 완료, React PR #32의 develop 병합 및 월별 devlog 반영을 확인했다.
- ASK-19의 사용자 착수 이력과 진행 중 전환 권한을 확인했다. 원격과 일치하는 develop에서 feature/issue-19-post-list-search 브랜치를 만들고 ASK-19를 진행 중으로 전환한 뒤 재조회했다.
- 검색 폼의 편집값과 URL의 적용 조건을 구분하고, 목록 쿼리를 조건과 페이지별로 분리했다. 게시글 좋아요 변경 시 모든 목록 캐시를 갱신한다.

- 자체 리뷰와 Architect 독립 리뷰를 수행했다. 범위를 벗어난 URL을 보정할 때 미제출 검색어·카테고리와 포커스가 사라지는 문제를 수정했다. Architect가 메모리 라우터로 보정 및 이력 이동을 재검증했고 추가 필수 지적은 없었다.
- npm run lint, npm run build, git diff --check와 기존 자동 테스트 23건이 통과했다. ASK-14 전용 옵트인 연동 테스트 1건은 미실행이다.
- 격리 Spring H2·전용 Redis·Vite preview·Chrome에서 로그인/비로그인 조건 조합, 버튼/Enter, 목록 이력 및 새로고침, 0건/1페이지와 마지막 페이지, 지연된 URL 보정 중 입력·포커스 보존, 404와 개별 오류/재시도, 게시글 상세·작성 이동, 필터 목록에서 실제 좋아요 갱신을 확인했다. Chrome에서 게시글 계열 응답 31건의 URL·상태와 대표 응답의 페이지·건수를 확인했고 JavaScript 예외·console.error는 없었다. 404는 Spring 응답이며 목록과 카테고리 503은 응답 주입이다.
