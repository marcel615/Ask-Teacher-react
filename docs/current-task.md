# Current Task

## 연결 Issue

* Issue 번호: #8
* Issue 제목: feat(post): 게시글 수정
* Issue URL: https://github.com/marcel615/Ask-Teacher/issues/8

## 작업명

* 게시글 수정 페이지 API 연결

## 작업 배경

* 사용자는 기존 게시글의 카테고리, 제목, 내용을 수정할 수 있어야 한다.
* 게시글 수정 페이지는 URL의 `postId`를 기준으로 기존 게시글 정보를 조회한다.
* 수정 폼에는 기존 카테고리, 제목, 내용이 초기값으로 표시되어야 한다.
* 카테고리는 백엔드 카테고리 목록 API를 통해 select 박스로 표시한다.
* 로그인/토큰 기반 인증 구조가 아직 정식 범위가 아니므로, MVP 단계에서는 `userId`를 임시값으로 전달한다.
* 수정 성공 시 게시글 목록 페이지 또는 상세 페이지로 이동한다.

## 참조 설계

API / ERD / 요구사항 전체는 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:

  * 게시글 수정
  * 사용자는 게시글의 카테고리, 제목, 내용을 수정할 수 있다.
  * 제목은 필수이며 100자 이하이다.
  * 내용은 필수이며 5000자 이하이다.
  * 제목과 내용은 공백만 입력할 수 없다.
  * 요청 사용자 ID와 게시글 작성자 ID가 일치해야 수정할 수 있다.
* 관련 API:

  * `GET /api/posts/{postId}`
  * `GET /api/categories`
  * `PATCH /api/posts/{postId}`
* 관련 화면:

  * `PostEditPage`
  * `PostForm`
* 참조 문서:

  * `docs/ai/requirements.md`
  * `docs/ai/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-8-post-update-page`
* PR 방향: `feature/issue-8-post-update-page` → `develop`

## 이번 PR에서 할 일

* [ ] `PostEditPage`에서 URL의 `postId` 추출
* [ ] 게시글 상세 조회 API 함수 추가 또는 기존 함수 확인
* [ ] 게시글 수정 API 함수 추가
* [ ] 카테고리 목록 조회 API 재사용
* [ ] 수정 페이지 진입 시 기존 게시글 정보 조회
* [ ] 수정 페이지 진입 시 카테고리 목록 조회
* [ ] 기존 게시글의 `categoryId`, `title`, `content`를 form 초기값으로 설정
* [ ] `PostForm`을 작성/수정 페이지에서 재사용 가능하도록 확인
* [ ] 수정 요청 시 `userId`, `categoryId`, `title`, `content`를 request body에 포함
* [ ] `validateForm`을 재사용해 입력값 검증
* [ ] 검증 실패 시 API 요청 없이 경고 메시지 표시
* [ ] 수정 성공 시 성공 메시지 표시
* [ ] 수정 성공 후 게시글 상세 페이지 또는 목록 페이지로 이동
* [ ] 수정 실패 시 서버 에러 메시지 표시
* [ ] 로딩 상태 처리
* [ ] 에러 상태 처리
* [ ] 사용하지 않는 import 제거
* [ ] 수동 테스트 진행

## 이번 PR에서 하지 않을 일

* 게시글 상세 조회 백엔드 API 구현
* 게시글 삭제 기능
* 게시글 목록 UI 변경
* 검색 / 페이징 / 정렬 조건
* 댓글 기능
* 로그인/토큰 기반 인증/인가 구조 변경
* 전역 상태 관리 도입
* 디자인 시스템 수준의 공통 컴포넌트 분리

## 완료 조건

* [ ] 게시글 수정 페이지에서 기존 게시글 데이터가 정상 표시된다.
* [ ] 카테고리 select에 카테고리 목록이 정상 표시된다.
* [ ] 카테고리, 제목, 내용을 수정할 수 있다.
* [ ] 입력값 검증이 정상 동작한다.
* [ ] 수정 API 요청 payload가 백엔드 DTO와 일치한다.
* [ ] 수정 성공 후 의도한 페이지로 이동한다.
* [ ] 수정 실패 시 에러 메시지가 표시된다.
* [ ] 브라우저 Console에 불필요한 에러가 없다.
* [ ] Network 탭에서 요청/응답을 확인했다.
* [ ] git diff 검토 완료
* [ ] PR 본문 작성

## 예상 변경 파일

### 생성 가능

* `src/api/postApi.js` 내 `getPost`, `updatePost` 함수 추가
* 필요 시 `src/utils/postValidation.js` 수정

### 수정 가능

* `docs/ai/current-task.md`
* `docs/ai/api-usage.md`
* `src/PostEditPage.jsx`
* `src/component/PostForm.jsx`
* `src/PostEditPage.css`
* `src/api/postApi.js`
* `src/utils/postValidation.js`
