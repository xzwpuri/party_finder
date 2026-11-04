import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PartyCard from '../components/PartyCard';
import { authHeader } from '../utils';

// 마이페이지 > 내 모집글
const MyPartiesPage = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { state: { redirectTo: '/mypage/parties' } });
      return;
    }
    const load = async () => {
      try {
        const response = await fetch('/api/parties/mine', { headers: authHeader() });
        if (response.ok) setParties(await response.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div>
      <Title>내 모집글</Title>
      {!loading && parties.length === 0 && <Empty>만든 파티가 없습니다.</Empty>}
      {parties.map((party) => (
        <PartyCard key={party.id} party={party} />
      ))}
    </div>
  );
};

export default MyPartiesPage;

const Title = styled.h2`
  font-size: 20px;
  padding: 24px 16px 12px;
`;

const Empty = styled.p`
  padding: 40px 0;
  text-align: center;
  color: #868e96;
  font-size: 14px;
`;
