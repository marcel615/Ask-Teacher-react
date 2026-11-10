# Frontend 개발 안내

공식 요구사항·계약·화면 동작의 원본은 Specs main의 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/requirements.md), [API 및 인증 계약](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/api-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/erd.md), [UI 명세](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/ui-spec.md)다. 이 문서는 Frontend 내부 구현 선택과 확인 시점의 현황만 관리한다. 공식 계약을 재정의하지 않는다.

## 현재 기술과 구조

- 기준 commit: `31efac3c9191d91ac73c64471e68e19e0f5e3b5f`, [Issue #13](https://github.com/marcel615/Ask-Teacher-react/issues/13), [PR #19](https://github.com/marcel615/Ask-Teacher-react/pull/19).
- React 19, Vite 8, React Router DOM 7, Axios, React Query 5, React Hook Form 7, CSS를 사용한다.
- 제품 파일은 JavaScript/JSX이며 `src/types/apiTypes.d.ts`와 JSDoc으로 요청 타입을 연결한다. 전체 .tsx 전환·타입 검사는 완료 상태가 아니며 [Issue #20](https://github.com/marcel615/Ask-Teacher-react/issues/20)의 별도 범위다.
- `src/main.jsx`의 QueryClientProvider, `src/routes/AppRouter.jsx`의 라우트, `src/component`의 공통 컴포넌트를 사용한다. 기존 경로를 임의로 `src/pages`나 `src/components`로 가정하지 않는다.
- Axios 공통 인스턴스: `src/api/api.js`, 현재 baseURL은 `http://localhost:8080/api`다. 개발 화면은 기본 `http://localhost:5173`에서 확인한다.

## API 함수와 사용 위치

| 모듈 | 함수 | 사용 화면 |
|---|---|---|
| src/api/postApi.js | getPosts() | HomePage가 표시하는 PostListPage |
| src/api/postApi.js | getPost(postId) | PostDetailPage, PostEditPage |
| src/api/postApi.js | createPost(postData) | PostCreatePage |
| src/api/postApi.js | updatePost(postId, postData) | PostEditPage |
| src/api/postApi.js | deletePost(postId) | PostDetailPage |
| src/api/postCategoryApi.js | getCategories() | PostCreatePage, PostEditPage; PostForm에 목록 전달 |
| src/api/authApi.js | signup(signupData) | SignupPage |
| src/api/authApi.js | login(loginData) | LoginPage |

조회와 변경의 실제 계약은 공식 API 명세를 확인한다. 현재 조회 함수의 `response.data.data`, 변경·인증 함수의 `response.data`와 `ApiResponse<T>` 타입은 과거 래퍼 계약에 의존한다. 공식 성공 응답 계약과의 차이는 [이전 검토](spec-migration-review.md)에 남겼으며 이 현황을 신규 구현 규칙으로 사용하지 않는다.

## 서버 상태와 캐시

- 조회는 `useQuery`, 작성·수정·삭제·회원가입·로그인은 `useMutation`을 사용한다. 변경 요청은 사용자 제출·클릭에서만 실행한다.
- 키는 `src/api/queryKeys.js`에 둔다.

| 대상 | 현재 query key / 성공 처리 |
|---|---|
| 게시글 목록 | postKeys.all = ['posts'] |
| 게시글 상세 | postKeys.detail(postId) = ['posts', String(postId)] |
| 카테고리 | categoryKeys.all = ['categories'] |
| 게시글 작성 | 목록 invalidate 후 /posts 이동 |
| 게시글 수정 | 목록·해당 상세 invalidate 후 상세 이동 |
| 게시글 삭제 | 목록 invalidate 및 삭제된 상세 removeQueries 후 /posts로 replace 이동 |
| 회원가입·로그인 | 현재 별도 query invalidate 없음; 성공 후 /posts 이동 |

query key의 ID 표현을 일치시키고, 서버 상태와 화면의 폼·표시 상태를 구분한다. 조회 실패·빈 목록·mutation 실패·제출 중 상태와 중복 실행 방지를 확인한다.

## 폼과 오류 처리

- React Hook Form의 register·handleSubmit·errors로 입력과 검증을 관리한다. PostForm은 등록과 오류를 전달받는다. 수정 화면은 조회 결과와 카테고리를 받은 후 reset으로 초기값을 채운다. 이 useEffect는 조회나 자동 제출 지시가 아니다.
- 카테고리 필수, 제목·내용 공백/길이와 인증 폼 규칙은 공식 UI/API 기준으로 확인한다. 검증 실패 시 요청을 보내지 않고 실패 시 작성 중 입력을 유지한다.
- 기존 `src/utils/postValidation.js`의 과거 보조 검증 기록을 현재 모든 폼이 이 함수를 호출한다는 규칙으로 해석하지 않는다.
- 서버 에러의 `error.response?.data?.message`를 우선 사용하고 응답이 없으면 사용자용 기본 메시지를 표시한다.
- 과거 [Issue #1](https://github.com/marcel615/Ask-Teacher-react/issues/1)의 수정 후 상세 이동, [#2](https://github.com/marcel615/Ask-Teacher-react/issues/2)의 삭제 확인/취소와 목록 이동, [#3](https://github.com/marcel615/Ask-Teacher-react/issues/3)의 회원가입 실패 시 화면 유지·실패 알림, [#4](https://github.com/marcel615/Ask-Teacher-react/issues/4)의 임시 로그인 성공 알림·이동, [#5](https://github.com/marcel615/Ask-Teacher-react/issues/5)의 newPost 표시 결정은 당시 요구사항으로 보존한다. 현재 UI 동작과의 차이는 관련 Issue에서 판단한다.

## 범위와 확인

과거 MVP의 JWT·전역 인증 상태·권한 UI·댓글·검색·파일 제외는 당시 구현 범위다. 현재 공식 기능의 제외 조건으로 적용하지 않는다. 인증 #14, 좋아요 #15, 파일 #16, 검색·페이징 #17, 댓글 #18, TypeScript #20, 알림 #21은 관련 Issue와 공식 계약을 함께 확인한다. 완료 여부는 오래된 체크박스 대신 실제 Issue·PR·검증 결과로 판단한다.

`npm run build`, `npm run lint`가 현재 기본 명령이다. 자동 test 스크립트는 없다. 화면 변경 시 필요한 Backend와 개발 서버를 함께 실행하여 정상/실패/빈 상태·입력 검증·화면 이동을 확인하고 Network의 Payload/Response, Console 결과를 PR/devlog에 기록한다. 미실행과 해당 없음을 구분한다.
