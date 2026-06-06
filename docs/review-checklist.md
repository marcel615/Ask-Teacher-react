# Review Checklist

## 작업 범위

- [ ] `docs/current-task.md` 범위 안에서 작업했는가?
- [ ] 불필요한 변경이 없는가?
- [ ] 작업 브랜치와 PR 방향이 올바른가?
- [ ] 이번 PR에서 하지 않을 일까지 건드리지 않았는가?

---

## 라우팅 / 페이지 흐름

- [ ] 필요한 Route가 등록되어 있는가?
- [ ] `Link`, `useNavigate`, `useParams` 사용이 올바른가?
- [ ] 새로고침 후에도 페이지가 정상 동작하는가?

---

## API 연동

- [ ] API 사용이 `docs/api-usage.md`와 일치하는가?
- [ ] API 함수가 적절한 파일에 분리되어 있는가?
- [ ] Method / URL / Request Body가 백엔드 명세와 일치하는가?
- [ ] 성공 응답 반환 기준이 일관적인가?
  - [ ] 조회 API: `response.data.data`
  - [ ] 작성/수정/삭제 API: `response.data`
- [ ] 에러 메시지를 `error.response?.data?.message` 기준으로 처리하는가?

---

## 상태 / useEffect

- [ ] 필요한 `loading`, `error`, empty 상태가 처리되어 있는가?
- [ ] form 입력값이 state와 정상 연결되어 있는가?
- [ ] 조회 API만 `useEffect`에서 자동 실행하는가?
- [ ] POST / PATCH / DELETE 요청을 `useEffect`에서 자동 실행하지 않는가?
- [ ] 의존성 배열이 적절한가?

---

## Form / Validation

- [ ] 백엔드 Validation 규칙과 맞는 프론트 검증이 있는가?
- [ ] 필수값, 공백 문자열, 글자 수 제한을 확인하는가?
- [ ] 검증 실패 시 API 요청을 보내지 않는가?
- [ ] 검증 실패 시 사용자가 작성 중인 내용을 유지하는가?

---

## 컴포넌트 / 렌더링

- [ ] Page 컴포넌트와 Form/공통 컴포넌트 책임이 분리되어 있는가?
- [ ] `map` 렌더링 시 안정적인 `key`를 사용하는가?
- [ ] `id`, `postId`, `categoryId` 등 필드명을 정확히 사용했는가?
- [ ] null/undefined 접근으로 화면이 깨질 가능성이 없는가?

---

## 스타일 / 정리

- [ ] CSS 파일과 className이 역할 기준으로 정리되어 있는가?
- [ ] 버튼, input, textarea, select, 에러 메시지 스타일이 적용되어 있는가?
- [ ] 사용하지 않는 import와 불필요한 `console.log`를 제거했는가?
- [ ] 임시 데이터 import를 제거했는가?
- [ ] git diff를 확인했는가?

---

## 수동 테스트

- [ ] 정상 케이스를 브라우저에서 확인했는가?
- [ ] 실패 케이스를 확인했는가?
- [ ] 빈 데이터 상태를 확인했는가?
- [ ] 입력값 검증 실패를 확인했는가?
- [ ] Network 탭에서 Request Payload / Response를 확인했는가?
- [ ] Console에 불필요한 에러가 없는가?

---

## 리뷰 결과

### 반드시 수정

-

### 선택 개선

-

### 통과 항목

-