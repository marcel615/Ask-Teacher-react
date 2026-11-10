# Current Task

## 요청과 승인 근거

- [Issue #22: Frontend AI-DLC 워크플로우 및 공식 명세 참조 개편](https://github.com/marcel615/Ask-Teacher-react/issues/22)
- 2026-11-10 사용자 요청에 따라 이번 문서·설정 정비와 develop 대상 단일 PR까지 진행한다. Main은 Issue #22의 선행 관계 없음·미결정 라벨 없음과 Project의 Ready 상태를 확인한 후 In Progress로 전환했다.
- 이전 Issue #13은 [PR #19](https://github.com/marcel615/Ask-Teacher-react/pull/19)의 merge(2026-06-10, `31efac3c9191d91ac73c64471e68e19e0f5e3b5f`)와 기존 2026-06 devlog 반영을 Main이 확인했다. 이전 current-task 원문은 [기준 커밋](https://github.com/marcel615/Ask-Teacher-react/blob/31efac3c9191d91ac73c64471e68e19e0f5e3b5f/docs/current-task.md)에서 확인한다.
- 한 번에 Issue #22만 진행하며 Main의 품질 게이트와 Backend의 일반 Issue 기반 절차를 따른다.

## 참조

- Backend develop: `61cd8c5e3cf9bc239e14cef7c5e0bb6dab632b1d`의 AGENTS, Skill, 역할 설정과 개발 문서.
- Specs main 확인 SHA: `3b30bbd23cad618a6a16b022dbd03c7f2d1fc69f`. 공식 원본: [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/requirements.md), [API 및 인증 계약](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/api-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/erd.md), [UI 명세](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/ui-spec.md).
- 차이·보존 근거: [PR #23](https://github.com/marcel615/Ask-Teacher-react/pull/23).

## 브랜치와 PR

- 기준: develop `31efac3c9191d91ac73c64471e68e19e0f5e3b5f`
- 작업: `feature/issue-22-ai-dlc-workflow`
- PR: `feature/issue-22-ai-dlc-workflow` → `develop`, 하나만 생성. Merge는 사용자 직접 수행.

## 범위

- Main·Architect·Builder·Reporter 역할, 순차 실행, 승인 경계, 품질 게이트, Project/후속 Issue, PR·독립 리뷰·Reporter 기록·최종 head 확인·merge 후 절차를 Backend와 일치시킨다.
- Java/Spring 구현·검증 기준을 현재 React 스택에 맞춘다.
- issue-driven-dev만 유지하고 제거 대상 Skill의 활성 참조를 없앤다. 필요한 접근·백로그 전환 조건은 유지하는 Skill에 포함한다.
- AGENTS, Skill, 역할 설정, README, 빠른 지시문, 리뷰 체크리스트, Issue·PR 템플릿의 공식 명세 참조를 네 문서로 통일한다.
- 공식 명세와 실제 코드를 기준으로 중복 문서를 정리하고 미해결 계약 차이와 과거 원본 링크는 PR에 보존한다.
- 임시 작업 기록과 이번 월 devlog를 작성한다. 기존 개발 이력과 이전 current-task 원문을 보존한다.

## 제외 범위

- 제품 코드, 의존성·lockfile, 테스트·CI 환경, Backend API/DB/인증/인가 변경
- Specs 원문 수정, 미결정 계약 확정, 기존 devlog 재작성
- 제품 Issue 개발·추가 생성, PR merge 및 merge 전 브랜치 삭제

## 완료 조건과 검증

- 공식 Specs 네 경로·링크와 문서 참조를 확인한다.
- Backend 절차와 대조해 기술 스택 및 사용자가 명시한 Skill 정리 차이만 남긴다.
- TOML 구문·필수 역할 필드, Skill frontmatter와 실행 절차를 검증한다.
- build/lint, git diff --check를 실행하고 실제 결과·미검증 사항을 기록한다.
- 제품 코드·기존 devlog·과거 current-task 보존을 diff로 확인한다.
- Architect 독립 리뷰 후 필요한 수정을 재검증하고 Reporter 기록을 반영한다.
- 최종 head의 CI·필수 리뷰·보호 조건·충돌 여부를 확인해 develop 대상 PR 링크와 남은 문제를 보고한다.

## 예상 변경 파일

- `AGENTS.md`, `README.md`, `.agents/skills/issue-driven-dev/SKILL.md`
- `.codex/agents/architect.toml`, `.codex/agents/builder.toml`, `.codex/agents/reporter.toml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`
- `docs/current-task.md`, `docs/current-work-log.md`, `docs/prompts/quick.md`, `docs/review-checklist.md`
- 삭제: `docs/frontend-development.md`, `docs/spec-migration-review.md`, `docs/requirements.md`, `docs/api-usage.md`, `docs/archive/issue-13-current-task.md`
- append-only: `docs/devlog/2026-11.md`
