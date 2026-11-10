# Current Task

## 연결 Issue

- Issue #13: [Feature] react: 프론트 API 구조 리팩토링
- URL: https://github.com/marcel615/Ask-Teacher-react/issues/13

## 작업명

React Query, React Hook Form, TypeScript 타입 기반 프론트 API 구조 리팩토링

## 작업 배경

현재 프론트 API 호출과 폼 상태 관리는 페이지별 로컬 상태와 직접 호출 흐름 중심으로 구성되어 있다.

Issue #13에서는 API 조회/변경 요청을 React Query 기준으로 일관화하고, 게시글 작성/수정 폼을 React Hook Form 기반으로 정리하며, 게시글 API 요청/응답 데이터를 TypeScript 타입으로 관리하도록 개선한다.

## 참조 설계

- 조회 API는 React Query `useQuery`로 처리한다.
- 게시글 작성/수정/삭제, 회원가입, 로그인 요청은 React Query `useMutation`으로 처리한다.
- 게시글 작성/수정/삭제 성공 후 관련 게시글 query를 갱신한다.
- 게시글 작성/수정 폼은 React Hook Form으로 입력값과 검증을 관리한다.
- 게시글 요청/응답 데이터는 TypeScript 타입 정의를 기반으로 관리한다.
- 기존 백엔드 API 원본 명세는 수정하지 않는다.

## 작업 브랜치

- 기준 브랜치: `develop`
- 작업 브랜치: `feature/issue-13-react-api-refactor`
- PR 방향: `feature/issue-13-react-api-refactor` -> `develop`

## 이번 PR에서 할 일

- [ ] React Query 기반 API 조회/변경 요청 구조 적용
- [ ] 게시글 목록 조회를 `useQuery`로 변경
- [ ] 게시글 상세 조회를 `useQuery`로 변경
- [ ] 게시글 작성/수정/삭제를 `useMutation`으로 변경
- [ ] 회원가입/로그인을 `useMutation`으로 변경
- [ ] 게시글 작성/수정 성공 후 게시글 목록/상세 query 갱신
- [ ] 게시글 삭제 성공 후 게시글 목록 query 갱신
- [ ] 게시글 작성/수정 폼을 React Hook Form 기반으로 변경
- [ ] 제목, 내용 등 필수 입력값 프론트 검증 유지
- [ ] 게시글 API 요청/응답 TypeScript 타입 정의 추가
- [ ] API 함수 반환 기준은 기존 문서 기준과 일치하도록 유지
- [ ] `docs/requirements.md`에 React Query / React Hook Form / TypeScript 타입 기준 반영
- [ ] `docs/api-usage.md`에 query key, mutation, invalidate, 타입 관리 기준 반영

## 이번 PR에서 하지 않을 일

- 백엔드 API 명세 원본 수정
- 백엔드 API, DB, 인증/인가 구조 변경
- JWT 저장, 전역 로그인 상태 관리, 권한 제어 구현
- 댓글, 검색, 페이징, 좋아요, 파일 업로드 구현
- 디자인 시스템 수준의 공통 UI 컴포넌트 도입
- Issue #13 범위를 벗어난 화면/기능 개선

## 완료 조건

- [ ] 게시글 목록 조회가 React Query `useQuery`로 동작한다.
- [ ] 게시글 상세 조회가 React Query `useQuery`로 동작한다.
- [ ] 게시글 작성/수정/삭제가 React Query `useMutation`으로 동작한다.
- [ ] 회원가입/로그인이 React Query `useMutation`으로 동작한다.
- [ ] 게시글 작성/수정/삭제 성공 후 관련 게시글 데이터가 갱신된다.
- [ ] 게시글 작성/수정 폼이 React Hook Form으로 입력값을 관리한다.
- [ ] 제목, 내용 등 필수 입력값 검증 실패 시 API 요청을 보내지 않는다.
- [ ] 게시글 API 요청/응답 타입이 TypeScript 타입으로 관리된다.
- [ ] `npm run build`가 성공한다.
- [ ] lint 명령이 있다면 `npm run lint`가 성공한다.
- [ ] 브라우저 수동 확인에서 주요 API 요청/응답과 Console 에러 여부를 확인한다.

## 확인 필요

- 인증 API 경로는 `POST /api/auth/signup`, `POST /api/auth/login` 기준으로 구현한다.

## 예상 변경 파일

### Architect 사전 반영 문서

- `docs/requirements.md`
- `docs/api-usage.md`
- `docs/current-task.md`

### Builder 구현 변경 예상 파일

#### Page

- `src/pages/PostListPage.*`
- `src/pages/PostDetailPage.*`
- `src/pages/PostCreatePage.*`
- `src/pages/PostEditPage.*`
- `src/pages/SignupPage.*`
- `src/pages/LoginPage.*`

#### Component

- `src/components/PostForm.*`

#### api

- `src/api/postApi.*`
- `src/api/authApi.*`
- `src/api/postCategoryApi.*`
- React Query 설정 파일 또는 query client 설정 위치

#### utils

- 게시글 validation 관련 파일
- 게시글 요청/응답 TypeScript 타입 정의 파일
- 공통 API 응답 TypeScript 타입 정의 파일

#### CSS

- 기존 페이지/폼 CSS 중 React Hook Form 에러 표시와 상태 표시 변경에 필요한 파일

#### 기타

- `package.json`
- `package-lock.json` 또는 사용 중인 lockfile
- 앱 루트의 React Query Provider 설정 파일
