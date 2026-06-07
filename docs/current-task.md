# Current Task

## 연결 Issue

* Issue 번호: #3
* Issue 제목: [Feature] auth: 회원가입 페이지
* Issue URL: https://github.com/marcel615/Ask-Teacher-react/issues/3

## 작업명

* 회원가입 페이지 API 연결 및 상태 처리

## 작업 배경

* 사용자는 회원가입 페이지에서 이메일, 비밀번호, 닉네임을 입력해 회원가입 요청을 보낼 수 있어야 한다.
* 회원가입 요청 중에는 `isLoading`과 `error` 상태로 화면 상태를 제어한다.
* 회원가입 성공 시 게시글 목록 페이지(`/posts`)로 이동한다.
* 회원가입 실패 시 회원가입 페이지에 그대로 머무르고 알림창으로 "회원가입 실패"를 한 번 표시한다.
* 입력값 검증은 Form 컴포넌트와 Page 제출 처리 양쪽에서 수행한다.

## 참조 설계

API / ERD / 요구사항 전체는 복사하지 않는다. 이번 Issue와 직접 관련된 요약과 참조만 적는다.

* 관련 요구사항:

  * 회원가입 페이지
  * 사용자는 이메일, 비밀번호, 닉네임을 입력해 회원가입할 수 있다.
  * 이메일은 필수이며 이메일 형식이어야 하고 중복될 수 없다.
  * 비밀번호는 필수이며 8자 이상이어야 한다.
  * 닉네임은 필수이며 2자 이상 20자 이하이고 중복될 수 없다.
  * 회원가입 성공 시 `/posts`로 이동한다.
  * 회원가입 실패 시 회원가입 페이지에 머무르고 alert로 "회원가입 실패"를 한 번 표시한다.
* 관련 API:

  * `POST /api/auth/signup`
* Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "springUser"
}
```

* Response:

```json
{
  "status": 201,
  "message": "회원가입 성공!",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "springUser"
  }
}
```

* Status Code:

  * `201 Created`
  * `400 Bad Request`
  * `409 Conflict`
* 관련 화면:

  * `SignupPage`
  * 회원가입 Form 컴포넌트가 있다면 해당 컴포넌트
* 참조 문서:

  * `docs/requirements.md`
  * `docs/api-usage.md`

## 작업 브랜치

* 기준 브랜치: `develop`
* 작업 브랜치: `feature/issue-3-signup-page`
* PR 방향: `feature/issue-3-signup-page` -> `develop`

## 이번 PR에서 할 일

* [ ] 회원가입 페이지에서 이메일, 비밀번호, 닉네임 입력값 관리
* [ ] 회원가입 Form 검증 추가 또는 기존 검증 확인
* [ ] Page 제출 처리에서 입력값 재검증
* [ ] `POST /api/auth/signup` API 함수 추가 또는 기존 함수 확인
* [ ] 회원가입 요청 중 `isLoading` 상태 처리
* [ ] 회원가입 실패 시 `error` 상태 처리
* [ ] 회원가입 실패 시 alert로 "회원가입 실패" 한 번 표시
* [ ] 회원가입 실패 시 입력값 유지
* [ ] 회원가입 성공 시 `/posts`로 이동
* [ ] 불필요한 import와 console.log 제거
* [ ] 수동 테스트 진행

## 이번 PR에서 하지 않을 일

* 백엔드 API 명세 원본 수정
* 백엔드 API 구현 변경
* DB 구조 변경
* 인증/인가 구조 변경
* JWT 저장 또는 로그인 상태 전역 관리 도입
* 로그인 페이지 API 연결
* 게시글 목록 페이지 기능 변경
* 공통 디자인 시스템 분리

## 완료 조건

* [ ] 회원가입 페이지에서 필수 입력값 검증이 동작한다.
* [ ] 이메일 형식 검증이 동작한다.
* [ ] 비밀번호 8자 이상 검증이 동작한다.
* [ ] 닉네임 2자 이상 20자 이하 검증이 동작한다.
* [ ] 검증 실패 시 회원가입 API 요청을 보내지 않는다.
* [ ] 회원가입 요청 payload가 백엔드 DTO와 일치한다.
* [ ] 회원가입 요청 중 loading 상태가 화면에 반영된다.
* [ ] 회원가입 성공 시 `/posts`로 이동한다.
* [ ] 회원가입 실패 시 회원가입 페이지에 머무른다.
* [ ] 회원가입 실패 시 alert로 "회원가입 실패"가 한 번 표시된다.
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

* `src/SignupPage.jsx` 또는 실제 회원가입 페이지 파일

#### Component

* 회원가입 Form 컴포넌트가 분리되어 있다면 해당 파일

#### api

* `src/api/authApi.js`

#### utils

* 회원가입 검증 유틸이 있다면 해당 파일
* 없고 중복이 작다면 Page/Form 내부 검증으로 처리

#### CSS

* `src/SignupPage.css` 또는 회원가입 페이지 스타일 파일

#### 기타

* 라우팅 파일은 기존 `/signup` 연결이 없다면 확인 필요
