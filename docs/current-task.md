# 현재 작업: Frontend AI-DLC 프로젝트별 설정 분리

## 승인과 기준

- 사용자 요청으로 Issue를 생성하거나 연결하지 않고 이 작업을 진행한다. 제품 코드와 공식 Specs는 수정하지 않으며 PR merge는 사용자가 직접 한다.
- 기준: Frontend `develop`의 `adbac9b8597acbf761ec7ef1d0f54876b165eaf9`, 작업 브랜치 `feature/ai-dlc-project-config`.
- 이전 Issue #22는 PR #23 merge 및 devlog 반영을 Main이 확인했다. 이전 작업 설계와 기록은 [기준 커밋의 current-task.md](https://github.com/marcel615/Ask-Teacher-react/blob/adbac9b8597acbf761ec7ef1d0f54876b165eaf9/docs/current-task.md)와 [current-work-log.md](https://github.com/marcel615/Ask-Teacher-react/blob/adbac9b8597acbf761ec7ef1d0f54876b165eaf9/docs/current-work-log.md)에서 확인한다.

## 범위와 완료 조건

- [Backend PR #76](https://github.com/marcel615/Ask-Teacher/pull/76)의 최종 설정 구조를 참고하여 루트 `ai-dlc.yaml`에 Frontend 저장소, Project, 명세 및 React 검증 명령을 둔다.
- AI-DLC 운영 파일의 프로젝트별 값을 설정 참조로 전환하고 단일 `issue-driven-dev` Skill, Main·Architect·Builder·Reporter 역할, 기존 Issue 절차와 승인 조건·품질 게이트를 유지한다.
- 제품 코드와 공식 Specs는 제외한다. 요구사항·API·ERD·UI 계약 변경은 필요하지 않다.
- 설정과 템플릿의 YAML 파싱, 운영 파일의 설정 키와 공식 명세 경로 확인, `npm run build`, `npm run lint`, diff 확인 및 독립 리뷰를 수행한다. 화면·API 동작은 변경하지 않으므로 브라우저 Network·Console 통합 검증은 해당하지 않는다.
- 설정과 운영 문서의 일치 및 검증 결과를 기록하고 `develop` 대상 PR을 생성한다. CI·필수 리뷰·충돌 및 보호 조건은 최종 head에서 확인한다.
