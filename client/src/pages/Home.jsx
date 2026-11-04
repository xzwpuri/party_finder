import { useState, useEffect } from 'react';
import styled from 'styled-components';
import PartyCard from '../components/PartyCard';

const Home = () => {
  const [parties, setParties] = useState([]);
  const [selectedGame, setSelectedGame] = useState('전체');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 전체 목록 조회 (GET /api/parties) - 로그인 여부와 관계없이 모든 사용자의 글 표시
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await fetch('/api/parties');
        if (response.ok) setParties(await response.json());
      } catch (error) {
        console.error('목록 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParties();
  }, []);

  // 올라온 글에 있는 게임들로 필터 칩 만들기
  const games = ['전체', ...new Set(parties.map((p) => p.game))];

  const filtered = parties.filter(
    (p) => (selectedGame === '전체' || p.game === selectedGame) && (!onlyOpen || p.status === 'OPEN')
  );

  return (
    <Container>
      <GameNav>
        {games.map((game) => (
          <Chip key={game} $active={selectedGame === game} onClick={() => setSelectedGame(game)}>
            {game}
          </Chip>
        ))}
      </GameNav>

      <OptionRow>
        <label>
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> 모집중인 파티만 보기
        </label>
        <span>{filtered.length}개</span>
      </OptionRow>

      {!loading && filtered.length === 0 && <Empty>모집 중인 파티가 없습니다. 첫 파티를 만들어 보세요!</Empty>}
      {filtered.map((party) => (
        <PartyCard key={party.id} party={party} />
      ))}
    </Container>
  );
};

export default Home;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const GameNav = styled.nav`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${(p) => (p.$active ? '#5f3dc4' : '#e9ecef')};
  background-color: ${(p) => (p.$active ? '#5f3dc4' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : '#495057')};
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? '600' : '400')};
  cursor: pointer;
`;

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 13px;
  color: #868e96;
  border-bottom: 1px solid #f1f3f5;
`;

const Empty = styled.p`
  padding: 60px 16px;
  text-align: center;
  color: #868e96;
  font-size: 14px;
`;
