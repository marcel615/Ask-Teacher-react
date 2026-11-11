# Ask Teacher Frontend

Ask Teacher는 사용자가 질문 게시글을 작성하고 조회할 수 있는 Q&A 기반 서비스입니다. 이 저장소는 Ask Teacher의 React 프론트엔드 프로젝트이며, Spring Boot 백엔드 API와 연동해 회원가입, 로그인, 게시글 CRUD, 카테고리 조회 흐름을 제공합니다.

- Frontend Repository: https://github.com/marcel615/Ask-Teacher-react
- Backend Repository: https://github.com/marcel615/Ask-Teacher

## 프로젝트 소개

Ask Teacher Frontend는 사용자가 브라우저에서 질문 게시글을 작성하고 관리할 수 있도록 만든 MVP 화면입니다. React Router로 주요 페이지를 연결하고, Axios 기반 API 모듈을 통해 백엔드의 게시글, 카테고리, 인증 API를 호출합니다.

현재 구현 범위는 게시글 목록/작성/상세/수정/삭제, 회원가입, 로그인, 카테고리 조회입니다. JWT 저장, 전역 로그인 상태 관리, 권한 기반 버튼 제어는 당시 MVP 범위에서 제외했습니다. 현재 공식 인증 계약과 기존 구현의 차이는 [PR #23](https://github.com/marcel615/Ask-Teacher-react/pull/23)에 기록했으며, 최신 Backend와의 연동 완료를 뜻하지 않습니다.

## 기술 스택

| 구분 | 기술 |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| API Client | Axios |
| Server State | React Query 5 |
| Forms | React Hook Form 7 |
| Language / Types | JavaScript·JSX / JSDoc·.d.ts (전체 TypeScript 전환 전) |
| Styling | CSS |
| Lint | ESLint |
| Backend | Spring Boot API |

## 주요 기능

- 게시글 목록 조회
- 게시글 상세 조회
- 게시글 작성
- 게시글 수정
- 게시글 삭제
- 게시글 작성/수정 시 카테고리 조회 및 선택
- 회원가입
- 로그인
- 페이지별 로딩/에러 상태 처리
- 게시글 제목/내용/카테고리 입력값 검증

## 화면 및 라우팅

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | HomePage | 게시글 목록 화면을 기본 화면으로 표시 |
| `/posts` | PostListPage | 게시글 목록 조회 |
| `/posts/create` | PostCreatePage | 게시글 작성 |
| `/posts/:postId` | PostDetailPage | 게시글 상세 조회, 수정/삭제 진입 |
| `/posts/:postId/edit` | PostEditPage | 게시글 수정 |
| `/login` | LoginPage | 로그인 |
| `/signup` | SignupPage | 회원가입 |

## 폴더 구조

```txt
src/
  api/
    api.js
    authApi.js
    postApi.js
    postCategoryApi.js
  component/
    Header.jsx
    PostForm.jsx
  routes/
    AppRouter.jsx
  utils/
    postValidation.js
  HomePage.jsx
  PostListPage.jsx
  PostCreatePage.jsx
  PostDetailPage.jsx
  PostEditPage.jsx
  LoginPage.jsx
  SignupPage.jsx
```

## API 연동 방식

공통 Axios 인스턴스는 `src/api/api.js`에서 관리합니다.

```js
const API_BASE_URL = 'http://localhost:8080/api'
```

API 기능은 도메인별 파일로 분리했습니다.

| 파일 | 역할 |
|---|---|
| `src/api/api.js` | 공통 Axios 인스턴스 |
| `src/api/postApi.js` | 게시글 목록/상세/작성/수정/삭제 API |
| `src/api/postCategoryApi.js` | 카테고리 목록 API |
| `src/api/authApi.js` | 회원가입/로그인 API |

현재 프론트 코드에는 과거 `ApiResponse` 계약에 따른 조회 `response.data.data`, 변경·인증 `response.data` 처리가 남아 있습니다. 공식 API 명세는 성공 DTO·목록 직접 반환과 본문 없는 성공 응답을 정의하므로, 이 차이를 신규 구현 규칙으로 사용하지 않습니다. 제품 코드 변경은 이번 문서 정비의 범위가 아닙니다.

공식 명세 원본은 `ai-dlc.yaml`의 활성 서비스 `requirements`, `contracts.api`, `contracts.erd`, `contracts.ui`와 각각의 `repository_role`을 따라 확인합니다.

## ERD

데이터 구조의 공식 원본은 설정의 `contracts.erd`가 지정한 ERD입니다. 이 저장소에는 원문을 복사하지 않고 작업별 요약과 원본 링크만 둡니다.

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 백엔드 서버 실행

프론트엔드는 기본적으로 아래 API 서버를 호출합니다.

```txt
http://localhost:8080/api
```

따라서 프론트 실행 전에 백엔드 프로젝트를 로컬에서 실행해야 합니다.

### 3. 프론트 개발 서버 실행

```bash
npm run dev
```

기본 접속 주소는 다음과 같습니다.

```txt
http://localhost:5173
```

### 4. 빌드

```bash
npm run build
```

### 5. 린트

```bash
npm run lint
```

## 검증 방법

- `npm run build`로 프로덕션 빌드가 통과하는지 확인합니다.
- `npm run lint`로 정적 검사를 확인합니다.
- React 개발 서버와 Spring Boot 서버를 함께 실행한 뒤 브라우저에서 주요 화면을 확인합니다.
- 브라우저 Network 탭에서 요청 URL, Request Payload, Response 구조가 설정의 `contracts.api`가 지정한 공식 API 명세와 일치하는지 확인합니다.
- Console 탭에 불필요한 에러가 없는지 확인합니다.

## AI-DLC 개발 워크플로우

사용자가 작업 시작을 지시하면 Main이 한 Issue를 선정하거나 지정된 Issue를 확인하고 품질 게이트를 거쳐 PR과 기록까지 진행합니다. 일반 파일·브랜치·commit·push·PR 단계에 사용자 재승인을 추가하지 않습니다.

| 역할 | 책임 |
|---|---|
| Main | Issue 선정·단계 조율·품질 게이트·외부 상태 확인·사용자 보고 |
| Architect | 설계와 current-task 반영, 구현의 독립 리뷰 |
| Builder | 승인된 범위 구현·검증·수정, 임시 작업 기록 |
| Reporter | Issue·PR·작업 기록과 검증 근거에 따른 월별 devlog |

1. Main이 설정된 `project.statuses.ready` 상태·우선순위·Blocked by·사용자 결정을 확인합니다.
2. Architect가 범위·완료 조건·검증 계획을 설계하고 Main의 설계 게이트 후 current-task에 반영합니다.
3. Builder가 설정된 작업 브랜치에서 구현·검증합니다. Main이 구현 게이트 후 설정된 Frontend 기준 브랜치 대상 PR을 생성합니다.
4. Architect가 독립 리뷰하고 Main이 PR 일반 리뷰로 등록합니다. Builder의 수정·재검증은 테스트·CI·필수 리뷰 문제에 최대 2회입니다. AI 리뷰는 필수 사람 리뷰를 대신하지 않습니다.
5. Reporter가 근거를 확인해 기록을 작성하고 Main 확인 후 월별 devlog에 append-only로 반영합니다.
6. Main이 마지막 push의 정확한 head에서 CI·필수 리뷰·보호조건·충돌·devlog를 확인한 후 사용자의 직접 merge를 기다립니다.
7. 사용자 merge 후 실제 merge·devlog·미반영 내용을 확인하고 설정된 기준 브랜치를 fast-forward로 최신화합니다. 확인된 이번 작업 브랜치만 안전하게 정리합니다.

불명확한 요구, 범위 확대, DB·인증/인가·비밀값·중요설정 변경, 위험 작업이나 필수 승인이 필요하면 해당 작업을 멈추고 확인합니다. 정해진 수정 한도 내 실패를 해결하지 못하거나 근거·권한을 확인할 수 없어도 중단·보고합니다.

- [ai-dlc.yaml](ai-dlc.yaml): 활성 서비스의 저장소, Project, 명세와 개발 설정
- [AGENTS.md](AGENTS.md), [유일한 개발 Skill](.agents/skills/issue-driven-dev/SKILL.md), [역할 설정](.codex/agents/)
- [현재 작업](docs/current-task.md), [임시 작업 기록](docs/current-work-log.md), [devlog](docs/devlog/), [빠른 지시문](docs/prompts/quick.md), [리뷰 기준](docs/review-checklist.md)
- 설정의 `project.url`이 가리키는 GitHub Project: 승인·우선순위·상태 기준은 Skill을 따릅니다. 실제 자동 상태 전환은 통합 검증 전까지 확인된 것으로 간주하지 않습니다.

별도 기능 탐색·백로그 Skill은 유지하지 않습니다. 개발 중 후보·기술 후속 작업과 사용자 지시의 승인된 백로그 전환 조건은 issue-driven-dev에 포함합니다. 현재 이 저장소에는 CI workflow가 없으며, 개별 실행에서 실제 검증·필수 조건을 확인해야 합니다.

## 트러블슈팅

개발 당시 실제로 기록한 문제와 해결 과정을 보존합니다. 아래 과거 응답 래퍼 설명은 현재 공식 API 계약이 아닙니다.

### 게시글 목록 응답 처리 오류

게시글 목록 조회 후 `postList.map is not a function` 에러가 발생했습니다. 백엔드 응답이 배열 자체가 아니라 공통 응답 객체인 `ApiResponse` 형태였기 때문입니다.

해결 방법:

- 백엔드 응답 구조를 확인했습니다.
- 목록/상세 조회처럼 실제 데이터만 필요한 API는 `response.data.data`를 반환하도록 API 모듈을 수정했습니다.

### 삭제 후 뒤로 가기 처리

게시글 삭제 성공 후 단순히 목록으로 이동하면 브라우저 뒤로 가기로 삭제된 상세 페이지에 다시 진입할 수 있었습니다.

해결 방법:

- 삭제 성공 후 `navigate('/posts', { replace: true })`를 사용했습니다.
- 삭제된 상세 페이지가 브라우저 히스토리에 남지 않도록 처리했습니다.

## 현재 제한 사항 및 향후 개선

- JWT 저장 및 인증 상태 유지
- 전역 로그인 상태 관리
- 권한 기반 수정/삭제 버튼 노출 제어
- 댓글 기능
- 검색 및 페이지네이션
- 좋아요 기능
- 파일 업로드
- 공통 UI 컴포넌트 정리
- API base URL 환경 변수 분리

## 배운 점

- 백엔드의 공통 응답 구조를 프론트 API 모듈에서 필요한 형태로 정리하는 방식
- React Router를 사용해 목록, 작성, 상세, 수정 화면을 연결하는 흐름
- 페이지 단위로 로딩, 에러, 제출 중 상태를 관리하는 방식
- 게시글 작성/수정에서 프론트 1차 검증과 백엔드 최종 검증의 역할을 분리하는 방식
- CRUD 요청 이후 사용자 흐름에 맞게 페이지를 이동시키는 방식
