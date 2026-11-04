import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABEL, formatPlayTime, timeAgo } from '../utils';

// 목록(메인, 내 모집글)에서 공통으로 쓰는 카드
const PartyCard = ({ party }) => {
  const navigate = useNavigate();
  return (
    <Card onClick={() => navigate(`/party/${party.id}`)}>
      <TopRow>
        <GameTag>{party.game}</GameTag>
        <ModeTag>{party.mode}</ModeTag>
        <Status $status={party.status}>{STATUS_LABEL[party.status]}</Status>
      </TopRow>
      <Title>{party.title}</Title>
      <Meta>
        <span>🕘 {formatPlayTime(party.play_time)}</span>
        <Dot>•</Dot>
        <span>👥 {party.current_members}/{party.max_members}명</span>
        {party.tier && (<><Dot>•</Dot><span>{party.tier}</span></>)}
      </Meta>
      <Meta>
        <span>{party.host_nickname}</span>
        <Dot>•</Dot>
        <span>{timeAgo(party.created_at)}</span>
      </Meta>
    </Card>
  );
};

export default PartyCard;

const Card = styled.article`
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;

  &:active {
    background-color: #f8f9fa;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
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

const Status = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$status === 'OPEN' ? '#2b8a3e' : '#868e96')};
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #868e96;
  margin-top: 4px;
`;

const Dot = styled.span`
  margin: 0 5px;
`;
