# API 사용 정리

## 공통 기준

- 백엔드 API 원본 명세는 백엔드 프로젝트의 `api-spec.md`를 기준으로 한다.
- 프론트에서는 API 사용 위치, API 함수명, 응답 처리 방식만 정리한다.
- 성공 응답은 백엔드 `ApiResponse` 구조를 따른다.

```json
{
  "status": 200,
  "message": "요청 성공 메시지",
  "data": {}
}
```

- 실제 데이터만 필요한 조회 API는 `response.data.data`를 반환한다.
- 성공 메시지가 필요한 작성/수정/삭제 API는 `response.data`를 반환한다.
- 에러 메시지는 `error.response?.data?.message`에서 꺼낸다.

---

## API 파일 구조

```txt
src/api/
  api.js
  postApi.js
  postCategoryApi.js
  authApi.js
```

---

## API 사용 목록

| 기능 | Method | URL | API 함수 | 사용 위치 | 반환 기준 | 상태 |
|---|---|---|---|---|---|---|
| 게시글 목록 조회 | GET | `/api/posts` | `getPosts()` | `PostListPage` | `response.data.data` | 완료 |
| 게시글 작성 | POST | `/api/posts` | `createPost(postData)` | `PostCreatePage` | `response.data` | 완료 |
| 카테고리 목록 조회 | GET | `/api/categories` | `getCategories()` | `PostCreatePage`, `PostForm` | `response.data.data` | 완료 |
| 게시글 상세 조회 | GET | `/api/posts/{postId}` | `getPost(postId)` | `PostDetailPage` | `response.data.data` | 예정 |
| 게시글 수정 | PATCH | `/api/posts/{postId}` | `updatePost(postId, postData)` | `PostEditPage` | `response.data` | 예정 |
| 게시글 삭제 | DELETE | `/api/posts/{postId}` | `deletePost(postId)` | `PostDetailPage` | `response.data` | 예정 |
| 회원가입 | POST | `/api/auth/signup` | `signup(signupData)` | `SignupPage` | `response.data` | 예정 |
| 로그인 | POST | `/api/auth/login` | `login(loginData)` | `LoginPage` | `response.data` | 예정 |

---

## 응답 데이터 메모

### 게시글 목록 조회

`GET /api/posts` 응답의 각 게시글 항목에서 프론트는 다음 필드를 사용한다.

- `postId`
- `title`
- `writerNickname`
- `newPost`
- `createdAt`

`newPost`가 `true`이면 게시글 목록 UI에 작은 `new` 표시를 노출한다.

---

## 요청 데이터 메모

### 게시글 작성 / 수정

```json
{
  "userId": 1,
  "categoryId": 1,
  "title": "제목",
  "content": "내용"
}
```

### 게시글 수정

#### API 함수

- 함수명: `updatePost(postId, postData)`
- 위치: `src/api/postApi.js`
- Method: `PATCH`
- URL: `/api/posts/{postId}`
- 사용 위치: `PostEditPage`
- 반환 기준: `response.data`

#### Request

```json
{
  "userId": 1,
  "categoryId": 1,
  "title": "수정 게시글 제목",
  "content": "수정 게시글 내용"
}
```

#### Validation

| 필드 | 규칙 |
|---|---|
| postId | 필수, 존재하는 게시글 ID |
| userId | 필수, 존재하는 사용자 ID, 게시글 작성자 ID와 일치 |
| categoryId | 필수, 존재하는 카테고리 ID |
| title | 필수, 100자 이하 |
| content | 필수, 5000자 이하 |

#### Success Response

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

#### 프론트 처리 기준

- 수정 요청은 수정 버튼 클릭 이벤트에서만 실행한다.
- 입력값 검증 실패 시 API 요청을 보내지 않는다.
- 요청 중에는 `isLoading` 상태로 화면을 제어한다.
- 실패 시 `error.response?.data?.message`를 우선 사용한다.
- 성공 시 `/posts/{postId}` 상세 페이지로 이동한다.

### 게시글 삭제

#### API 함수

- 함수명: `deletePost(postId)`
- 위치: `src/api/postApi.js`
- Method: `DELETE`
- URL: `/api/posts/{postId}`
- 사용 위치: `PostDetailPage`
- 반환 기준: `response.data`

#### Request

- Path Variable: `postId`

#### Success Response

```json
{
  "status": 200,
  "message": "게시글 삭제에 성공했습니다."
}
```

#### Status Code

| 상황 | Status |
|---|---|
| 삭제 성공 | 200 OK |
| 게시글 없음 | 404 Not Found |

#### 프론트 처리 기준

- 삭제 요청은 삭제 확인 알림창에서 사용자가 "네"를 선택한 경우에만 실행한다.
- 사용자가 "아니오"를 선택하면 API 요청 없이 상세 페이지에 머문다.
- 삭제 요청 중에는 `isLoading` 상태로 화면을 제어한다.
- 실패 시 `error.response?.data?.message`를 우선 사용한다.
- 서버 응답 메시지가 없으면 기본 에러 메시지를 사용한다.
- 삭제 성공 후 `/posts` 게시글 목록 페이지로 이동한다.

### 회원가입

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "springUser"
}
```

#### Validation

| 필드 | 규칙 |
|---|---|
| email | 필수, 이메일 형식, 중복 불가 |
| password | 필수, 8자 이상 |
| nickname | 필수, 2자 이상 20자 이하, 중복 불가 |

#### 성공 응답

회원가입 API는 생성 성공 시 `201 Created`와 `ApiResponse` 구조를 반환한다.

#### 실패 처리

- Validation 실패: `400 Bad Request`
- 이메일 또는 닉네임 중복: `409 Conflict`
- 실패 시 회원가입 페이지를 유지한다.
- 실패 시 `error` 상태를 설정하고 alert로 "회원가입 실패"를 한 번 표시한다.

### 로그인

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Validation

| 필드 | 규칙 |
|---|---|
| email | 필수, 이메일 형식 |
| password | 필수 |

#### 성공 응답

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

#### Status Code

| 상황 | Status |
|---|---|
| 성공 | 200 OK |
| Validation 실패 | 400 Bad Request |
| 로그인 정보 불일치 | 401 Unauthorized |

#### 프론트 처리 기준

- API 함수명은 `login(loginData)`로 둔다.
- 위치는 `src/api/authApi.js`로 둔다.
- 로그인 요청 성공 시 `response.data`를 반환한다.
- 실패 시 `error.response?.data?.message`를 우선 사용한다.
- Issue #4에서는 성공 응답의 사용자 정보를 저장하지 않는다.
- Issue #4에서는 성공 시 로그인 성공 알림창을 표시한 뒤 게시글 목록 페이지(`/posts`)로 이동한다.

---

## 에러 처리 기준

```js
const message =
    error.response?.data?.message ||
    '요청 처리 중 오류가 발생했습니다.'
```

- 조회 실패: 화면에 에러 메시지 표시
- 작성/수정/삭제 실패: alert 또는 에러 메시지 표시
- 서버 응답 없음: 기본 에러 메시지 표시
