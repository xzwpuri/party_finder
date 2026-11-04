import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { authHeader, getMyId, formatPlayTime, timeAgo, STATUS_LABEL } from '../utils';

const PartyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/parties/${id}`);
        if (!response.ok) {
          setNotFound(true);
          return;
        }
        setParty(await response.json());
      } catch (error) {
        console.error('상세 조회 오류:', error);
      }
    };
    load();
  }, [id]);

  if (notFound) return <Message>존재하지 않는 모집글입니다.</Message>;
  if (!party) return <Message>불러오는 중...</Message>;

  // 본인이 작성한 글일 때만 수정/삭제/상태변경 노출 (서버에서도 한번 더 검사함)
  const isMine = party.host_id === getMyId();

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    const response = await fetch(`/api/parties/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setParty((prev) => ({ ...prev, status }));
    else alert((await response.json()).message || '상태 변경 실패');
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const response = await fetch(`/api/parties/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    const data = await response.json();
    alert(data.message);
    if (response.ok) navigate('/');
  };

  return (
    <Container>
      <Tags>
        <GameTag>{party.game}</GameTag>
        <ModeTag>{party.mode}</ModeTag>
        {party.tier && <ModeTag>{party.tier}</ModeTag>}
      </Tags>
      <Title>{party.title}</Title>
      <Meta>{party.host_nickname} · {timeAgo(party.created_at)}</Meta>

      <InfoBox>
        <InfoItem><b>플레이 시간</b><span>{formatPlayTime(party.play_time)}</span></InfoItem>
        <InfoItem><b>인원</b><span>{party.current_members} / {party.max_members}명</span></InfoItem>
        <InfoItem>
          <b>모집 상태</b>
          {isMine ? (
            <StatusSelect value={party.status} onChange={handleStatusChange}>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </StatusSelect>
          ) : (
            <span>{STATUS_LABEL[party.status]}</span>
          )}
        </InfoItem>
      </InfoBox>

      <Description>{party.description}</Description>

      {/* http(s) 링크만 렌더링 (서버에서도 검증함) */}
      {party.discord_link && /^https?:\/\//i.test(party.discord_link) && (
        <DiscordLink href={party.discord_link} target="_blank" rel="noopener noreferrer">
          디스코드로 참여하기
        </DiscordLink>
      )}

      {isMine && (
        <Buttons>
          <EditButton onClick={() => navigate(`/party/${id}/edit`)}>수정</EditButton>
          <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
        </Buttons>
      )}
    </Container>
  );
};

export default PartyDetailPage;

const Container = styled.div`
  padding: 20px;
`;

const Message = styled.p`
  padding: 60px 0;
  text-align: center;
  color: #868e96;
`;

const Tags = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
`;

const GameTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #5f3dc4;
  background: #f3f0ff;
  padding: 2px 8px;
  border-radius: 4px;
`;

const ModeTag = styled.span`
  font-size: 12px;
  color: #495057;
  background: #f1f3f5;
  padding: 2px 8px;
  border-radius: 4px;
`;

const Title = styled.h2`
  font-size: 20px;
  color: #212529;
`;

const Meta = styled.p`
  font-size: 12px;
  color: #868e96;
  margin-top: 6px;
`;

const InfoBox = styled.div`
  margin-top: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 4px 14px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;

  & + & {
    border-top: 1px solid #f1f3f5;
  }

  b {
    color: #495057;
    font-weight: 600;
  }
`;

const StatusSelect = styled.select`
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
`;

const Description = styled.p`
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #343a40;
`;

const DiscordLink = styled.a`
  display: block;
  margin-top: 20px;
  padding: 12px;
  text-align: center;
  background: #5865f2;
  color: #fff;
  border-radius: 6px;
  font-weight: bold;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 28px;
`;

const EditButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  background: #5f3dc4;
  color: #fff;
  font-weight: bold;
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  background: #fff5f5;
  color: #e03131;
  font-weight: bold;
`;
