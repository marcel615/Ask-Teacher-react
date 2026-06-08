# Current Task

## 연결 Issue

* Issue 번호: #2
* Issue 제목: [Feature] post: 게시글 삭제 페이지
* Issue URL: https://github.com/marcel615/Ask-Teacher-react/issues/2

## 작업명

* 게시글 상세 페이지 삭제 기능 구현

## 작업 배경

* 사용자가 게시글 상세 페이지에서 게시글을 삭제할 수 있어야 한다.
* 삭제 버튼 클릭 시 즉시 삭제하지 않고 확인 알림창을 표시한 뒤, 사용자가 "네"를 선택한 경우에만 삭제 API를 호출한다.
* 삭제 요청 성공 후에는 게시글 목록 페이지로 이동한다.

## 참조 설계

API / ERD / 요구사항 전체를 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:
  * 게시글 삭제 기능
  * 게시글 상세 페이지에서 삭제 버튼을 클릭할 수 있다.
  * 삭제 버튼 클릭 시 게시글 삭제 여부를 확인하는 알림창을 표시한다.
  * 사용자가 "네"를 선택하면 삭제 요청을 보낸다.
  * 사용자가 "아니오"를 선택하면 삭제 요청을 보내지 않고 상세 페이지에 머문다.
  * 삭제 요청 중에는 `isLoading` 상태로 화면을 제어한다.
  * 삭제 실패 시 `error` 상태를 설정하고 서버 에러 메시지를 우선 표시한다.
  * 삭제 성공 후 게시글 목록 페이지(`/posts`)로 이동한다.
* 관련 API:
  * `DELETE /api/posts/{postId}`
* Response:

```json
{
  "status": 200,
  "message": "게시글 삭제에 성공했습니다."
}
```

* Status Code:

| 상황 | Status |
|---|---|
| 삭제 성공 | 200 OK |
| 게시글 없음 | 404 Not Found |

* 프론트 처리 기준:
  * 삭제 API 함수는 `response.data`를 반환한다.
  * 삭제 요청은 확인 알림창에서 사용자가 "네"를 선택한 경우에만 실행한다.
  * 에러 메시지는 `error.response?.data?.message`를 우선 사용한다.
  * 서버 응답 메시지가 없으면 기본 에러 메시지를 사용한다.
  * 삭제 성공 시 `/posts` 게시글 목록 페이지로 이동한다.
* 참조 문서:
  * `docs/requirements.md`
  * `docs/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-2-post-delete`
* PR 방향: `feature/issue-2-post-delete` -> `develop`

## 이번 PR에서 할 일

* [ ] `PostDetailPage`에 삭제 버튼 동작 연결
* [ ] 삭제 버튼 클릭 시 삭제 확인 알림창 표시
* [ ] 확인 알림창에서 "네" 선택 시 `DELETE /api/posts/{postId}` 요청
* [ ] 확인 알림창에서 "아니오" 선택 시 삭제 요청 중단
* [ ] `src/api/postApi.js`에 `deletePost(postId)` API 함수 추가
* [ ] 삭제 요청 중 `isLoading` 상태로 화면 제어
* [ ] 삭제 실패 시 `error` 상태와 서버 에러 메시지 표시
* [ ] 삭제 성공 후 `/posts` 게시글 목록 페이지로 이동
* [ ] 가능한 범위에서 `npm run build`, lint 명령이 있으면 `npm run lint` 확인

## 이번 PR에서 하지 않을 일

* 백엔드 API 명세 원본 수정
* ERD 수정
* 백엔드 API 구현 변경
* DB 구조 변경
* 인증/인가 구조 변경
* 로그인 사용자 정보 영속화 또는 전역 인증 상태 구현
* 권한별 삭제 버튼 노출 제어
* JWT 또는 로그인 상태 기반 삭제 권한 처리
* 게시글 목록/작성/수정 기능의 unrelated 리팩터링
* 공통 모달 컴포넌트 신규 설계
* 삭제 후 목록 데이터 자동 갱신 로직 별도 구현

## 완료 조건

* [ ] 게시글 상세 페이지에서 삭제 버튼을 클릭하면 삭제 확인 알림창이 표시된다.
* [ ] "아니오"를 선택하면 API 요청 없이 상세 페이지에 머문다.
* [ ] "네"를 선택하면 `DELETE /api/posts/{postId}` 요청이 전송된다.
* [ ] 삭제 요청 중에는 `isLoading` 상태로 중복 요청 또는 화면 상태가 제어된다.
* [ ] 삭제 실패 시 서버 에러 메시지 또는 기본 에러 메시지가 표시된다.
* [ ] 삭제 성공 응답을 받으면 `/posts` 게시글 목록 페이지로 이동한다.
* [ ] `npm run build` 통과
* [ ] lint 명령이 있으면 `npm run lint` 통과
* [ ] 브라우저 수동 확인에서 Console에 불필요한 에러가 없다.
* [ ] Network 탭에서 `DELETE /api/posts/{postId}` 요청과 Response 구조가 Issue의 API 명세와 일치한다.
* [ ] 백엔드 API/DB/인증 구조 변경 없이 완료된다.

## 예상 변경 파일

### Architect 사전 반영 문서

* `docs/requirements.md`
* `docs/api-usage.md`
* `docs/current-task.md`

### Builder 구현 변경 예상 파일

#### Page

* `src/pages/PostDetailPage.jsx`
  * 실제 파일 위치가 다르면 Builder가 현재 구조 확인 후 해당 상세 페이지 파일만 수정

#### Component

* 없음 예상

#### api

* `src/api/postApi.js`

#### utils

* 없음 예상

#### CSS

* `src/pages/PostDetailPage.css` 또는 기존 상세 페이지 CSS 파일
  * 필요 시에만 수정

#### 기타

* 없음 예상
