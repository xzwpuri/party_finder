// 공통 유틸 함수

// localStorage 의 JWT 에서 로그인한 사용자 id 꺼내기 (서명 검증은 서버가 함)
export const getMyId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return payload.id ?? payload.userId ?? null;
  } catch {
    return null;
  }
};

export const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const STATUS_LABEL = { OPEN: '모집중', FULL: '모집완료', CLOSED: '종료' };
export const MODES = ['랭크', '일반', '내전', '기타'];
export const GAME_SUGGESTIONS = ['이터널 리턴', '리그 오브 레전드', '발로란트', '마인크래프트', '오버워치 2', '배틀그라운드'];

// '2026-11-10 21:30' → '11/10 21:30'
export const formatPlayTime = (value) => {
  if (!value) return '';
  const [date, time] = value.split(' ');
  const [, m, d] = date.split('-');
  return `${Number(m)}/${Number(d)} ${time}`;
};

// '2026-11-10 21:30' → datetime-local 입력용 '2026-11-10T21:30'
export const toInputTime = (value) => (value ? value.replace(' ', 'T') : '');

export const timeAgo = (value) => {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(value).toLocaleDateString('ko-KR');
};
