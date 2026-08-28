import { useState } from 'react';
import type { TabId } from './types';
import { hoGiaDinhList, CURRENT_PERIOD } from './data/mockData';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav.tsx';
import DashboardTab from './components/DashboardTab';
import MeterTab from './components/MeterTab';
import BillTab from './components/BillTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Mặc định phòng đầu tiên
  const defaultHo = hoGiaDinhList[0];

  return (
    <div className="min-h-screen bg-[#E9EBED]">
      {/* ── Mobile Layout (< md) ──────────────────────────────── */}
      <div className="flex flex-col min-h-screen md:hidden">
        <div className="w-full bg-[#F4F5F6] min-h-screen relative flex flex-col">
          <Header
            maPhong={defaultHo.MaPhong}
            tenChuHo={defaultHo.TenChuHo}
            currentPeriod={CURRENT_PERIOD}
          />
          <main className="flex-1 overflow-y-auto pt-4 pb-20">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'meter' && <MeterTab />}
            {activeTab === 'bill' && <BillTab />}
          </main>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ── Desktop Layout (≥ md) ─────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <SideNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Desktop Header */}
          <Header
            maPhong={defaultHo.MaPhong}
            tenChuHo={defaultHo.TenChuHo}
            currentPeriod={CURRENT_PERIOD}
            desktop
          />

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto bg-[#F4F5F6]">
            <div className="max-w-5xl mx-auto py-6 px-4">
              {activeTab === 'dashboard' && <DashboardTab desktop />}
              {activeTab === 'meter' && <MeterTab desktop />}
              {activeTab === 'bill' && <BillTab desktop />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
