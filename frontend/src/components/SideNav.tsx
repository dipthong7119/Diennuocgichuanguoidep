import { LayoutDashboard, ClipboardEdit, Receipt, Zap, Droplets } from 'lucide-react';
import type { TabId } from '../types';

interface SideNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; desc: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tổng quan', desc: 'Thống kê & biểu đồ', icon: LayoutDashboard },
  { id: 'meter', label: 'Nhập số', desc: 'Cập nhật chỉ số', icon: ClipboardEdit },
  { id: 'bill', label: 'Hóa đơn', desc: 'Chi tiết & thanh toán', icon: Receipt },
];

export default function SideNav({ activeTab, onTabChange }: SideNavProps) {
  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#003BBE] to-[#0068FF] flex flex-col shadow-xl">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="flex gap-0.5">
              <Zap size={12} className="text-amber-300 fill-amber-300" />
              <Droplets size={12} className="text-sky-300 fill-sky-300" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Điện Nước</h1>
            <p className="text-[10px] text-white/60 mt-0.5">Quản lý hóa đơn AI</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ id, label, desc, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#0068FF] shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isActive ? 'bg-[#0068FF]/10' : 'bg-white/10'
              }`}>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-[#0068FF]' : ''}`}>
                  {label}
                </p>
                <p className={`text-[10px] mt-0.5 ${isActive ? 'text-[#0068FF]/60' : 'text-white/40'}`}>
                  {desc}
                </p>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-5 bg-[#0068FF] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-[10px] text-white/40 text-center">
          v1.0.0 · Nhóm 5
        </p>
      </div>
    </aside>
  );
}
