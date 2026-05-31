# Quick Prompts

## 0. 에이전트 시작

### Architect

```text
너는 Architect Codex야.
AGENTS.md와 docs/prompts/quick.md만 먼저 읽고 기준으로 작업해줘.

시작 단계에서는 다른 프로젝트 파일을 읽지 마.
Issue나 리뷰 대상이 주어지면 그때 필요한 문서/코드만 좁혀서 읽어.

GitHub Issue 분석, current-task 정리, PR 리뷰, devlog 초안 작성 중심으로 진행해.
승인 전 파일 수정, 브랜치 변경, git 명령은 하지 마.
```

### Builder

```text
너는 Builder Codex야.
AGENTS.md와 docs/prompts/quick.md만 먼저 읽고 기준으로 작업해줘.

시작 단계에서는 다른 프로젝트 파일을 읽지 마.
docs/current-task.md 승인 후 필요한 문서/코드만 좁혀서 읽어.

React 구현, API 연결, 상태 처리, CSS 적용, 수동 테스트 중심으로 진행해.
승인 전 파일 수정, 브랜치 변경, git 명령은 하지 마.
```

### Reporter

```text
너는 Reporter Codex야.
AGENTS.md와 docs/prompts/quick.md만 먼저 읽고 기준으로 작업해줘.

시작 단계에서는 다른 프로젝트 파일을 읽지 마.
Issue/PR/devlog 대상이 주어지면 그때 필요한 문서만 좁혀서 읽어.

기록, 요약, devlog, README/포트폴리오 초안 작성 중심으로 진행해.
승인 전 파일 수정은 하지 마.
```

---

## 1. Issue → current-task

```text
Issue #번호 작업하자.

gh issue view 번호 --json title,body,labels,state,url 로 조회하고,
아래 순서로 초안을 작성해줘.

1. 이 Issue가 docs/requirements.md 변경을 필요로 하는지 판단
2. 이 Issue가 docs/api-usage.md 변경을 필요로 하는지 판단
3. 필요한 문서 수정안 초안 작성
4. docs/current-task.md 초안 작성

current-task.md 초안에는 다음을 포함해줘.

- 연결 Issue
- 작업명
- 작업 배경
- 참조 설계
- 작업 브랜치
- 이번 PR에서 할 일
- 이번 PR에서 하지 않을 일
- 완료 조건
- 예상 변경 파일

예상 변경 파일은 아래처럼 구분해줘.

- Architect 사전 반영 문서
- Builder 구현 변경 예상 파일
  - Page
  - Component
  - api
  - utils
  - CSS
  - 기타

백엔드 API 명세 원본이나 ERD를 프론트 프로젝트에서 직접 수정하지 마.
백엔드 API/DB/인증 구조 변경이 필요하면 작업을 멈추고 보고해.

아직 파일은 수정하지 마.
내가 승인하면 필요한 문서와 current-task.md에 반영해.
```

---

## 2. current-task 승인

```text
current-task.md 초안 승인.
docs/current-task.md에 반영해줘.

승인된 requirements.md 또는 api-usage.md 수정안이 있다면 함께 반영해줘.
아직 구현은 시작하지 마.
```

---

## 3. 구현 계획 + 브랜치 제안

```text
docs/current-task.md 기준으로 구현 계획 세우자.

먼저 아래 명령만 확인해.

git status
git branch --show-current
git remote -v

develop 최신화와 feature 브랜치 생성 계획을 제안해줘.

git status에서 변경된 문서가 보이면,
docs/current-task.md의 `예상 변경 파일 > Architect 사전 반영 문서`에 포함된 파일인지 확인해줘.

포함되어 있다면 이번 Issue의 승인된 사전 문서 변경으로 간주하고,
feature 브랜치에 함께 가져갈 계획을 세워줘.

구현 계획에는 아래 항목을 포함해줘.

- 변경할 Route
- 변경할 Page 컴포넌트
- 변경할 공통 Component
- 추가/수정할 API 함수
- 필요한 state
- useEffect 사용 여부
- form validation 여부
- loading / error / empty 처리 방향
- CSS 변경 예상
- 수동 테스트 계획

아직 파일 수정, 브랜치 이동, 브랜치 생성은 하지 마.
```

---

## 4. 구현 승인

```text
브랜치 생성과 구현 계획 승인.

develop을 최신화하고 제안한 feature 브랜치에서 구현해줘.
승인된 Architect 사전 반영 문서 변경은 되돌리지 말고,
생성한 feature 브랜치에서 그대로 유지한 상태로 구현을 진행해줘.

구현 시 아래 기준을 지켜줘.

- docs/current-task.md 범위 안에서만 작업
- 조회 API는 useEffect에서 호출
- POST / PATCH / DELETE는 useEffect에서 자동 실행하지 않기
- 사용자 액션은 handleSubmit, onClick 등 이벤트 핸들러에서 처리
- API 함수는 src/api 하위 파일에 분리
- 조회 API는 보통 response.data.data 반환
- 작성/수정/삭제 API는 보통 response.data 반환
- 에러 메시지는 error.response?.data?.message 우선 사용
- 서버 응답이 없으면 기본 에러 메시지 사용
- form 검증 실패 시 API 요청 중단
- 검증 실패 또는 서버 에러 시 작성 중인 입력값 유지
- CSS className은 역할 기준으로 작성
- 사용하지 않는 import와 불필요한 console.log 제거

구현 후 가능한 범위에서 아래를 확인해줘.

- npm run build
- npm run lint가 있다면 실행
- 브라우저 수동 테스트
- Network 탭 Request Payload / Response 확인
- Console 에러 확인
- 변경 파일 목록
- git diff 요약
- PR 초안

아직 git add, commit, push, PR 생성은 하지 마.
```

---

## 5. PR 준비

```text
PR 준비하자.

feature/* → develop 방향으로 PR 본문과 커밋 메시지를 제안해줘.

PR 본문은 `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md` 템플릿 형식을 기준으로 작성해줘.
템플릿 항목을 임의로 새로 만들지 말고, 기존 PR 템플릿의 섹션을 유지해줘.

테스트 결과와 체크리스트는 실제로 확인한 항목만 체크하고,
확인하지 못한 항목은 체크하지 말고 사유를 적어줘.

커밋 메시지는 Conventional Commit 형식으로 제안해줘.

아직 git add, commit, push, gh pr create는 하지 마.
```

---


## 6. PR 생성 승인

```text
PR 본문과 커밋 메시지 승인.

최종 명령어 목록을 먼저 보여준 뒤, 승인된 PR 본문을 사용해서
feature 브랜치 push와 develop 대상 PR 생성을 진행해줘.

PR 생성 후 PR URL을 알려줘.
```

---

## 7. PR 리뷰

```text
docs/ai/review-checklist.md 기준으로 현재 PR을 리뷰해줘.

파일은 수정하지 말고 아래 형식으로 나눠줘.

1. 반드시 수정
2. 선택 개선
3. 통과 항목

각 항목에는 근거가 되는 파일명 또는 코드 위치를 함께 적어줘.
```

---

## 8. 리뷰 반영 판단

```text
Architect 리뷰를 검토해줘.

각 항목을 아래 기준으로 분류해줘.

1. 필수 수정
2. 선택 개선
3. 보류 가능

각 항목마다 이유를 짧게 적어줘.
아직 파일은 수정하지 마.
```

---

## 9. 리뷰 반영 승인

```text
리뷰 반영 승인.

필수 수정 항목을 먼저 반영하고,
선택 개선 항목 중 승인된 항목만 반영해줘.

수정 후 아래 내용을 보여줘.

- 변경 파일
- 수정 요약
- 수동 확인 결과
- git diff 요약

아직 git add, commit, push는 하지 마.
```

---

## 10. devlog 초안

```text
이번 Issue와 PR 기준으로 docs/devlog/YYYY-MM.md에 추가할 기록 초안을 작성해줘.

규칙:
- 기존 devlog 전체를 재작성하지 마.
- 기존 기록은 수정하지 마.
- 현재 Issue/PR에 대한 기록만 새 항목으로 추가해.
- 형식이 필요하면 가장 최근 항목 하나만 참고해.
- 파일 맨 아래에 append-only로 추가하는 기준으로 작성해.

devlog에는 아래 항목을 포함해줘.

- Issue / PR
- 오늘의 작업
- 변경 내용
- 수동 확인 결과
- 문제 / 해결
- AI 활용 기록
- 다음 작업 후보

아직 파일은 수정하지 마.
```

---

## 11. devlog 반영 승인

```text
devlog 초안 승인.

docs/devlog/YYYY-MM.md 맨 아래에 추가해줘.
기존 기록은 수정하지 마.
```

---

## 12. 작업 중단 / 확인 요청

```text
현재 작업을 잠시 멈추고 상태를 정리해줘.

아래 항목을 기준으로 보고해줘.

- 현재 브랜치
- git status
- 지금까지 변경한 파일
- 완료한 작업
- 남은 작업
- 확인이 필요한 문제
- 다음에 실행할 명령 또는 작업 제안

파일 수정이나 git 명령은 추가로 실행하지 마.
```
