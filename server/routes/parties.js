import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const getUserId = (req) => req.user?.id ?? req.user?.userId;

const MODES = ['랭크', '일반', '내전', '기타'];
const STATUSES = ['OPEN', 'FULL', 'CLOSED'];

// play_time 은 문자열 'YYYY-MM-DD HH:mm' 로 내려보냄 (시간대 문제 방지)
const PARTY_COLS = `
  p.id, p.title, p.description, p.game, p.mode, p.tier, p.max_members, p.current_members,
  DATE_FORMAT(p.play_time, '%Y-%m-%d %H:%i') AS play_time,
  p.discord_link, p.status, p.host_id, p.created_at
`;

// ================= Read =================

// 1. 전체 목록 (비로그인 포함 모든 사용자) - parties JOIN users
// GET /api/parties?game=이터널 리턴
router.get('/', async (req, res) => {
  const { game } = req.query;
  try {
    let sql = `
      SELECT ${PARTY_COLS}, u.nickname AS host_nickname
      FROM parties p
      JOIN users u ON p.host_id = u.id
    `;
    const params = [];
    if (game && game !== '전체') {
      sql += ' WHERE p.game = ?';
      params.push(game);
    }
    sql += ' ORDER BY p.created_at DESC, p.id DESC';
    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error('파티 목록 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. [JOIN 메뉴] 모집글 + 모집자 정보
// GET /api/parties/with-hosts   (※ '/:id' 보다 먼저 선언해야 함)
router.get('/with-hosts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id AS party_id, p.title, p.game, p.mode, p.max_members, p.current_members, p.status,
              DATE_FORMAT(p.play_time, '%Y-%m-%d %H:%i') AS play_time,
              u.id AS host_id, u.nickname AS host_nickname,
              u.entry_year AS host_entry_year, u.student_id AS host_student_id
       FROM parties p
       INNER JOIN users u ON p.host_id = u.id
       ORDER BY u.nickname ASC, p.created_at DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('JOIN 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 3. 내가 만든 모집글 (마이페이지)
// GET /api/parties/mine
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ${PARTY_COLS}, u.nickname AS host_nickname
       FROM parties p
       JOIN users u ON p.host_id = u.id
       WHERE p.host_id = ?
       ORDER BY p.created_at DESC, p.id DESC`,
      [getUserId(req)]
    );
    return res.json(rows);
  } catch (error) {
    console.error('내 모집글 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 4. 상세 조회
// GET /api/parties/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ${PARTY_COLS}, u.nickname AS host_nickname, u.student_id AS host_student_id
       FROM parties p
       JOIN users u ON p.host_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 모집글입니다.' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('상세 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// ================= 입력값 검증 (등록/수정 공통) =================
const normalizeBody = (body) => {
  const title = (body.title || '').trim();
  const description = (body.description || '').trim();
  const game = (body.game || '').trim();
  const mode = body.mode || '일반';
  const tier = (body.tier || '').trim() || null;
  const discordLink = (body.discord_link || '').trim() || null;
  const maxMembers = parseInt(body.max_members, 10);
  const currentMembers = parseInt(body.current_members ?? 1, 10);
  const playTime = String(body.play_time || '').replace('T', ' ');

  if (!title || !description || !game || !playTime) {
    return { error: '제목, 게임, 플레이 시간, 설명은 필수입니다.' };
  }
  if (title.length > 150 || game.length > 50) return { error: '제목 또는 게임 이름이 너무 깁니다.' };
  if (!MODES.includes(mode)) return { error: '모드가 올바르지 않습니다.' };
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(playTime)) return { error: '플레이 시간 형식이 올바르지 않습니다.' };
  if (!Number.isInteger(maxMembers) || maxMembers < 2 || maxMembers > 100) {
    return { error: '모집 정원은 2명 이상이어야 합니다.' };
  }
  if (!Number.isInteger(currentMembers) || currentMembers < 1 || currentMembers > maxMembers) {
    return { error: '현재 인원은 1명 이상, 정원 이하여야 합니다.' };
  }
  if (discordLink && !/^https?:\/\//i.test(discordLink)) {
    return { error: '디스코드 링크는 http:// 또는 https:// 로 시작해야 합니다.' };
  }

  return {
    value: {
      title, description, game, mode, tier, maxMembers, currentMembers,
      playTime: playTime.slice(0, 16) + ':00', discordLink,
    },
  };
};

// ================= Create =================

// 5. 모집글 등록 (로그인 필수 - 모집자는 토큰에서 가져옴)
// POST /api/parties
router.post('/', authenticateToken, async (req, res) => {
  const { error, value: v } = normalizeBody(req.body);
  if (error) return res.status(400).json({ message: error });

  // 정원이 이미 찼으면 모집완료로 등록
  const status = v.currentMembers >= v.maxMembers ? 'FULL' : 'OPEN';

  try {
    const [result] = await db.query(
      `INSERT INTO parties
         (title, description, game, mode, tier, max_members, current_members, play_time, discord_link, status, host_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.title, v.description, v.game, v.mode, v.tier, v.maxMembers, v.currentMembers, v.playTime, v.discordLink, status, getUserId(req)]
    );
    return res.status(201).json({ message: '모집글이 등록되었습니다.', partyId: result.insertId });
  } catch (err) {
    console.error('모집글 등록 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// ================= Update / Delete (본인만) =================

// 본인 글인지 확인하는 공통 로직
const findOwned = async (req, res) => {
  const [rows] = await db.query('SELECT id, host_id, status FROM parties WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ message: '존재하지 않는 모집글입니다.' });
    return null;
  }
  if (rows[0].host_id !== getUserId(req)) {
    res.status(403).json({ message: '본인이 작성한 글만 수정/삭제할 수 있습니다.' });
    return null;
  }
  return rows[0];
};

// 6. 수정 (본인만)
// PUT /api/parties/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const party = await findOwned(req, res);
    if (!party) return;

    const { error, value: v } = normalizeBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const status = req.body.status || party.status;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: '모집 상태가 올바르지 않습니다.' });

    await db.query(
      `UPDATE parties
       SET title = ?, description = ?, game = ?, mode = ?, tier = ?, max_members = ?,
           current_members = ?, play_time = ?, discord_link = ?, status = ?
       WHERE id = ?`,
      [v.title, v.description, v.game, v.mode, v.tier, v.maxMembers, v.currentMembers, v.playTime, v.discordLink, status, party.id]
    );
    return res.json({ message: '모집글이 수정되었습니다.' });
  } catch (err) {
    console.error('모집글 수정 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 7. 모집 상태만 변경 (본인만)
// PATCH /api/parties/:id/status   body: { status }
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: '모집 상태가 올바르지 않습니다.' });
  try {
    const party = await findOwned(req, res);
    if (!party) return;
    await db.query('UPDATE parties SET status = ? WHERE id = ?', [status, party.id]);
    return res.json({ message: '모집 상태가 변경되었습니다.' });
  } catch (err) {
    console.error('상태 변경 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 8. 삭제 (본인만)
// DELETE /api/parties/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const party = await findOwned(req, res);
    if (!party) return;
    await db.query('DELETE FROM parties WHERE id = ?', [party.id]);
    return res.json({ message: '모집글이 삭제되었습니다.' });
  } catch (err) {
    console.error('모집글 삭제 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
