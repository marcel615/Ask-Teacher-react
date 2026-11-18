# 현재 작업: ASK-14 프론트엔드 인증 연동 및 로그인 상태 관리

## 승인과 작업 기준

- 작업: [ASK-14](https://marcel615.atlassian.net/browse/ASK-14). 사용자의 2026-11-18 18:14 KST `착수 가능` 전환과 이번 프론트 작업 시작 요청을 근거로 Main이 `진행 중` 전환·재조회를 완료했다.
- Frontend `marcel615/Ask-Teacher-react`, 기준 브랜치 `develop`, 시작 SHA `e506e3d5bb7a9569564e9cb82dbc583f0b2c114e`, 작업 브랜치 `feature/issue-14-frontend-auth`.
- Main이 Architect 설계 게이트와 Builder 구현 계획을 승인했다. 한 Task만 진행하며 PR merge는 사용자가 직접 한다.
- 사용자는 같은 대화에서 환경·외부 의존성에 따른 미검증을 PR 본문에 공개하고 가능한 작업을 마무리하는 새 기준의 적용과 Frontend 후속 작업 완료를 명시적으로 승인했다. 운영 기준 변경은 [공통 운영 PR #5](https://github.com/marcel615/ai-dlc/pull/5), head `8582328`, base `main`에 제안됐으며 현재 미병합이다. 이 작업에서 새 기준을 적용하는 근거는 해당 사용자 승인이고, PR 생성 자체를 운영 원본의 병합으로 간주하지 않는다.
- 이전 작업 기록은 기존 `docs/devlog/2026-11.md`에 유지한다. 이전 [설계](https://github.com/marcel615/Ask-Teacher-react/blob/e506e3d5bb7a9569564e9cb82dbc583f0b2c114e/docs/current-task.md)와 [작업 기록](https://github.com/marcel615/Ask-Teacher-react/blob/e506e3d5bb7a9569564e9cb82dbc583f0b2c114e/docs/current-work-log.md)은 시작 커밋에 보존된다.

## 공식 원본과 결정

Specs `main` 조회 SHA는 `bb06abd9d2557a37ca19ae1bde3bc1b23f878357`이다. 공식 원본은 읽기 전용으로 참조하며 구현 저장소에는 관련 요약과 링크만 둔다.

- [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/requirements.md)
- [API](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/openapi.yaml)
- [인증 정책](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/auth-policy.md)
- [UI](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/ui-spec.md)
- [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/bb06abd9d2557a37ca19ae1bde3bc1b23f878357/docs/schema.dbml)

Main은 [Specs PR #12](https://github.com/marcel615/Ask-Teacher-specs/pull/12)의 실제 main 병합과 merge commit `7e0fa2e787a9ecaaa2b7d63ed60983d0d113a017`을 확인했다. 작성자 표시 계약의 선행 조건은 충족됐다. ASK-14 최신 재상세화 절에 기록된 사용자 결정을 적용하며 이전 계약 미반영 문구는 과거 이력으로 취급한다.

- Access Token은 메모리, Refresh Token은 공식 HttpOnly 쿠키로 관리한다. 새로고침 복구와 자동 재발급·탭 간 조정을 포함한다.
- 로그인 성공 시 `/posts`로 이동한다. 비로그인 헤더에는 로그인·회원가입, 인증된 헤더에는 로그아웃을 표시한다.
- 작성·수정 입력은 같은 탭 메모리에서만 보존한다. 동일 계정이 확인될 때만 복원하고, 다른 계정·식별 불가·성공한 제출·명시적 로그아웃에서는 폐기한다. 새로고침·탭 종료 시 소멸한다. 비밀번호·토큰은 입력 보존 대상이 아니다.
- 인증 API의 명확한 CSRF 403은 CSRF 재획득과 오류·수동 재시도를 제공하며 원래 요청을 자동 반복하지 않는다. 재발급 응답 유실은 재로그인으로 처리한다.

## 구현 범위와 설계

1. 인증 상태를 초기 확인 중·인증됨·비로그인·인증 장애로 구분한다. 인증 API와 메모리 세션 모듈, React 구독 및 보호 화면 처리를 분리한다. 로그인·로그아웃은 `useMutation`과 사용자 이벤트로 실행하고 초기 복구 및 401 복구는 진행 중 Promise를 공유한다.
2. CSRF credential 획득과 공식 헤더 전송을 구현한다. 로그인·재발급·로그아웃 성공 후 CSRF를 다시 획득한다. HttpOnly 쿠키를 자바스크립트로 읽지 않는다.
3. 한 탭의 동시 실패는 같은 재발급 결과를 공유한다. Web Locks로 CSRF 획득을 포함한 로그인·재발급·로그아웃 쿠키 변경을 직렬화하고 BroadcastChannel로 인증 변경을 알린다. 지연 메시지는 인증 세대로 구분한다. 조정에 필요한 비밀이 아닌 메타데이터 외에 토큰·작성 내용은 영속 저장하지 않는다. 조정 불가·실패·회전 결과 불명은 자동 재발급을 중단하고 재로그인을 안내한다.
4. 인증 API의 401·CSRF 403·503·응답 유실을 구분한다. 503은 장애 및 명시적 재시도로 유지한다. 로그아웃 204는 이미 만료된 경우도 성공이며 실패·응답 유실은 완료로 단정하지 않는다. 401 복구 후 원요청은 최대 한 번 재시도하고 계정·세션이 바뀌면 이전 요청을 재실행하지 않는다.
5. 공개 상세 401은 세션 복구를 적용하고 인증 거부·응답 유실 시 재로그인 안내 후 인증 없이 상세를 다시 조회한다. 공개 상세를 로그인 화면으로 강제 이동하지 않는다. 503은 장애·재시도, 404는 없는 게시글 오류로 구분한다. 보호 화면은 초기 확인 동안 대기하고 확실한 비로그인·만료에서 안내 후 로그인 화면으로 이동한다.
6. 현재 인증 상태의 상세 성공 응답에서 `isAuthor === true`일 때만 수정·삭제를 표시한다. false·누락·조회 중·오류에는 숨긴다. 직접 수정 URL도 현재 상세 결과로 확인하며 서버 인가를 최종 기준으로 유지한다. 닉네임이나 고정 ID로 작성자를 추론하지 않는다.
7. 상세 query key와 응답 처리에 인증 세대를 적용하고 AbortSignal을 전달한다. 로그인·로그아웃·계정 전환 시 이전 개인화 상세 요청·캐시를 정리하고 재조회한다. 이전 인증 응답과 mutation 콜백이 토큰·캐시·화면 이동을 되돌리지 못하게 한다.
8. 서버 성공 응답의 JWT subject는 공식 정책의 사용자 ID로서 입력 분리에만 사용한다. 식별 실패 시 복원하지 않으며 인가·작성자 판단에 사용하지 않는다. 수정 폼은 초기값·복원값의 적용을 구분해 재조회가 작성 중 입력을 덮어쓰지 않도록 한다.
9. 관련 응답을 공식 flat 형식으로 정리한다. 게시글 목록은 응답 `content`, 상세·카테고리는 응답 본문을 사용하고 로그인 타입은 `accessToken/tokenType/expiresIn`으로 맞춘다. 작성·수정은 `FormData`의 categoryId/title/content와 Bearer로 요청하며 고정 userId를 제거한다. multipart boundary는 브라우저가 설정한다.

## 제외와 보류

- 공식 요구사항·API·인증·ERD·UI 및 AI-DLC 운영 파일, Backend 제품 코드는 수정하지 않는다. 현재 설계에는 공식 계약 변경이 필요하지 않다.
- 소셜 로그인, 댓글·좋아요 신규 기능, 첨부파일 UI, 검색·페이징 UI 및 회원가입 개편은 제외한다. 운영 배포는 필수 완료 조건이 아니다.
- [ASK-16](https://marcel615.atlassian.net/browse/ASK-16)의 실제 Backend 제공과 로컬 연동 환경은 아직 완료되지 않았다. 실제 Backend 연동, Chrome 화면·Network·Console 및 React 경계에서의 쿼리 취소는 미검증으로 유지한다. 실행 가능한 검증과 확인된 필수 수정을 마치면 commit·push·PR 생성·독립 리뷰·수정·devlog 반영을 진행하고, PR 준비와 머지 준비를 구분한다. 이 미검증을 이유로 가능한 PR 작업 전체를 보류하지 않는다.
- `isAuthor` 누락 호환과 모의 응답은 실제 필수 불리언 및 `Cache-Control: no-store` 제공 검증을 대신하지 않는다. 미검증의 내용·이유·예상 영향과 위험·후속 검증 방법·필요 환경과 선행 작업·머지 전 필수 여부·재개 조건을 PR 본문에 남기고 작업 기록에는 요약과 PR 링크를 둔다. 머지 전 필수 검증이 남은 동안 머지 준비는 보류한다. 확인된 버그·테스트 실패·필수 지적·권한 또는 계약 문제를 미검증 예외로 넘기지 않는다.

## 완료 조건과 검증 계획

- 설정된 `npm run build`, `npm run lint` 및 `git diff --check`를 실행한다. 빌드·린트 성공을 기능 테스트나 전체 타입 검사 성공으로 보고하지 않는다.
- 의미 있는 자동 검증으로 credential·CSRF 순서, 한 탭 재발급 공유, 다중 탭 직렬화·조정 실패, 응답 유실 후 자동 재사용 차단, CSRF 수동 재시도, 503 유지, 늦은 응답 차단, 개인화 캐시 분리, 계정별 입력 보존·폐기 및 multipart·응답 파싱을 확인한다.
- Chrome에서 로그인 폼 검증·중복 제출·메뉴, 공개/보호 화면의 로딩·실패·빈 상태, 작성자 true/false/누락/오류, 직접 수정 URL, 로그인 왕복 입력 복원, 다중 탭 및 계정 전환을 확인한다.
- ASK-16 제공 후 실제 Frontend·Backend commit과 공식 계약 SHA, 검증 일시·실행 주소를 기록하고 화면·Network의 URL/Payload/Response·Console을 확인한다. 실제 작성자·비작성자·비로그인, 인증 실패·장애와 `Cache-Control: no-store`, 수정·삭제 직접 요청의 서버 인가를 검증한다.
- 실행 결과와 미실행·실패·보류를 구분하고 독립 리뷰 및 append-only devlog를 반영한다. 최종 push head의 CI·필수 리뷰·보호 조건·충돌을 Main이 확인하며 준비되지 않은 게이트를 완료로 보고하지 않는다.
