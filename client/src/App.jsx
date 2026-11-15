import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfileEditPage from './pages/ProfileEditPage'
import PartyFormPage from './pages/PartyFormPage'
import PartyDetailPage from './pages/PartyDetailPage'
import MyPartiesPage from './pages/MyPartiesPage'
import JoinPage from './pages/JoinPage'
import HostStatsPage from './pages/HostStatsPage'

const App = () => {
  // 로컬 스토리지의 토큰 존재 여부로 초기 로그인 상태 설정
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Routes>
      <Route element={<Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}>
        <Route path="/" element={<Home />} />
        {/* 회원관리 */}
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/mypage/edit" element={<ProfileEditPage setIsLoggedIn={setIsLoggedIn} />} />
        {/* 핵심 데이터(파티 모집글) */}
        <Route path="/write" element={<PartyFormPage />} />
        <Route path="/party/:id" element={<PartyDetailPage />} />
        <Route path="/party/:id/edit" element={<PartyFormPage />} />
        <Route path="/mypage/parties" element={<MyPartiesPage />} />
        {/* parties JOIN users 결과 조회 메뉴 */}
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/stats" element={<HostStatsPage />} />
      </Route>
    </Routes>
  )
}

export default App
