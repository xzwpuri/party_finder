import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABEL, formatPlayTime } from '../utils';

// [JOIN 결과 조회 메뉴] parties JOIN users
// SELECT ... FROM parties p INNER JOIN users u ON p.host_id = u.id
const JoinPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/parties/with-hosts');
        if (response.ok) setRows(await response.json());
      } catch (error) {
        console.error('JOIN 조회 오류:', error);
      }
    };
    load();
  }, []);

  return (
    <Container>
      <Title>모집자별 파티 현황</Title>
      <Desc>parties 테이블과 users 테이블을 JOIN 한 결과입니다.</Desc>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>모집글</th>
              <th>게임</th>
              <th>시간</th>
              <th>인원</th>
              <th>상태</th>
              <th>모집자</th>
              <th>학번(입학년도)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7}>데이터가 없습니다.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.party_id} onClick={() => navigate(`/party/${r.party_id}`)}>
                <td>{r.title}</td>
                <td>{r.game}</td>
                <td>{formatPlayTime(r.play_time)}</td>
                <td>{r.current_members}/{r.max_members}</td>
                <td>{STATUS_LABEL[r.status]}</td>
                <td>{r.host_nickname}</td>
                <td>{r.host_student_id} ({r.host_entry_year})</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Container>
  );
};

export default JoinPage;

const Container = styled.div`
  padding: 24px 16px;
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 6px;
`;

const Desc = styled.p`
  font-size: 12px;
  color: #868e96;
  margin-bottom: 16px;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  table-layout: auto;
  font-size: 13px;

  th, td {
    padding: 10px 8px;
    border-bottom: 1px solid #f1f3f5;
    text-align: left;
    white-space: nowrap;
  }

  th {
    background: #f8f9fa;
    color: #495057;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background: #f3f0ff;
  }
`;
