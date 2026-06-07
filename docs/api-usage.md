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
