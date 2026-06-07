# Current Task

## 연결 Issue

* Issue 번호: #1
* Issue 제목: [Feature] post: 게시글 수정 페이지
* Issue URL: https://github.com/marcel615/Ask-Teacher-react/issues/1

## 작업명

* 게시글 수정 페이지 API 연결 및 제출 처리 구현

## 작업 배경

* 사용자가 기존 게시글을 수정할 때, 수정 페이지에서 입력값을 검증한 뒤 백엔드 수정 API로 변경 내용을 전송해야 한다.
* 수정 요청 중에는 로딩/에러 상태로 화면을 제어하고, 수정 성공 후에는 해당 게시글 상세 페이지를 다시 보여줘야 한다.

## 참조 설계

API / ERD / 요구사항 전체를 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:
  * 게시글 수정 페이지
  * 기존 게시글의 카테고리, 제목, 내용을 수정할 수 있다.
  * 수정 페이지 진입 시 기존 게시글 상세 정보와 카테고리 목록을 조회한다.
  * 기존 카테고리가 선택된 상태로 표시되어야 한다.
  * 입력값 검증은 Form 컴포넌트와 PostEditPage 제출 처리 양쪽에서 수행한다.
  * 수정 버튼 클릭 시 `PATCH /api/posts/{postId}` 요청을 보낸다.
  * 수정 요청 중에는 `isLoading` 상태로 화면을 제어한다.
  * 수정 실패 시 `error` 상태를 설정하고 서버 에러 메시지를 우선 표시한다.
  * 수정 성공 시 해당 게시글 상세 페이지(`/posts/{postId}`)로 이동한다.
* 관련 API:
  * `GET /api/posts/{postId}`
  * `GET /api/categories`
  * `PATCH /api/posts/{postId}`
* Request:

```json
{
  "userId": 1,
  "categoryId": 1,
  "title": "수정 게시글 제목",
  "content": "수정 게시글 내용"
}
```

* Response:

```json
{
  "status": 200,
  "message": "게시글 수정에 성공했습니다.",
  "data": {
    "postId": 1,
    "categoryId": 1,
    "title": "수정 게시글 제목",
    "content": "수정 게시글 내용",
    "updatedAt": "2026-05-12T19:30:00"
  }
}
```

* 프론트 처리 기준:
  * 수정 API 함수는 `response.data`를 반환한다.
  * 에러 메시지는 `error.response?.data?.message`를 우선 사용한다.
  * 입력값 검증 실패 시 API 요청을 보내지 않는다.
  * 수정 성공 시 `/posts/{postId}` 상세 페이지로 이동한다.
* 참조 문서:
  * `docs/requirements.md`
  * `docs/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-1-post-edit-page`
* PR 방향: `feature/issue-1-post-edit-page` -> `develop`

## 이번 PR에서 할 일

* [ ] `PostEditPage`에서 기존 게시글 정보와 카테고리 목록을 불러와 수정 폼에 표시
* [ ] 수정 버튼 클릭 시 입력값 검증
* [ ] 검증 성공 시 `PATCH /api/posts/{postId}` 요청 전송
* [ ] 요청 중 `isLoading` 상태로 화면 제어
* [ ] 요청 실패 시 `error` 상태와 서버 에러 메시지 표시
* [ ] 요청 성공 시 `/posts/{postId}` 상세 페이지로 이동
* [ ] 게시글 수정 API 함수 `updatePost(postId, postData)` 연결
* [ ] 기존 `postValidation` 기준을 재사용하거나 필요한 범위에서 수정 페이지 검증에 맞춤

## 이번 PR에서 하지 않을 일

* 백엔드 API 명세 원본 수정
* ERD 수정
* 백엔드 API 구현 변경
* DB 구조 변경
* 인증/인가 구조 변경
* 로그인 사용자 정보 영속화 또는 전역 인증 상태 구현
* 게시글 삭제 기능 구현
* 게시글 상세 페이지 범위를 넘어서는 UI 리팩터링
* 공통 디자인 시스템 신규 도입

## 완료 조건

* [ ] 수정 페이지 진입 시 기존 게시글과 카테고리 목록이 표시된다.
* [ ] 제목, 내용, 카테고리 입력값 검증 실패 시 PATCH 요청이 발생하지 않는다.
* [ ] 수정 버튼 클릭 시 `PATCH /api/posts/{postId}` 요청이 발생한다.
* [ ] Request Payload가 `userId`, `categoryId`, `title`, `content` 구조와 일치한다.
* [ ] 수정 요청 중 로딩 상태가 표시되거나 중복 제출이 방지된다.
* [ ] 수정 실패 시 서버 에러 메시지 또는 기본 에러 메시지가 표시된다.
* [ ] 수정 성공 시 해당 게시글 상세 페이지(`/posts/{postId}`)로 이동한다.
* [ ] `npm run build` 통과
* [ ] lint 명령이 있으면 `npm run lint` 통과
* [ ] 브라우저 수동 확인에서 Console에 불필요한 에러가 없다.
* [ ] Network 탭에서 Request Payload와 Response 구조가 Issue의 API 명세와 일치한다.
* [ ] 백엔드 API/DB/인증 구조 변경 없이 완료된다.

## 예상 변경 파일

### Architect 사전 반영 문서

* `docs/requirements.md`
* `docs/api-usage.md`
* `docs/current-task.md`

### Builder 구현 변경 예상 파일

#### Page

* `src/PostEditPage.jsx`
* `src/PostDetailPage.jsx`
  * 수정 성공 후 이동 대상 확인 또는 상세 페이지 연동 상태 확인 범위

#### Component

* `src/component/PostForm.jsx`

#### api

* `src/api/postApi.js`

#### utils

* `src/utils/postValidation.js`

#### CSS

* `src/PostEditpage.css`
* `src/component/PostForm.css`
  * 필요 시에만 수정

#### 기타

* `src/routes/AppRouter.jsx`
  * 수정 페이지 라우팅이 없거나 경로 연결이 불완전한 경우에만 수정
