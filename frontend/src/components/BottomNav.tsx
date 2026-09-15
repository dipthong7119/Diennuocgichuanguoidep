import { LayoutDashboard, ClipboardEdit, Receipt } from 'lucide-react';
import type { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'meter', label: 'Nhập số', icon: ClipboardEdit },
  { id: 'bill', label: 'Hóa đơn', icon: Receipt },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-[#0068FF]'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#0068FF]/10' : ''
                }`}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
