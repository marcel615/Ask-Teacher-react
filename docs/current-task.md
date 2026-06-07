# Current Task

## 연결 Issue

* Issue 번호: #4
* Issue 제목: [Feature] auth: 로그인 페이지
* Issue URL: https://github.com/marcel615/Ask-Teacher-react/issues/4

## 작업명

* 로그인 페이지 Form 검증 및 로그인 API 연결

## 작업 배경

* 로그인 고도화 전 단계로, 사용자가 이메일과 비밀번호를 입력하고 로그인 버튼을 누르면 로그인 API를 호출한다.
* 로그인 성공 시 실제 인증 상태 저장이나 권한 처리는 하지 않고, 로그인 성공 알림창을 한 번 표시한 뒤 게시글 목록 페이지(`/posts`)로 이동한다.
* 입력값 검증은 Form 컴포넌트와 Page 제출 처리 지점 양쪽에서 수행한다.
* 검증 실패 시 API 요청을 보내지 않고 사용자에게 메시지를 표시한다.

## 참조 설계

API / ERD / 요구사항 전체를 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:
  * 로그인 페이지
  * 사용자는 이메일과 비밀번호를 입력해 로그인할 수 있다.
  * 이메일은 필수이며 이메일 형식이어야 한다.
  * 비밀번호는 필수이다.
  * 입력값 검증은 Form 컴포넌트와 Page 제출 처리 양쪽에서 수행한다.
  * 로그인 성공 시 MVP 임시 처리로 로그인 성공 알림창을 한 번 표시한 뒤 게시글 목록 페이지(`/posts`)로 이동한다.
  * Issue #4 범위에서는 JWT 저장, 전역 로그인 상태 관리, 권한 제어, 사용자 정보 영속화는 구현하지 않는다.
* 관련 API:
  * `POST /api/auth/login`
* Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

* Response:

```json
{
  "status": 200,
  "message": "로그인에 성공했습니다.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "springUser"
  }
}
```

* Status Code:
  * `200 OK`
  * `400 Bad Request`
  * `401 Unauthorized`
* 관련 화면:
  * `LoginPage`
  * 로그인 Form 컴포넌트가 있다면 해당 컴포넌트
* 참조 문서:
  * `docs/requirements.md`
  * `docs/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-4-login-page`
* PR 방향: `feature/issue-4-login-page` -> `develop`

## 이번 PR에서 할 일

* [ ] 로그인 페이지에서 이메일/비밀번호 입력 상태 관리
* [ ] 로그인 Form 컴포넌트에서 입력값 검증 수행
* [ ] Page 제출 처리 지점에서 입력값 검증 수행
* [ ] 검증 실패 시 API 요청 중단 및 사용자 메시지 표시
* [ ] `POST /api/auth/login` API 함수 추가 또는 기존 함수 정리
* [ ] 로그인 요청 중 중복 제출 방지
* [ ] 로그인 성공 시 성공 알림창 한 번 표시 후 `/posts` 이동
* [ ] 로그인 실패 시 서버 메시지를 우선 사용해 실패 메시지 표시
* [ ] 불필요한 import와 console.log 제거
* [ ] 수동 테스트 진행

## 이번 PR에서 하지 않을 일

* 백엔드 API 명세 원본 수정
* 백엔드 API 구현 변경
* DB 구조 변경
* 인증/인가 구조 변경
* JWT 발급/저장/갱신 처리
* 전역 로그인 상태 관리 도입
* 권한별 라우팅 또는 버튼 노출 제어
* 사용자 정보 localStorage/sessionStorage 저장
* 로그인 성공 후 `/posts` 이동 외의 추가 페이지 이동 고도화

## 완료 조건

* [ ] 이메일 미입력 시 API 요청 없이 검증 메시지가 표시된다.
* [ ] 이메일 형식이 올바르지 않으면 API 요청 없이 검증 메시지가 표시된다.
* [ ] 비밀번호 미입력 시 API 요청 없이 검증 메시지가 표시된다.
* [ ] 유효한 입력값으로 로그인 버튼 클릭 시 `POST /api/auth/login` 요청이 발생한다.
* [ ] 요청 payload가 `{ email, password }` 구조와 일치한다.
* [ ] 성공 응답 수신 시 로그인 성공 알림창이 한 번 표시되고 `/posts`로 이동한다.
* [ ] `400 Bad Request` 또는 `401 Unauthorized` 실패 응답 시 서버 메시지를 우선 사용해 실패 메시지를 표시한다.
* [ ] 요청 중 중복 제출이 방지된다.
* [ ] 브라우저 Console에 불필요한 에러가 없다.
* [ ] Network 탭에서 Request Payload와 Response를 확인한다.
* [ ] `npm run build` 통과
* [ ] lint 명령이 있으면 `npm run lint` 통과

## 예상 변경 파일

### Architect 사전 반영 문서

* `docs/requirements.md`
* `docs/api-usage.md`
* `docs/current-task.md`

### Builder 구현 변경 예상 파일

#### Page

* `src/pages/LoginPage.jsx` 또는 실제 로그인 페이지 파일

#### Component

* 로그인 Form 컴포넌트가 분리되어 있다면 해당 파일
* 없다면 기존 로그인 페이지 내부에서 최소 변경

#### api

* `src/api/authApi.js`
* 필요 시 `src/api/api.js`의 기존 axios 설정 사용

#### utils

* 로그인 검증 함수 분리가 필요할 경우 `src/utils/authValidation.js`
* 단일 사용에 그치면 별도 utils 파일을 만들지 않고 Page/Form 내부 처리

#### CSS

* 로그인 페이지 CSS 파일
* 로그인 Form 관련 CSS 파일이 이미 있다면 해당 파일

#### 기타

* 라우터에 `/login` 연결이 누락되어 있을 경우 라우터 설정 파일
