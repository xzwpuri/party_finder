import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { authHeader, getMyId, toInputTime, MODES, GAME_SUGGESTIONS } from '../utils';

// 모집글 등록(/write) + 수정(/party/:id/edit) 겸용 페이지
const PartyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    game: '',
    mode: '일반',
    tier: '',
    max_members: 4,
    current_members: 1,
    play_time: '',
    discord_link: '',
    description: '',
  });
  const [status, setStatus] = useState('OPEN');
  const [submitting, setSubmitting] = useState(false);

  // 로그인한 사용자만 접근 가능
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { state: { redirectTo: isEdit ? `/party/${id}/edit` : '/write' } });
    }
  }, [navigate, isEdit, id]);

  // 수정 모드: 기존 데이터 불러오기 (본인 글이 아니면 돌려보냄)
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const response = await fetch(`/api/parties/${id}`);
        if (!response.ok) {
          alert('존재하지 않는 모집글입니다.');
          navigate('/');
          return;
        }
        const data = await response.json();
        if (data.host_id !== getMyId()) {
          alert('본인이 작성한 글만 수정할 수 있습니다.');
          navigate(`/party/${id}`);
          return;
        }
        setForm({
          title: data.title,
          game: data.game,
          mode: data.mode,
          tier: data.tier || '',
          max_members: data.max_members,
          current_members: data.current_members,
          play_time: toInputTime(data.play_time),
          discord_link: data.discord_link || '',
          description: data.description,
        });
        setStatus(data.status);
      } catch (error) {
        console.error('모집글 조회 오류:', error);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(isEdit ? `/api/parties/${id}` : '/api/parties', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(isEdit ? { ...form, status } : form),
      });
      const data = await response.json();

      if (response.ok) {
        alert(isEdit ? '수정되었습니다.' : '등록되었습니다.');
        navigate(isEdit ? `/party/${id}` : `/party/${data.partyId}`);
      } else {
        alert(data.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>{isEdit ? '모집글 수정' : '파티 만들기'}</Title>
      <Form onSubmit={handleSubmit}>
        <Label>제목</Label>
        <Input name="title" value={form.title} onChange={handleChange} maxLength={150} placeholder="예: 이리 듀오 다이아 이상 구해요" required />

        <Label>게임</Label>
        <Input name="game" value={form.game} onChange={handleChange} list="game-list" maxLength={50} placeholder="직접 입력하거나 목록에서 선택" required />
        <datalist id="game-list">
          {GAME_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
        </datalist>

        <Label>모드</Label>
        <Select name="mode" value={form.mode} onChange={handleChange}>
          {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>

        <Label>티어/실력 조건 (선택)</Label>
        <Input name="tier" value={form.tier} onChange={handleChange} maxLength={50} placeholder="예: 플래티넘 이상, 초보 환영" />

        <Row>
          <Half>
            <Label>모집 정원 (본인 포함)</Label>
            <Input type="number" min="2" max="100" name="max_members" value={form.max_members} onChange={handleChange} required />
          </Half>
          <Half>
            <Label>현재 인원</Label>
            <Input type="number" min="1" name="current_members" value={form.current_members} onChange={handleChange} required />
          </Half>
        </Row>

        <Label>플레이 시간</Label>
        <Input type="datetime-local" name="play_time" value={form.play_time} onChange={handleChange} required />

        <Label>디스코드 링크 (선택)</Label>
        <Input name="discord_link" value={form.discord_link} onChange={handleChange} maxLength={255} placeholder="https://discord.gg/..." />

        {isEdit && (
          <>
            <Label>모집 상태</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">모집중</option>
              <option value="FULL">모집완료</option>
              <option value="CLOSED">종료</option>
            </Select>
          </>
        )}

        <Label>설명</Label>
        <TextArea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="플레이 스타일, 마이크 여부, 참가 방법 등" required />

        <SubmitButton type="submit" disabled={submitting}>
          {isEdit ? '수정 완료' : '등록하기'}
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default PartyFormPage;

const Container = styled.div`
  padding: 24px 20px 40px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #212529;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-top: 8px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const Half = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
`;

const SubmitButton = styled.button`
  margin-top: 16px;
  padding: 14px;
  background-color: #5f3dc4;
  color: #fff;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
