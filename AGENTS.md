# AGENTS.md

## 핵심 규칙

- 사용자는 PM이자 최종 승인자다.
- 한 번에 하나의 Issue만 진행한다.
- 구현 기준은 `docs/current-task.md`다.
- `docs/current-task.md` 범위 밖은 구현하지 않는다.
- 파일 수정, 브랜치 생성/이동, git add/commit/push, PR 생성, 삭제, 백엔드 API/DB/인증/인가 변경은 사용자 승인 후 진행한다.

## 브랜치

- 기준 브랜치: `develop`
- 작업 브랜치: `feature/issue-번호-작업명`
- PR 방향: `feature/*` → `develop`
- `main`, `master`, `develop`에서 직접 구현하지 않는다.

## 참고 문서

- 상세 워크플로우: `.agents/skills/issue-driven-dev/SKILL.md`
- 빠른 지시문: `prompts/quick.md`
- 요구사항: `docs/requirements.md`
- API 사용 정리: `docs/api-usage.md`
- 현재 작업 범위: `docs/current-task.md`
- 리뷰 기준: `docs/review-checklist.md`
- 작업 기록: `docs/devlog/YYYY-MM.md`
- PR 템플릿: `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`

## 검증

기본 검증은 가능한 범위에서 아래 명령을 사용한다.

```bash
npm run build
```

프로젝트에 lint 명령이 있다면 함께 확인한다.

```bash
npm run lint
```

## 수동 확인

- React 개발 서버와 Spring Boot 서버를 함께 실행한 상태에서 확인한다.
- 기본 확인 주소는 React 개발 서버 기준 `http://localhost:5173`이다.
- API 요청은 브라우저 Network 탭에서 확인한다.
- Console에 불필요한 에러가 없는지 확인한다.
- Request Payload와 Response가 백엔드 DTO/API 응답 구조와 일치하는지 확인한다.
- 수동 확인 결과는 PR 요약 또는 devlog에 기록한다.


## Global Codex Guidelines

These guidelines reduce common LLM coding mistakes. Prefer caution over speed.

### 1. Think Before Coding

Before implementing:

- State assumptions explicitly.
- If requirements are unclear, ask or clearly name the uncertainty.
- If multiple interpretations exist, present them instead of silently choosing one.
- If a simpler approach exists, prefer it.
- Push back when the requested solution seems overcomplicated or risky.

### 2. Simplicity First

Implement the minimum code that solves the task.

- Do not add features beyond the request.
- Do not create abstractions for single-use code.
- Do not add configurability or flexibility that was not requested.
- Do not over-engineer error handling for unrealistic scenarios.
- If the solution becomes much larger than necessary, simplify it.

### 3. Surgical Changes

Touch only what is required.

- Do not refactor unrelated code.
- Do not improve adjacent formatting, comments, or structure unless required.
- Match the existing project style.
- If unrelated dead code or problems are found, mention them instead of changing them.
- Remove only unused imports, variables, or functions introduced by your own changes.

Every changed line should directly support the requested task.

### 4. Goal-Driven Execution

Turn the task into verifiable goals.

For multi-step tasks:

1. State a brief plan.
2. Define success criteria.
3. Implement the smallest necessary change.
4. Verify with build commands, browser checks, Network tab, or manual checks.
5. Report changed files and verification results.

Examples:

- "Add validation" → test invalid inputs and make them fail correctly.
- "Fix a bug" → reproduce the bug, fix it, then verify the fix.
- "Refactor" → ensure behavior is unchanged before and after.

### 5. Final Response

After implementation, summarize:

- What changed
- Files changed
- How it was verified
- Remaining TODOs or assumptions