---
name: issue-driven-dev
description: GitHub Issue 기반 React 프론트엔드 개발 워크플로우가 필요할 때 사용한다. Issue를 current-task.md로 정리하고, develop에서 feature 브랜치를 생성해 화면/API 연결/상태 처리/CSS/수동 테스트/PR/리뷰/devlog까지 진행하는 작업에 사용한다.
---

# Issue-driven Development Skill

## 역할

- Architect: Issue 분석, 문서 변경 필요 여부 판단, current-task.md 초안, PR 리뷰, devlog 초안
- Builder: 승인된 범위 안에서 React 구현, API 연결, 상태 처리, CSS 적용, 수동 테스트, PR 준비
- Reporter: README / 포트폴리오 / devlog 기록 정리

## 핵심 원칙

- Issue는 GitHub의 작업 요청 원본이다.
- 구현 기준은 `docs/current-task.md`다.
- 프론트 요구사항은 `docs/requirements.md`에 둔다.
- 프론트 API 사용 기준은 `docs/api-usage.md`에 둔다.
- 리뷰 기준은 `docs/review-checklist.md`에 둔다.
- devlog는 `docs/devlog/YYYY-MM.md`에 월별로 누적한다.
- 백엔드 API 명세 원본은 백엔드 프로젝트 문서를 기준으로 한다.
- 프론트에서는 API 사용 위치, API 함수명, 응답 처리 기준만 관리한다.
- 구현은 `develop`에서 생성한 `feature/*` 브랜치에서 진행한다.
- PR 방향은 `feature/*` → `develop`이다.
- 승인 전 파일 수정, 브랜치 변경, git add/commit/push, PR 생성을 하지 않는다.

## 기본 흐름

1. Issue를 조회한다.

```bash
gh issue view ISSUE_NUMBER --json title,body,labels,state,url
```

2. Architect가 Issue를 분석한다.

- `requirements.md` 변경 필요 여부 확인
- `api-usage.md` 변경 필요 여부 확인
- `current-task.md` 초안 작성
- 백엔드 API / DB / 인증 변경이 필요하면 사용자에게 보고

3. 사용자 승인 후 문서와 `current-task.md`에 반영한다.

4. Builder가 구현 계획과 브랜치 계획을 제안한다.

- 변경할 Route
- 변경할 Page / Component
- 추가/수정할 API 함수
- 필요한 state
- useEffect 사용 여부
- form validation 여부
- loading / error / empty 처리
- CSS 변경
- 수동 테스트 계획

5. 사용자 승인 후 feature 브랜치를 생성한다.

```bash
git status
git fetch origin
git checkout develop
git pull origin develop
git checkout -b feature/issue-번호-작업명
```

6. Builder는 `current-task.md` 범위 안에서만 구현한다.

7. 구현 후 검증한다.

```bash
npm run build
```

프로젝트에 lint 명령이 있으면 함께 확인한다.

```bash
npm run lint
```

8. 브라우저에서 수동 테스트한다.

- 화면 진입
- API 요청 성공/실패
- Request Payload
- Response
- 입력값 검증
- 로딩/에러/빈 데이터 상태
- 성공 후 이동
- Console 에러 여부

9. 변경 파일, 검증 결과, 수동 테스트 결과, git diff, PR 초안을 요약한다.

10. 사용자 승인 후 PR을 생성한다.

11. Architect가 `review-checklist.md` 기준으로 리뷰한다.

12. Reporter 또는 Architect가 `devlog/YYYY-MM.md`에 추가할 기록 초안을 작성한다.

## React 구현 기준

- 조회 API는 `useEffect`에서 호출한다.
- POST / PATCH / DELETE는 `useEffect`에서 자동 실행하지 않는다.
- 사용자 액션은 `handleSubmit`, `onClick` 등 이벤트 핸들러에서 처리한다.
- API 함수는 `src/api` 하위 파일에 분리한다.
- 조회 API는 보통 `response.data.data`를 반환한다.
- 작성/수정/삭제 API는 보통 `response.data`를 반환한다.
- 에러 메시지는 `error.response?.data?.message`를 우선 사용한다.
- 서버 응답이 없으면 기본 에러 메시지를 사용한다.
- form 검증 실패 시 API 요청을 보내지 않는다.
- 검증 실패 또는 서버 에러 시 작성 중인 입력값을 유지한다.
- 사용하지 않는 import와 불필요한 console.log는 제거한다.

## 중단 조건

아래 상황이면 작업을 멈추고 사용자에게 보고한다.

- `git status`가 clean하지 않음
- pull 중 충돌 발생
- `current-task.md` 범위를 벗어난 변경 필요
- 백엔드 API 명세 변경 필요
- DB 구조 또는 인증/인가 구조 변경 필요
- 전역 상태 관리 도입 필요
- 삭제, reset, clean 등 위험 명령 필요
- 빌드 실패 또는 핵심 수동 테스트 실패