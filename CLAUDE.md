# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

**EditHub** — 영상 편집 전문 온라인 강의 플랫폼.
강사가 강의를 등록하고, 수강생이 결제 후 수강하는 서비스.
토스페이먼츠 결제 연동, JWT 인증, 관리자 승인 시스템 포함.

---

## Commands

### Backend (Spring Boot, port 8080)
```bash
cd Back
./gradlew bootRun          # 개발 서버 실행
./gradlew build            # 빌드
./gradlew test             # 테스트 실행
```

### Frontend (React + Vite, port 5173)
```bash
cd Front
npm install                # 의존성 설치
npm run dev                # 개발 서버 실행
npm run build              # 프로덕션 빌드
```

---

## Architecture

### 사용자 역할
- **STUDENT** — 강의 구매 및 수강
- **INSTRUCTOR** — 강의 등록 및 관리
- **ADMIN** — 서비스 전체 운영

### 기술 스택
| 분류 | 기술 |
|------|------|
| 프론트엔드 | React 18, Vite, React Router v6, Axios, Tailwind CSS, Zustand |
| 백엔드 | Spring Boot 3.x, Spring Security, JPA (Hibernate), Gradle |
| DB | MySQL 8.x |
| 인증 | JWT (Access Token + Refresh Token) |
| 결제 | 토스페이먼츠 API |
| API 문서 | Springdoc OpenAPI (Swagger UI) |

## Documentation Rules

Claude Code는 각 Phase 구현 완료 후 아래 문서들을 자동으로 작성하거나 업데이트한다.

### 06_구현이력.md — Phase 완료 시마다 업데이트
각 Phase가 끝날 때마다 아래 형식으로 내용을 추가한다.

## Phase N. 제목

### 생성된 파일
- `경로/파일명` — 설명

### 수정된 파일
- `경로/파일명` — 변경 내용

### 설계 결정
- 왜 이렇게 구현했는지 이유


### 07_체크리스트.md — Phase 완료 시마다 업데이트
docs/05_개발계획서.md의 체크리스트를 기준으로,
완료된 항목은 [ ] → [x] 로 변경한다.

### 08_버그수정이력.md — 버그 수정 시마다 업데이트
버그를 수정할 때마다 아래 형식으로 내용을 추가한다.

## BUG-001: 버그 제목

### 발생일
YYYY-MM-DD

### 증상
어떤 문제가 있었는지

### 원인
왜 발생했는지

### 수정 내용
무엇을 어떻게 바꿨는지

### 검증
수정 후 어떻게 확인했는지