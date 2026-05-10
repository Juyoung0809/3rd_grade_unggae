# ERD (Entity Relationship Diagram)

> 프로젝트명: **EditHub**
> 작성일: 2026-03-12
> DB: MySQL 8.x
> 버전: v1.0 (P2 범위)

---

## 1. 테이블 관계

```
USER        (1) --- (N) COURSE         : 강사 등록
USER        (1) --- (N) ENROLLMENT     : 수강 신청
USER        (1) --- (N) REVIEW         : 리뷰 작성
USER        (1) --- (N) PAYMENT        : 결제
USER        (1) --- (N) REFRESH_TOKEN  : 토큰 발급
COURSE      (1) --- (N) SECTION        : 섹션 구성
COURSE      (1) --- (N) ENROLLMENT     : 수강됨
COURSE      (1) --- (N) REVIEW         : 리뷰됨
COURSE      (1) --- (N) PAYMENT        : 결제됨
SECTION     (1) --- (N) LESSON         : 레슨 구성
ENROLLMENT  (1) --- (N) PROGRESS       : 진도
LESSON      (1) --- (N) PROGRESS       : 진도 기록
```

---

## 2. 테이블 상세 명세

### 2.1 USER

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| password | VARCHAR(255) | NOT NULL | BCrypt 암호화 비밀번호 |
| nickname | VARCHAR(50) | NOT NULL | 닉네임 |
| profile_image_key | VARCHAR(255) | NULL | 이미지 경로 |
| bio | TEXT | NULL | 자기소개 |
| role | ENUM | NOT NULL | STUDENT / INSTRUCTOR / ADMIN |
| is_active | BOOLEAN | DEFAULT TRUE | 계정 활성 여부 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

---

### 2.2 COURSE

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| instructor_id | BIGINT | FK(USER) | 강사 ID |
| title | VARCHAR(200) | NOT NULL | 강의 제목 |
| description | TEXT | NULL | 강의 설명 |
| thumbnail_key | VARCHAR(255) | NULL | 썸네일 이미지 경로 |
| price | DECIMAL(10,2) | NOT NULL | 가격 (0이면 무료) |
| category | ENUM | NOT NULL | 강의 카테고리 |
| status | ENUM | DEFAULT 'PENDING' | 강의 상태 |
| avg_rating | FLOAT | DEFAULT 0.0 | 평균 별점 |
| student_count | INT | DEFAULT 0 | 수강생 수 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

---

### 2.3 SECTION

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| course_id | BIGINT | FK(COURSE) | 강의 ID |
| title | VARCHAR(200) | NOT NULL | 섹션 제목 |
| order_num | INT | NOT NULL | 섹션 순서 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

---

### 2.4 LESSON

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| section_id | BIGINT | FK(SECTION) | 섹션 ID |
| title | VARCHAR(200) | NOT NULL | 레슨 제목 |
| description | TEXT | NULL | 레슨 설명 |
| video_key | VARCHAR(255) | NULL | 영상 파일 경로 |
| duration_sec | INT | DEFAULT 0 | 영상 길이(초) |
| order_num | INT | NOT NULL | 레슨 순서 |
| is_preview | BOOLEAN | DEFAULT FALSE | 미리보기 여부 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

---

### 2.5 ENROLLMENT

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| user_id | BIGINT | FK(USER) | 수강생 ID |
| course_id | BIGINT | FK(COURSE) | 강의 ID |
| enrolled_at | DATETIME | NOT NULL | 수강 등록일시 |

> UNIQUE(user_id, course_id) — 동일 강의 중복 수강 방지

---

### 2.6 PROGRESS

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| enrollment_id | BIGINT | FK(ENROLLMENT) | 수강 신청 ID |
| lesson_id | BIGINT | FK(LESSON) | 레슨 ID |
| is_completed | BOOLEAN | DEFAULT FALSE | 완료 여부 |
| completed_at | DATETIME | NULL | 완료 일시 |

> UNIQUE(enrollment_id, lesson_id)

---

### 2.7 REVIEW

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| user_id | BIGINT | FK(USER) | 작성자 ID |
| course_id | BIGINT | FK(COURSE) | 강의 ID |
| rating | INT | NOT NULL, CHECK(1~5) | 별점 |
| content | TEXT | NOT NULL | 리뷰 내용 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

> UNIQUE(user_id, course_id) — 강의당 1인 1리뷰

---

### 2.8 PAYMENT

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| user_id | BIGINT | FK(USER) | 결제자 ID |
| course_id | BIGINT | FK(COURSE) | 강의 ID |
| amount | DECIMAL(10,2) | NOT NULL | 결제 금액 |
| status | ENUM | DEFAULT 'PENDING' | 결제 상태 (PENDING / COMPLETED / REFUNDED) |
| paid_at | DATETIME | NULL | 결제 완료 일시 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

> P2에서는 실제 PG사 연동 없이 내부 결제 상태 관리만 처리.
> order_id(UUID), payment_key, provider(TOSS) 컬럼은 토스페이먼츠 연동(P3) 시 추가.

---

### 2.9 REFRESH_TOKEN

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 식별자 |
| user_id | BIGINT | FK(USER) | 사용자 ID |
| token | VARCHAR(512) | NOT NULL | Refresh Token 값 |
| expires_at | DATETIME | NOT NULL | 만료 일시 |
| created_at | DATETIME | NOT NULL | 생성일시 |
