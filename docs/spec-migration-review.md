# AI-DLC 및 명세 참조 전환 검토

## 확인 출처

- Backend [develop 기준](https://github.com/marcel615/Ask-Teacher/tree/61cd8c5e3cf9bc239e14cef7c5e0bb6dab632b1d): AGENTS.md, issue-driven-dev, 세 역할 설정, README, 빠른 지시문, 리뷰 체크리스트, PR 템플릿과 백로그 전환 조건을 확인했다.
- Specs [main 확인 commit](https://github.com/marcel615/Ask-Teacher-specs/tree/3b30bbd23cad618a6a16b022dbd03c7f2d1fc69f): [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/requirements.md), [API 및 인증 계약](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/api-spec.md), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/erd.md), [UI 명세](https://github.com/marcel615/Ask-Teacher-specs/blob/main/docs/ui-spec.md). 활성 문서는 main 링크를 사용하고 이 SHA는 비교 근거로 남긴다.
- Frontend 원본 [requirements](https://github.com/marcel615/Ask-Teacher-react/blob/31efac3c9191d91ac73c64471e68e19e0f5e3b5f/docs/requirements.md), [api-usage](https://github.com/marcel615/Ask-Teacher-react/blob/31efac3c9191d91ac73c64471e68e19e0f5e3b5f/docs/api-usage.md), 제품 코드와 Issue #1~5, #13~18, #20~21을 대조했다.

## 정보 보존과 삭제 판단

| 기존 정보 | 참조 전환·보존 위치 | 판단 |
|---|---|---|
| CRUD·카테고리·회원가입 검증 등 공통 기능 | Specs requirements·api-spec | 공식 원본 참조 |
| 화면 경로·구성·로딩/실패/빈 상태·입력 유지·성공 이동·삭제 확인·new 표시 | Specs ui-spec와 기존 Issue #1~5 | 사용자 동작 보존 확인 |
| API 함수명·사용 화면·Axios 설정 | frontend-development | Frontend 고유 정보 보존 |
| useQuery/useMutation·키·invalidate·삭제 상세 캐시 제거 | frontend-development 및 Issue #13/PR #19·기존 devlog | 현재 구현과 대조 |
| React Hook Form·JSDoc/.d.ts | frontend-development 및 Issue #13·#20 | 전체 TypeScript 전환과 구분 |
| 과거 MVP 제외 범위·로컬 상태/useEffect 규칙·완료 체크박스 | 기존 두 원문, 과거 Issue·devlog | 당시 이력으로 보존; 현재 정책으로 사용하지 않음 |
| 이전 current-task #13 | archive/issue-13-current-task.md | 원문 그대로 보존 |
| 미해결 API·인증 충돌 | 아래 표 및 기존 두 원문 | 삭제·계약 확정 보류 |

기존 두 문서에는 아래 미해결 충돌이 있으므로 `docs/requirements.md`와 `docs/api-usage.md` 전체 삭제를 보류한다. 상단에 보존용 안내만 추가하고 원문은 유지했다. 활성 개발 지침은 공식 Specs와 Frontend 개발 안내로 전환했다. 유효 정보가 보존되었다는 사실은 계약 충돌이 해결되었다는 뜻이 아니다. 충돌 해소·이전 검증 후 중복 원문을 삭제할 수 있다. 이번 범위에서 삭제 가능한 별도 무충돌 중복 파일은 확인되지 않았다.

## 미해결 차이와 필요한 판단

| 항목 | 기존 문서·현재 코드 | Specs / 관련 Issue | 상태·다음 판단 |
|---|---|---|---|
| 성공 응답 | ApiResponse와 조회 response.data.data; 인증·변경 response.data | api-spec은 DTO/목록 직접 반환, 데이터 없는 성공은 본문 없음 | API 모듈·타입·화면 오류 처리 호환성은 별도 제품 작업에서 확인 |
| 게시글 작성·수정 | userId 포함 JSON 예시와 현재 고정 userId | 인증 사용자를 사용하며 multipart/form-data·첨부파일 계약; #14·#16 | 문서 정비에서 계약이나 코드를 임의 변경하지 않음 |
| 게시글 삭제 | 200 OK와 성공 메시지 응답 | 204 No Content; 과거 #2는 200 예시 | 성공 처리·메시지 사용과 타입 검증 필요 |
| 로그인·인증 | 사용자 정보 응답·토큰 미저장 MVP, #4의 임시 성공 알림 | Access Token·Refresh HttpOnly 쿠키·CSRF·세션 정책; #14 | #14의 당시 제안과 현재 계약 재검토 필요 |
| 내 정보·작성자 식별 | #14는 GET /api/users/me, 상세 writerId와 Zustand를 제안 | 확인한 api-spec에 users/me API 없고 게시글 상세 예시에 writerId 없음 | 필요한 계약/정책·상태 관리 선택을 PM·관련 Issue에서 결정. 댓글의 writerId와 혼동하지 않음 |
| 목록 구조 | 배열 전제 | 공식 예시는 content와 페이지 정보; #17은 posts라는 필드 제안 | 필드 차이·페이징 연결은 #17에서 확인 |
| 상세 표시 필드 | writerNickname 등 과거 정보·예시 | 공식 상세 예시는 userName·categoryName·files 등 | 사용 필드와 타입은 해당 제품 작업에서 확인 |
| 완료 상태 | 상세/수정/삭제/인증이 예정으로 남은 체크박스 | #13 PR #19 merge와 기존 devlog에 구현 기록 | 체크박스를 새 완료 사실로 확정하지 않음 |
| 향후 UI | 검색·좋아요·파일·댓글·알림 등 | ui-spec은 관련 기능 Issue에서 세부 동작 확정; #15~18·#21 | 이번 문서 정비로 기능 요구를 추가 확정하지 않음 |

API·인증 정책의 공식 원본 자체를 수정하거나 이 차이를 해결했다고 보고하지 않는다. 현재 저장소가 최신 Backend와 제품 연동 검증을 마쳤다는 의미도 아니다.

## Backend 절차 대조

| 기준 | Frontend 반영 | 남은 차이 |
|---|---|---|
| Main 조율, Architect→Builder→Architect 리뷰→Reporter 순차 | AGENTS·Skill·세 역할 TOML | 없음; Main은 Backend처럼 별도 TOML 없이 최상위 지침에서 정의 |
| 작업 시작 지시 후 Main 설계/구현/리뷰/머지 준비 게이트 | 같은 승인 경계; 일반 파일·git·PR 단계에 사용자 재승인 추가하지 않음 | 없음 |
| 불명확·범위 확대·DB/인증·비밀값·중요설정·위험작업/필수승인 | 동일 중단·확인 조건 | 없음 |
| Ready 선정·Blocked by·우선순위·사용자 결정·Project 상태 | 동일 조건 및 CLI 접근 대안 | 없음 |
| 기술 후속 Issue·Pending Draft·Approved 백로그 전환 조건 | 기존 절차와 최대 2개 전환·재조회·중복/권한 검증을 유지 Skill에 포함 | 사용자 지시로 별도 두 Skill을 유지하지 않음; 현재 FE에는 원래 파일이 없어 삭제 파일 없음 |
| 구현·통합 검증 | build/lint, API·Page·Component 및 필요한 화면/Network/Console 확인, 격리된 테스트 데이터 | Java/Gradle·계층 테스트를 실제 React 도구·흐름으로 대체 |
| PR 생성 후 독립 리뷰·일반 리뷰 등록·최대 2회 수정 | 동일 | 없음; AI 리뷰는 필수 사람 리뷰 대체 안 함 |
| Reporter 근거 확인·월별 append-only 기록 | 동일 | 없음; 기존 이력 변경 금지 |
| 마지막 push 정확한 head의 CI·필수 리뷰·보호조건·충돌·devlog | 동일 | 현재 FE에는 CI workflow·develop 보호·ruleset이 없는 것으로 Main 확인; CI 성공으로 표현하지 않음 |
| 사용자 직접 merge 후 develop fast-forward·검증된 작업 브랜치만 정리 | 동일 | 없음 |

이번 문서·설정 정비는 [Issue #22](https://github.com/marcel615/Ask-Teacher-react/issues/22)로 추적한다. Main은 Project의 Ready와 선행 관계 없음·미결정 라벨 없음을 확인한 뒤 In Progress로 전환했으며 `feature/issue-22-ai-dlc-workflow`에서 일반 절차로 진행한다. 이전 #13 종료·devlog 반영과 원문 보존을 확인했다. 추가 승인이나 절차 생략은 도입하지 않는다.
