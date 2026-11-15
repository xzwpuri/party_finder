import { useState, useEffect } from 'react';
import styled from 'styled-components';

// [JOIN 결과 조회 메뉴 2] users LEFT JOIN parties + GROUP BY
// 회원별 모집글 수 / 모집중 글 수 / 마지막 등록일
const HostStatsPage = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/parties/host-stats');
        if (response.ok) setRows(await response.json());
      } catch (error) {
        console.error('모집자 통계 조회 오류:', error);
      }
    };
    load();
  }, []);

  return (
    <Container>
      <Title>모집자 활동 통계</Title>
      <Desc>users 테이블과 parties 테이블을 LEFT JOIN 하고 회원별로 집계(GROUP BY)한 결과입니다.</Desc>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>순위</th>
              <th>닉네임</th>
              <th>학번(입학년도)</th>
              <th>모집글 수</th>
              <th>모집중</th>
              <th>마지막 등록</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6}>데이터가 없습니다.</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.user_id}>
                <td>{i + 1}</td>
                <td>{r.nickname}</td>
                <td>{r.student_id} ({r.entry_year})</td>
                <td>{r.party_count}</td>
                <td>{Number(r.open_count)}</td>
                <td>{r.last_posted || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Container>
  );
};

export default HostStatsPage;

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

  tbody tr:hover {
    background: #f3f0ff;
  }
`;
