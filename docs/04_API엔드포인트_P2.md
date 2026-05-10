# API 엔드포인트 명세

> 프로젝트명: **EditHub**
> 작성일: 2026-03-12
> Base URL: `/api`
> 인증: `Authorization: Bearer {accessToken}` ([LOCK] 표시된 엔드포인트)
> 버전: v1.0 (P2 범위)

---

## 공통 응답 포맷

```json
{ "code": 200, "message": "success", "data": { } }
```

---

## 1. 인증 (Auth)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| POST | `/api/auth/register` | [PUBLIC] | 회원가입 |
| POST | `/api/auth/login` | [PUBLIC] | 로그인 |
| POST | `/api/auth/refresh` | [PUBLIC] | Access Token 재발급 |
| POST | `/api/auth/logout` | [AUTH] | 로그아웃 (Refresh Token 삭제) |

### POST `/api/auth/register`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123!",
  "nickname": "루카",
  "role": "STUDENT"
}
```
**Response:**
```json
{ "code": 201, "message": "success", "data": { "userId": 1 } }
```

### POST `/api/auth/login`
**Request Body:**
```json
{ "email": "user@example.com", "password": "password123!" }
```
**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST `/api/auth/refresh`
**Request Body:**
```json
{ "refreshToken": "eyJ..." }
```
**Response:**
```json
{ "code": 200, "message": "success", "data": { "accessToken": "eyJ..." } }
```

---

## 2. 사용자 (User)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/users/me` | [AUTH] | 내 프로필 조회 |
| PUT | `/api/users/me` | [AUTH] | 내 프로필 수정 |
| PUT | `/api/users/me/password` | [AUTH] | 비밀번호 변경 |
| GET | `/api/admin/users` | [AUTH] ADMIN | 전체 회원 목록 조회 |
| PUT | `/api/admin/users/{userId}/status` | [AUTH] ADMIN | 회원 활성/비활성 변경 |
| PUT | `/api/admin/users/{userId}/role` | [AUTH] ADMIN | 회원 역할 변경 |

### GET `/api/users/me` Response:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "루카",
    "bio": "소개글",
    "role": "STUDENT"
  }
}
```

---

## 3. 강의 (Course)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/courses` | [PUBLIC] | 강의 목록 조회 (필터/정렬/페이징) |
| GET | `/api/courses/{courseId}` | [PUBLIC] | 강의 상세 조회 |
| POST | `/api/courses` | [AUTH] INSTRUCTOR | 강의 등록 |
| PUT | `/api/courses/{courseId}` | [AUTH] INSTRUCTOR | 강의 수정 |
| DELETE | `/api/courses/{courseId}` | [AUTH] INSTRUCTOR | 강의 삭제 (비활성화) |
| GET | `/api/instructor/courses` | [AUTH] INSTRUCTOR | 내 강의 목록 조회 |
| PUT | `/api/admin/courses/{courseId}/status` | [AUTH] ADMIN | 강의 상태 변경 (승인/반려) |
| GET | `/api/admin/courses` | [AUTH] ADMIN | 전체 강의 목록 (관리자용) |

### GET `/api/courses` Query Parameters:
```
?category=YOUTUBE
&keyword=프리미어
&sort=LATEST (LATEST | RATING | STUDENTS)
&page=0
&size=12
```

### POST `/api/courses` Request Body:
```json
{
  "title": "프리미어 프로 완전정복",
  "description": "강의 소개",
  "category": "YOUTUBE",
  "price": 49000
}
```

---

## 4. 섹션 (Section)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/courses/{courseId}/sections` | [PUBLIC] | 섹션 목록 조회 |
| POST | `/api/courses/{courseId}/sections` | [AUTH] INSTRUCTOR | 섹션 추가 |
| PUT | `/api/courses/{courseId}/sections/{sectionId}` | [AUTH] INSTRUCTOR | 섹션 수정 |
| DELETE | `/api/courses/{courseId}/sections/{sectionId}` | [AUTH] INSTRUCTOR | 섹션 삭제 |
| PATCH | `/api/courses/{courseId}/sections/order` | [AUTH] INSTRUCTOR | 섹션 순서 변경 |

### PATCH `/api/courses/{courseId}/sections/order` Request Body:
```json
{ "orderedIds": [3, 1, 2] }
```

---

## 5. 레슨 (Lesson)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| POST | `/api/sections/{sectionId}/lessons` | [AUTH] INSTRUCTOR | 레슨 추가 |
| PUT | `/api/sections/{sectionId}/lessons/{lessonId}` | [AUTH] INSTRUCTOR | 레슨 수정 |
| DELETE | `/api/sections/{sectionId}/lessons/{lessonId}` | [AUTH] INSTRUCTOR | 레슨 삭제 |
| PATCH | `/api/sections/{sectionId}/lessons/order` | [AUTH] INSTRUCTOR | 레슨 순서 변경 |

---

## 6. 수강 신청 (Enrollment)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/users/me/enrollments` | [AUTH] STUDENT | 내 수강 목록 조회 |
| GET | `/api/users/me/enrollments/{courseId}` | [AUTH] STUDENT | 특정 강의 수강 여부 확인 |

---

## 7. 진도 관리 (Progress)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| PUT | `/api/enrollments/{enrollmentId}/lessons/{lessonId}/progress` | [AUTH] STUDENT | 레슨 진도 완료 처리 |
| GET | `/api/enrollments/{enrollmentId}/progress` | [AUTH] STUDENT | 강의 전체 진도율 조회 |

### GET `/api/enrollments/{enrollmentId}/progress` Response:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalLessons": 20,
    "completedLessons": 8,
    "progressRate": 40.0
  }
}
```

---

## 8. 리뷰 (Review)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/courses/{courseId}/reviews` | [PUBLIC] | 강의 리뷰 목록 조회 |
| POST | `/api/courses/{courseId}/reviews` | [AUTH] STUDENT | 리뷰 작성 |
| PUT | `/api/courses/{courseId}/reviews/{reviewId}` | [AUTH] STUDENT | 리뷰 수정 |
| DELETE | `/api/courses/{courseId}/reviews/{reviewId}` | [AUTH] STUDENT | 리뷰 삭제 |

### POST `/api/courses/{courseId}/reviews` Request Body:
```json
{ "rating": 5, "content": "정말 유익한 강의였습니다!" }
```

---

## 9. 결제 내역 (Payment)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|-------|-----------|------|------|
| GET | `/api/users/me/payments` | [AUTH] STUDENT | 내 결제 내역 조회 |
| POST | `/api/admin/payments/{paymentId}/cancel` | [AUTH] ADMIN | 결제 취소 (환불) |
| GET | `/api/admin/payments` | [AUTH] ADMIN | 전체 결제 내역 조회 |

> 실제 PG사(토스페이먼츠) 연동은 P3 범위. P2에서는 결제 내역 조회 및 관리자 환불 처리만 제공.

---

## 10. HTTP 상태 코드 & 에러 코드

| HTTP Status | 상황 |
|-------------|------|
| 200 | 요청 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 요청 파라미터 오류, 비즈니스 로직 오류 |
| 401 | 인증 실패 (토큰 없음/만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 (이미 수강 중, 이미 리뷰 작성 등) |
| 500 | 서버 내부 오류 |
