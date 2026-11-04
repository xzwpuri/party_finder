# 파티파인더 (PartyFinder)

게임 파티 모집 서비스. React(Vite) + Node.js(Express) + MySQL.

## 기능
| 구분 | 내용 |
|---|---|
| 회원관리 (users) | 회원가입(bcrypt 암호화), 로그인(JWT), 프로필 조회/수정, 회원 탈퇴 |
| 핵심 데이터 (parties) | 모집글 등록(로그인 필수) · 전체 목록(누구나) · 수정/삭제(본인만) · 모집 상태 변경(모집중/모집완료/종료) |
| JOIN 메뉴 | 상단 "모집자별 현황" → `parties INNER JOIN users` 결과 표 |

## 실행 방법
1. MySQL 에서 `server/schema.sql` 실행 (DB 이름: `party_finder_20511`)
2. `server/.env.example` 을 복사해 `server/.env` 만들고 DB 정보 입력
3. 서버: `cd server && npm install && npm run dev`  (http://localhost:5000)
4. 클라이언트: `cd client && npm install && npm run dev`  (http://localhost:5173)

## API
| Method | URL | 설명 | 로그인 |
|---|---|---|---|
| POST | /api/users/signup | 회원가입 | - |
| POST | /api/users/login | 로그인 | - |
| GET/PUT/DELETE | /api/users/me | 프로필 조회/수정/탈퇴 | 필요 |
| GET | /api/parties | 전체 목록 (`?game=` 필터) | - |
| GET | /api/parties/with-hosts | **JOIN 결과** (모집글 + 모집자) | - |
| GET | /api/parties/mine | 내 모집글 | 필요 |
| GET | /api/parties/:id | 상세 | - |
| POST | /api/parties | 등록 | 필요 |
| PUT | /api/parties/:id | 수정 | 본인만 |
| PATCH | /api/parties/:id/status | 상태 변경 | 본인만 |
| DELETE | /api/parties/:id | 삭제 | 본인만 |

## 테이블
- `users` : id, email, password(bcrypt), nickname, phone_number, entry_year, student_id
- `parties` : id, title, description, game, mode, tier, max_members, current_members, play_time, discord_link, status, **host_id → users.id**
