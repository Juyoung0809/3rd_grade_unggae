-- ============================================================
-- Unggae DB Seed Script
-- 강의 전체 삭제 → 강사 5명 + 강의 20개 + 섹션/레슨 삽입
-- 강사 비밀번호: test1234
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 기존 강의 관련 데이터 전체 삭제
TRUNCATE TABLE lecture_completions;
TRUNCATE TABLE payments;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE lectures;
TRUNCATE TABLE sections;
TRUNCATE TABLE ratings;
TRUNCATE TABLE answers;
TRUNCATE TABLE questions;
TRUNCATE TABLE courses;

-- 기존 강사 계정 삭제 (재실행 시 중복 방지)
DELETE FROM users WHERE email IN (
  'kim.youngjin@edithub.com', 'lee.soohyun@edithub.com',
  'park.jungwoo@edithub.com', 'choi.minji@edithub.com', 'jung.seungho@edithub.com'
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 강사 5명 생성 (비밀번호: test1234)
-- ============================================================
INSERT INTO users (email, password, name, nickname, bio, role, status, created_at, updated_at) VALUES
('kim.youngjin@edithub.com', '$2b$10$EifpTCaTiwo6EJ.CXvcrX.uPdUIOmXZG/BI5rt3OyN/oAcx5QrYXC', '김영진', '김영진', '유튜브·쇼츠 전문 영상 편집 강사. 구독자 50만 채널 운영 경험 보유', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW()),
('lee.soohyun@edithub.com', '$2b$10$EifpTCaTiwo6EJ.CXvcrX.uPdUIOmXZG/BI5rt3OyN/oAcx5QrYXC', '이수현', '이수현', '광고·행사 영상 제작 10년 경력 프리랜서 PD', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW()),
('park.jungwoo@edithub.com', '$2b$10$EifpTCaTiwo6EJ.CXvcrX.uPdUIOmXZG/BI5rt3OyN/oAcx5QrYXC', '박정우', '박정우', 'AI 영상 & 모션그래픽 전문가. After Effects 10년 경력', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW()),
('choi.minji@edithub.com', '$2b$10$EifpTCaTiwo6EJ.CXvcrX.uPdUIOmXZG/BI5rt3OyN/oAcx5QrYXC', '최민지', '최민지', '색보정 & 썸네일 디자인 전문가. 포토그래퍼 겸 영상 에디터', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW()),
('jung.seungho@edithub.com', '$2b$10$EifpTCaTiwo6EJ.CXvcrX.uPdUIOmXZG/BI5rt3OyN/oAcx5QrYXC', '정승호', '정승호', '음악 프로듀서 & 영상 크리에이터. 여행 브이로그 채널 운영 중', 'INSTRUCTOR', 'ACTIVE', NOW(), NOW());

-- ============================================================
-- 강의 20개 삽입 (카테고리 다양화, status = PUBLISHED)
-- ============================================================

-- [김영진] YOUTUBE / SHORTS / THUMBNAIL / VLOG
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '유튜브 알고리즘 공략 편집 완전정복', '유튜브 알고리즘을 이해하고 조회수를 높이는 편집 스킬을 마스터합니다. 인트로·아웃트로 제작, 자막, 효과음 삽입까지 실전 예제로 배웁니다.', 'YOUTUBE', 'PUBLISHED', 49000, 4, NOW(), NOW() FROM users WHERE email = 'kim.youngjin@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '쇼츠 바이럴 편집 전략 A to Z', '15초~60초 쇼츠 영상의 구조 분석부터 훅(Hook) 편집법, 음악 싱크, 자막 효과까지 바이럴 공식을 배웁니다.', 'SHORTS', 'PUBLISHED', 39000, 4, NOW(), NOW() FROM users WHERE email = 'kim.youngjin@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '클릭율 200% 유튜브 썸네일 제작', '눈에 띄는 썸네일 디자인 원리, 폰트·색상 선택, 포토샵·캔바 활용법까지 클릭율을 극대화하는 썸네일을 만듭니다.', 'THUMBNAIL', 'PUBLISHED', 29000, 4, NOW(), NOW() FROM users WHERE email = 'kim.youngjin@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '감성 브이로그 편집 스쿨', '일상을 영화처럼 담아내는 감성 브이로그 편집법. 색감 보정, BGM 선택, 트랜지션 기법으로 나만의 브이로그를 완성합니다.', 'VLOG', 'PUBLISHED', 35000, 4, NOW(), NOW() FROM users WHERE email = 'kim.youngjin@edithub.com';

-- [이수현] POST_PRODUCTION / ADVERTISEMENT / EVENT / INDUSTRY
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '프리미어 프로 영상 후반작업 마스터', '어도비 프리미어 프로의 색보정, 오디오 믹싱, VFX 합성, 렌더링 최적화까지 프로급 후반작업 워크플로우를 배웁니다.', 'POST_PRODUCTION', 'PUBLISHED', 59000, 4, NOW(), NOW() FROM users WHERE email = 'lee.soohyun@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '광고 영상 기획부터 편집까지 실무 클래스', '브랜드 광고 영상의 기획, 스토리보드, 촬영 지시, 후편집까지 실제 현장에서 쓰이는 광고 영상 제작 프로세스를 익힙니다.', 'ADVERTISEMENT', 'PUBLISHED', 65000, 4, NOW(), NOW() FROM users WHERE email = 'lee.soohyun@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '웨딩·행사 영상 전문 편집 클래스', '웨딩, 돌잔치, 기업 행사 영상 편집의 핵심 노하우. 하이라이트 편집, 자막 디자인, 음악 싱크를 마스터합니다.', 'EVENT', 'PUBLISHED', 45000, 4, NOW(), NOW() FROM users WHERE email = 'lee.soohyun@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '업종별 홍보 영상 제작 실전 가이드', '음식점, 카페, 쇼핑몰, 부동산 등 업종별 특성에 맞는 홍보 영상 기획과 편집 전략을 실전 프로젝트로 배웁니다.', 'INDUSTRY', 'PUBLISHED', 55000, 4, NOW(), NOW() FROM users WHERE email = 'lee.soohyun@edithub.com';

-- [박정우] AI / MOTION / AI / MOTION
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, 'AI로 만드는 유튜브 콘텐츠 자동화', 'ChatGPT, Runway, Sora 등 AI 툴을 활용해 대본 생성부터 영상 편집, 썸네일 제작까지 콘텐츠 제작 자동화 파이프라인을 구축합니다.', 'AI', 'PUBLISHED', 49000, 4, NOW(), NOW() FROM users WHERE email = 'park.jungwoo@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '에프터이펙트 모션그래픽 기초 완성', 'After Effects의 핵심 기능, 키프레임 애니메이션, 텍스트 효과, 파티클 시스템까지 모션그래픽 기초를 탄탄히 잡아드립니다.', 'MOTION', 'PUBLISHED', 55000, 4, NOW(), NOW() FROM users WHERE email = 'park.jungwoo@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, 'AI 영상 생성 & 편집 워크플로우', 'AI 영상 생성 도구(Runway, Pika, Kling)와 전통 편집을 결합한 하이브리드 워크플로우로 한 단계 앞선 콘텐츠를 제작합니다.', 'AI', 'PUBLISHED', 59000, 4, NOW(), NOW() FROM users WHERE email = 'park.jungwoo@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '영상 인트로·타이틀 모션그래픽 제작', '채널 아이덴티티를 살리는 인트로 영상, 로고 애니메이션, 타이틀 시퀀스를 AE와 Lottie로 제작합니다.', 'MOTION', 'PUBLISHED', 69000, 4, NOW(), NOW() FROM users WHERE email = 'park.jungwoo@edithub.com';

-- [최민지] COLOR / SHORTS / COLOR / THUMBNAIL
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '시네마틱 색보정 마스터클래스', '할리우드 영화 같은 색감을 내 영상에 적용하는 법. LUT 활용, 스킨톤 보정, 분위기별 컬러 그레이딩을 마스터합니다.', 'COLOR', 'PUBLISHED', 59000, 4, NOW(), NOW() FROM users WHERE email = 'choi.minji@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '인스타 릴스 & 쇼츠 트렌드 편집법', '2025 인스타그램 릴스·유튜브 쇼츠 트렌드를 분석한 편집법. 빠른 컷, 트랜지션, 캡션 스타일로 팔로워를 늘리세요.', 'SHORTS', 'PUBLISHED', 35000, 4, NOW(), NOW() FROM users WHERE email = 'choi.minji@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, 'DaVinci Resolve 색보정 완전정복', '무료 툴 DaVinci Resolve로 프로급 색보정하는 법. 기초 노드 구조부터 HDR 색보정, 출력 설정까지 실전 프로젝트로 배웁니다.', 'COLOR', 'PUBLISHED', 49000, 4, NOW(), NOW() FROM users WHERE email = 'choi.minji@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '브랜딩 썸네일 & 채널아트 제작 클래스', '유튜브 채널의 브랜드 정체성을 만드는 썸네일 시리즈, 채널 배너, 프로필 이미지를 포토샵으로 제작합니다.', 'THUMBNAIL', 'PUBLISHED', 39000, 4, NOW(), NOW() FROM users WHERE email = 'choi.minji@edithub.com';

-- [정승호] MUSIC / VLOG / SOUND / MUSIC
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '영상 BGM & 음악 편집 완전 가이드', '저작권 무료 음악 찾기, BGM 편집, 음악에 맞춘 컷 편집, 오디오 믹싱까지 영상의 감동을 음악으로 완성합니다.', 'MUSIC', 'PUBLISHED', 45000, 4, NOW(), NOW() FROM users WHERE email = 'jung.seungho@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '여행 브이로그 촬영부터 편집까지', '해외여행·국내여행 브이로그 촬영 기법부터 프리미어 프로로 편집하는 전 과정. 색감, 음악, 내레이션까지 감성 가득한 영상을 만들어 보세요.', 'VLOG', 'PUBLISHED', 45000, 4, NOW(), NOW() FROM users WHERE email = 'jung.seungho@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '사운드 디자인 & 음향 편집 기초', '영화·광고급 사운드 디자인의 세계. 폴리 사운드, SFX 레이어링, 오디오 EQ·컴프레서 활용법을 익혀 영상의 완성도를 높입니다.', 'SOUND', 'PUBLISHED', 49000, 4, NOW(), NOW() FROM users WHERE email = 'jung.seungho@edithub.com';
INSERT INTO courses (instructor_id, title, description, category, status, price, lecture_count, created_at, updated_at) SELECT id, '음악 크리에이터를 위한 영상 편집', '뮤직비디오, 라이브 클립, 음원 홍보 영상 제작법. 비트에 맞춘 편집, 리릭 비디오, 아티스트 비주얼 콘텐츠를 만들어 봅니다.', 'MUSIC', 'PUBLISHED', 55000, 4, NOW(), NOW() FROM users WHERE email = 'jung.seungho@edithub.com';

-- ============================================================
-- 섹션 삽입 (강의마다 2개)
-- ============================================================
INSERT INTO sections (course_id, title, order_num, created_at, updated_at)
SELECT c.id, '섹션 1. 기초 개념과 환경 설정', 1, NOW(), NOW() FROM courses c WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL
SELECT c.id, '섹션 2. 실전 편집 테크닉', 2, NOW(), NOW() FROM courses c WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL
SELECT c.id, '섹션 1. 쇼츠 구조 이해', 1, NOW(), NOW() FROM courses c WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL
SELECT c.id, '섹션 2. 바이럴 편집 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL
SELECT c.id, '섹션 1. 썸네일 기초 원리', 1, NOW(), NOW() FROM courses c WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL
SELECT c.id, '섹션 2. 고급 썸네일 제작 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL
SELECT c.id, '섹션 1. 브이로그 기획과 촬영', 1, NOW(), NOW() FROM courses c WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL
SELECT c.id, '섹션 2. 감성 편집 완성', 2, NOW(), NOW() FROM courses c WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL
SELECT c.id, '섹션 1. 후반작업 기초', 1, NOW(), NOW() FROM courses c WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL
SELECT c.id, '섹션 2. 고급 후반작업 워크플로우', 2, NOW(), NOW() FROM courses c WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL
SELECT c.id, '섹션 1. 광고 기획과 전략', 1, NOW(), NOW() FROM courses c WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL
SELECT c.id, '섹션 2. 광고 편집 실무', 2, NOW(), NOW() FROM courses c WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL
SELECT c.id, '섹션 1. 행사 영상 촬영 이해', 1, NOW(), NOW() FROM courses c WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL
SELECT c.id, '섹션 2. 하이라이트 편집 완성', 2, NOW(), NOW() FROM courses c WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL
SELECT c.id, '섹션 1. 업종별 영상 기획', 1, NOW(), NOW() FROM courses c WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL
SELECT c.id, '섹션 2. 홍보 영상 편집 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL
SELECT c.id, '섹션 1. AI 툴 이해와 설정', 1, NOW(), NOW() FROM courses c WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL
SELECT c.id, '섹션 2. AI 자동화 파이프라인 구축', 2, NOW(), NOW() FROM courses c WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL
SELECT c.id, '섹션 1. After Effects 기초', 1, NOW(), NOW() FROM courses c WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL
SELECT c.id, '섹션 2. 모션그래픽 실전 제작', 2, NOW(), NOW() FROM courses c WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL
SELECT c.id, '섹션 1. AI 영상 생성 도구 활용', 1, NOW(), NOW() FROM courses c WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL
SELECT c.id, '섹션 2. 하이브리드 워크플로우 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL
SELECT c.id, '섹션 1. 인트로 디자인 기초', 1, NOW(), NOW() FROM courses c WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL
SELECT c.id, '섹션 2. 타이틀 시퀀스 제작', 2, NOW(), NOW() FROM courses c WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL
SELECT c.id, '섹션 1. 색보정 기초 이론', 1, NOW(), NOW() FROM courses c WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL
SELECT c.id, '섹션 2. 시네마틱 컬러 그레이딩', 2, NOW(), NOW() FROM courses c WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL
SELECT c.id, '섹션 1. 트렌드 분석과 기획', 1, NOW(), NOW() FROM courses c WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL
SELECT c.id, '섹션 2. 쇼츠 편집 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL
SELECT c.id, '섹션 1. DaVinci Resolve 기초', 1, NOW(), NOW() FROM courses c WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL
SELECT c.id, '섹션 2. 고급 색보정 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL
SELECT c.id, '섹션 1. 브랜딩 기초와 전략', 1, NOW(), NOW() FROM courses c WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL
SELECT c.id, '섹션 2. 채널아트 & 썸네일 제작', 2, NOW(), NOW() FROM courses c WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL
SELECT c.id, '섹션 1. 음악 저작권과 BGM 찾기', 1, NOW(), NOW() FROM courses c WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL
SELECT c.id, '섹션 2. 오디오 편집 실전', 2, NOW(), NOW() FROM courses c WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL
SELECT c.id, '섹션 1. 여행 영상 촬영 기획', 1, NOW(), NOW() FROM courses c WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL
SELECT c.id, '섹션 2. 여행 브이로그 편집 완성', 2, NOW(), NOW() FROM courses c WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL
SELECT c.id, '섹션 1. 사운드 디자인 이론', 1, NOW(), NOW() FROM courses c WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL
SELECT c.id, '섹션 2. 실전 음향 편집', 2, NOW(), NOW() FROM courses c WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL
SELECT c.id, '섹션 1. 뮤직비디오 기획', 1, NOW(), NOW() FROM courses c WHERE c.title = '음악 크리에이터를 위한 영상 편집' UNION ALL
SELECT c.id, '섹션 2. 라이브 & 홍보 영상 제작', 2, NOW(), NOW() FROM courses c WHERE c.title = '음악 크리에이터를 위한 영상 편집';

-- ============================================================
-- 레슨 삽입 (섹션마다 2강 = 강의당 4강, 총 80강)
-- video_url = 'PLACEHOLDER' → 나중에 직접 교체
-- ============================================================
INSERT INTO lectures (course_id, section_id, title, order_index, video_type, video_url)
SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL
SELECT c.id, s.id, '편집 프로그램 설치와 기본 설정', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL
SELECT c.id, s.id, '알고리즘에 유리한 편집 패턴', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL
SELECT c.id, s.id, '완성 영상 출력 & 업로드 전략', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '유튜브 알고리즘 공략 편집 완전정복' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL
SELECT c.id, s.id, '쇼츠 구조 분석과 훅(Hook) 기법', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL
SELECT c.id, s.id, '음악 싱크 & 자막 효과 실전', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL
SELECT c.id, s.id, '바이럴 쇼츠 완성 & 배포 전략', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '쇼츠 바이럴 편집 전략 A to Z' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL
SELECT c.id, s.id, '썸네일 디자인 원리와 폰트·색상 선택', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL
SELECT c.id, s.id, '포토샵으로 썸네일 제작하기', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL
SELECT c.id, s.id, 'A/B 테스트로 클릭율 최적화', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '클릭율 200% 유튜브 썸네일 제작' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL
SELECT c.id, s.id, '브이로그 기획과 촬영 팁', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL
SELECT c.id, s.id, '색감 보정과 BGM 선택 노하우', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL
SELECT c.id, s.id, '트랜지션 기법으로 감성 브이로그 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '감성 브이로그 편집 스쿨' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL
SELECT c.id, s.id, '색보정과 오디오 믹싱 기초', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL
SELECT c.id, s.id, 'VFX 합성과 고급 효과 적용', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL
SELECT c.id, s.id, '렌더링 최적화 & 납품 포맷 설정', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '프리미어 프로 영상 후반작업 마스터' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL
SELECT c.id, s.id, '브랜드 광고 기획과 스토리보드 작성', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL
SELECT c.id, s.id, '광고 편집 실무 — 컷 & 사운드', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL
SELECT c.id, s.id, '광고 납품 & 플랫폼별 최적화', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '광고 영상 기획부터 편집까지 실무 클래스' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL
SELECT c.id, s.id, '웨딩·행사 촬영 이해와 소재 정리', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL
SELECT c.id, s.id, '하이라이트 편집과 음악 싱크', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL
SELECT c.id, s.id, '자막 디자인 & 최종 납품', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '웨딩·행사 영상 전문 편집 클래스' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL
SELECT c.id, s.id, '업종 분석과 홍보 영상 기획', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL
SELECT c.id, s.id, '음식점·카페 홍보 영상 편집 실전', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL
SELECT c.id, s.id, '쇼핑몰·부동산 홍보 영상 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '업종별 홍보 영상 제작 실전 가이드' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL
SELECT c.id, s.id, 'ChatGPT로 대본 & 썸네일 기획', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL
SELECT c.id, s.id, 'Runway & Sora로 영상 생성하기', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL
SELECT c.id, s.id, 'AI 자동화 파이프라인 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'AI로 만드는 유튜브 콘텐츠 자동화' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL
SELECT c.id, s.id, 'AE 인터페이스와 키프레임 애니메이션', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL
SELECT c.id, s.id, '텍스트 효과와 파티클 시스템', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL
SELECT c.id, s.id, '모션그래픽 프로젝트 완성 & 렌더링', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '에프터이펙트 모션그래픽 기초 완성' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL
SELECT c.id, s.id, 'Runway · Pika · Kling 도구 비교', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL
SELECT c.id, s.id, 'AI 생성 영상 + 실사 편집 합성', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL
SELECT c.id, s.id, '하이브리드 워크플로우 최종 프로젝트', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'AI 영상 생성 & 편집 워크플로우' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL
SELECT c.id, s.id, '로고 애니메이션과 인트로 제작', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL
SELECT c.id, s.id, '타이틀 시퀀스 디자인', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL
SELECT c.id, s.id, 'Lottie 내보내기 & 실전 적용', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '영상 인트로·타이틀 모션그래픽 제작' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL
SELECT c.id, s.id, '색보정 이론과 LUT 활용법', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL
SELECT c.id, s.id, '스킨톤 보정과 분위기별 컬러 그레이딩', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL
SELECT c.id, s.id, '시네마틱 룩 완성 & 출력', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '시네마틱 색보정 마스터클래스' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL
SELECT c.id, s.id, '2025 트렌드 분석과 콘텐츠 기획', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL
SELECT c.id, s.id, '빠른 컷 · 트랜지션 · 캡션 스타일', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL
SELECT c.id, s.id, '릴스 & 쇼츠 완성 & 업로드 전략', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '인스타 릴스 & 쇼츠 트렌드 편집법' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL
SELECT c.id, s.id, '노드 구조 이해와 기초 색보정', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL
SELECT c.id, s.id, 'HDR 색보정과 고급 그레이딩 기법', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL
SELECT c.id, s.id, '최종 출력 설정 & 포맷별 납품', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = 'DaVinci Resolve 색보정 완전정복' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL
SELECT c.id, s.id, '채널 브랜딩 전략과 디자인 원칙', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL
SELECT c.id, s.id, '포토샵으로 채널 배너 & 프로필 제작', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL
SELECT c.id, s.id, '시리즈 썸네일 통일감 만들기', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '브랜딩 썸네일 & 채널아트 제작 클래스' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL
SELECT c.id, s.id, '저작권 무료 음악 찾기 & 사용법', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL
SELECT c.id, s.id, '음악에 맞춘 컷 편집 & BGM 편집', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL
SELECT c.id, s.id, '오디오 믹싱으로 영상 감동 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '영상 BGM & 음악 편집 완전 가이드' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL
SELECT c.id, s.id, '여행 영상 촬영 기획과 장비 소개', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL
SELECT c.id, s.id, '색감 보정과 감성 편집 기법', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL
SELECT c.id, s.id, '내레이션 & 자막으로 여행 브이로그 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '여행 브이로그 촬영부터 편집까지' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL
SELECT c.id, s.id, '폴리 사운드와 SFX 레이어링', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL
SELECT c.id, s.id, '오디오 EQ & 컴프레서 활용', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL
SELECT c.id, s.id, '실전 프로젝트 — 광고 사운드 완성', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '사운드 디자인 & 음향 편집 기초' UNION ALL

SELECT c.id, s.id, '강좌 소개 및 커리큘럼 안내', 1, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '음악 크리에이터를 위한 영상 편집' UNION ALL
SELECT c.id, s.id, '뮤직비디오 기획과 비트 편집', 2, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 1 WHERE c.title = '음악 크리에이터를 위한 영상 편집' UNION ALL
SELECT c.id, s.id, '리릭 비디오 & 라이브 클립 제작', 3, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '음악 크리에이터를 위한 영상 편집' UNION ALL
SELECT c.id, s.id, '음원 홍보 영상 완성 & 배포 전략', 4, 'URL', 'PLACEHOLDER' FROM courses c JOIN sections s ON s.course_id = c.id AND s.order_num = 2 WHERE c.title = '음악 크리에이터를 위한 영상 편집';

-- ============================================================
-- 결과 확인
-- ============================================================
SELECT '강사 수' AS 항목, COUNT(*) AS 값 FROM users WHERE role = 'INSTRUCTOR'
UNION ALL SELECT '강의 수', COUNT(*) FROM courses
UNION ALL SELECT '섹션 수', COUNT(*) FROM sections
UNION ALL SELECT '레슨 수', COUNT(*) FROM lectures;
