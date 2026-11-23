# ASK-18 게시글 첨부파일

- [ASK-18](https://marcel615.atlassian.net/browse/ASK-18)은 유일한 프론트엔드 착수 가능 작업이었다. 박민재가 2026-11-23 13:20 KST에 착수 가능으로 전환했다. [ASK-26](https://marcel615.atlassian.net/browse/ASK-26)은 완료됐고 [Specs PR #17](https://github.com/marcel615/Ask-Teacher-specs/pull/17)이 main에 병합됐다.
- React develop `9dccbf358e44036c1cfb867eeaa5b656b6a7c03a`에서 `feature/issue-18-post-attachments`를 시작했다. Spring develop 대조 기준은 `2c4d02d76cfe5690755c4b0a8deddd0e28df7eac`다.
- 작성·수정 공통 폼에서 JPEG, PNG, WebP, PDF를 검증하고 선택 목록에서 개별 제거할 수 있게 한다. 남은 파일을 multipart의 `files`에 보내고 서버 오류 시 선택과 본문을 보존한다. 수정 시 저장된 첨부를 표시하고 새 파일만 전송한다.
- 상세 본문 아래에 이미지를 표시하고 PDF는 유형과 순번으로 새 탭에서 연다. 파일명은 상세에 표시하지 않는다. 상대 URL은 API 클라이언트의 백엔드 출처에 맞춘다. 파일 표시 실패와 첨부 없음 상태에서 본문을 표시한다.
- 기존 인증·권한과 API를 사용한다. 저장된 첨부의 삭제·교체, 저장 인프라와 공식 계약 변경은 이번 범위에서 제외한다.

## 공식 기준

Specs main `ee0ef5313acab5887ee11b59272c29d88af9f504`의 [요구사항](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/requirements.md#L104), [OpenAPI](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/openapi.yaml), [인증 정책](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/auth-policy.md), [UI 명세](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/ui-spec.md#L131), [ERD](https://github.com/marcel615/Ask-Teacher-specs/blob/ee0ef5313acab5887ee11b59272c29d88af9f504/docs/schema.dbml#L45)를 확인했다.

## 검증 계획

빌드·린트·자동 테스트와 격리된 Spring 및 Chrome으로 첨부 없는 작성·수정, 파일 검증·제거·혼합 업로드, 수정 후 기존 파일 보존, 공개 상세와 수정 권한, 오류 후 입력 보존을 확인한다.
