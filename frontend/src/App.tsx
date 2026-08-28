import { useState } from 'react';
import type { TabId } from './types';
import { hoGiaDinhList, CURRENT_PERIOD } from './data/mockData';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardTab from './components/DashboardTab';
import MeterTab from './components/MeterTab';
import BillTab from './components/BillTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Mặc định phòng đầu tiên
  const defaultHo = hoGiaDinhList[0];

  return (
    <div className="min-h-screen bg-[#E9EBED] flex justify-center">
      <div className="w-full max-w-md bg-[#F4F5F6] min-h-screen relative flex flex-col">
        {/* Header */}
        <Header
          maPhong={defaultHo.MaPhong}
          tenChuHo={defaultHo.TenChuHo}
          currentPeriod={CURRENT_PERIOD}
        />

        {/* Content area — scrollable */}
        <main className="flex-1 overflow-y-auto pt-4 pb-20">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'meter' && <MeterTab />}
          {activeTab === 'bill' && <BillTab />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
