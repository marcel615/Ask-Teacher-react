# Current Task

## 연결 Issue

* Issue 번호: #5
* Issue 제목: [refactor] post: 게시글 목록 조회
* Issue URL: https://github.com/marcel615/Ask-Teacher-react/issues/5

## 작업명

* 게시글 목록 새 글 표시 추가

## 작업 배경

* 게시글 목록 조회 응답의 각 게시글 항목에는 `newPost` 필드가 포함된다.
* 사용자가 게시글 목록을 볼 때 새 게시글을 쉽게 식별할 수 있도록, `newPost` 값이 `true`인 게시글에 작은 `new` 표시를 노출한다.

## 참조 설계

API / ERD / 요구사항 전체를 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:
  * 게시글 목록 페이지
  * 사용자는 게시글 목록을 조회할 수 있다.
  * 게시글 목록 응답의 `newPost` 값이 `true`인 게시글은 제목 또는 목록 항목 근처에 작은 `new` 표시를 노출한다.
  * 게시글 목록 응답의 `newPost` 값이 `false`인 게시글에는 `new` 표시를 노출하지 않는다.
  * 기존 게시글 목록 조회, 제목 클릭 이동, loading / error / empty 처리는 유지한다.
* 관련 API:
  * `GET /api/posts`
* Response:

```json
{
  "status": 200,
  "message": "게시글 목록 조회에 성공했습니다.",
  "data": [
    {
      "postId": 1,
      "title": "Spring Bean이 뭔가요?",
      "writerNickname": "springUser",
      "newPost": true,
      "createdAt": "2026-05-12T19:30:00"
    },
    {
      "postId": 2,
      "title": "DTO와 Entity 차이가 뭔가요?",
      "writerNickname": "backendUser",
      "newPost": false,
      "createdAt": "2026-05-11T14:20:00"
    }
  ]
}
```

* 프론트 처리 기준:
  * 기존 `getPosts()` API 함수 사용 흐름을 유지한다.
  * API 함수는 기존 기준대로 `response.data.data`를 반환한다.
  * 각 게시글의 `newPost`가 `true`이면 목록 항목에 작은 `new` 표시를 노출한다.
  * 각 게시글의 `newPost`가 `false`이면 `new` 표시를 노출하지 않는다.
* 참조 문서:
  * `docs/requirements.md`
  * `docs/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-5-post-new-badge`
* PR 방향: `feature/issue-5-post-new-badge` -> `develop`

## 이번 PR에서 할 일

* [ ] 게시글 목록 페이지에서 `newPost === true`인 게시글에 `new` 표시 추가
* [ ] `newPost === false`인 게시글에는 `new` 표시가 보이지 않도록 처리
* [ ] `new` 표시가 목록 레이아웃을 깨지 않도록 CSS 적용
* [ ] 게시글 목록 조회의 기존 loading / error / empty 처리 유지
* [ ] 제목 클릭 시 상세 페이지 이동 흐름 유지
* [ ] 불필요한 import와 console.log 제거
* [ ] 가능한 범위에서 수동 테스트 진행

## 이번 PR에서 하지 않을 일

* 백엔드 API 명세 원본 수정
* ERD 수정
* 백엔드 API 구현 변경
* DB 구조 변경
* 인증/인가 구조 변경
* 게시글 목록 API 호출 방식 변경
* 게시글 상세/작성/수정/삭제 기능 변경
* 새 글 판단 기준 변경
* `newPost` 필드 생성 로직 구현

## 완료 조건

* [ ] 게시글 목록 응답에서 `newPost`가 `true`인 항목에만 작은 `new` 표시가 보인다.
* [ ] 게시글 목록 응답에서 `newPost`가 `false`인 항목에는 `new` 표시가 보이지 않는다.
* [ ] 기존 게시글 목록 조회, 제목 클릭 이동, loading / error / empty 처리가 유지된다.
* [ ] 브라우저 Console에 불필요한 에러가 없다.
* [ ] Network 탭에서 게시글 목록 Response의 `newPost` 값을 확인한다.
* [ ] `npm run build` 통과
* [ ] lint 명령이 있으면 `npm run lint` 통과
* [ ] 백엔드 API/DB/인증 구조 변경 없이 완료된다.

## 예상 변경 파일

### Architect 사전 반영 문서

* `docs/requirements.md`
* `docs/api-usage.md`
* `docs/current-task.md`

### Builder 구현 변경 예상 파일

#### Page

* 게시글 목록 페이지 파일
  * 실제 경로는 Builder 단계에서 코드 확인 후 확정

#### Component

* 게시글 목록 항목 컴포넌트가 분리되어 있다면 해당 컴포넌트
  * 실제 경로는 Builder 단계에서 코드 확인 후 확정

#### api

* 변경 없음 예상
* 기존 `getPosts()` 응답의 `newPost` 필드 사용

#### utils

* 변경 없음 예상

#### CSS

* 게시글 목록 페이지 또는 목록 항목 스타일 파일
  * 실제 경로는 Builder 단계에서 코드 확인 후 확정

#### 기타

* 없음
