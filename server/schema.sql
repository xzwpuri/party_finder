-- 파티파인더 DB 스키마
-- DB 이름은 _학번(20511)으로 끝나야 합니다.
-- server/.env 의 DB_NAME 도 똑같이 맞춰 주세요.
CREATE DATABASE IF NOT EXISTS party_finder_20511 DEFAULT CHARACTER SET utf8mb4;
USE party_finder_20511;

-- 회원 테이블 (쌤 예시와 동일)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,            -- bcrypt 해시
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  entry_year INT NOT NULL,                   -- 입학년도
  student_id VARCHAR(10) NOT NULL,           -- 학번
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 핵심 데이터: 파티 모집글
CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,               -- 모집글 제목
  description TEXT NOT NULL,                 -- 상세 설명
  game VARCHAR(50) NOT NULL,                 -- 게임 이름 (예: 이터널 리턴)
  mode VARCHAR(20) NOT NULL DEFAULT '일반',   -- 랭크 / 일반 / 내전 / 기타
  tier VARCHAR(50),                          -- 티어·실력 조건 (선택)
  max_members INT NOT NULL DEFAULT 4,        -- 모집 정원 (본인 포함)
  current_members INT NOT NULL DEFAULT 1,    -- 현재 인원 (본인 포함)
  play_time DATETIME NOT NULL,               -- 플레이 예정 시간
  discord_link VARCHAR(255),                 -- 디스코드 초대 링크 (선택)
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',-- OPEN: 모집중 / FULL: 모집완료 / CLOSED: 종료
  host_id INT NOT NULL,                      -- 모집자 (users 테이블 참조)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);
