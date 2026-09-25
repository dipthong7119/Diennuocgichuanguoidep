import { useState } from 'react';
import type { TabId } from './types';
import { hoGiaDinhList, CURRENT_PERIOD } from './data/mockData';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav.tsx';
import DashboardTab from './components/DashboardTab';
import MeterTab from './components/MeterTab';
import BillTab from './components/BillTab';

interface AuthUser {
  username: string;
  role: string;
  ma_ho: string | null; // null = admin, "HO-001" = user thường
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Auth state — kiểm tra localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const ma_ho = localStorage.getItem('ma_ho'); // có thể null
    if (username && role && token) return { username, role, ma_ho };
    return null;
  });

  // Hàm xóa phiên và về màn hình đăng nhập (dùng khi gặp lỗi 401)
  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('ma_ho');
    setUser(null);
  }

  function handleLogin(username: string, role: string, ma_ho: string | null) {
    setUser({ username, role, ma_ho });
  }

  function handleLogout() {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('ma_ho');
    setUser(null);
  }

  // Chưa đăng nhập → hiện Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Header hiển thị phòng của user (admin → phòng đầu tiên, user → phòng của họ)
  const headerHo = user.ma_ho
    ? hoGiaDinhList.find(h => h.MaHo === user.ma_ho) ?? hoGiaDinhList[0]
    : hoGiaDinhList[0];

  return (
    <div className="min-h-screen bg-[#E9EBED]">
      {/* ── Mobile Layout (< md) ──────────────────────────────── */}
      <div className="flex flex-col min-h-screen md:hidden">
        <div className="w-full bg-[#F4F5F6] min-h-screen relative flex flex-col">
          <Header
            maPhong={headerHo.MaPhong}
            tenChuHo={headerHo.TenChuHo}
            currentPeriod={CURRENT_PERIOD}
            username={user.username}
            role={user.role}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto pt-4 pb-20">
            {activeTab === 'dashboard' && <DashboardTab userRole={user.role} userMaHo={user.ma_ho} onSessionExpired={clearSession} />}
            {activeTab === 'meter' && <MeterTab userMaHo={user.ma_ho} userRole={user.role} onSessionExpired={clearSession} />}
            {activeTab === 'bill' && <BillTab userMaHo={user.ma_ho} userRole={user.role} onSessionExpired={clearSession} />}
          </main>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userRole={user.role} />
        </div>
      </div>

      {/* ── Desktop Layout (≥ md) ─────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <SideNav activeTab={activeTab} onTabChange={setActiveTab} userRole={user.role} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Desktop Header */}
          <Header
            maPhong={headerHo.MaPhong}
            tenChuHo={headerHo.TenChuHo}
            currentPeriod={CURRENT_PERIOD}
            desktop
            username={user.username}
            role={user.role}
            onLogout={handleLogout}
          />

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto bg-[#F4F5F6]">
            <div className="max-w-5xl mx-auto py-6 px-4">
              {activeTab === 'dashboard' && <DashboardTab desktop userRole={user.role} userMaHo={user.ma_ho} onSessionExpired={clearSession} />}
              {activeTab === 'meter' && <MeterTab desktop userMaHo={user.ma_ho} userRole={user.role} onSessionExpired={clearSession} />}
              {activeTab === 'bill' && <BillTab desktop userMaHo={user.ma_ho} userRole={user.role} onSessionExpired={clearSession} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
