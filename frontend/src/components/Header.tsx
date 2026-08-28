import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  maPhong: string;
  tenChuHo: string;
  currentPeriod: string;
  desktop?: boolean;
}

export default function Header({ maPhong, tenChuHo, currentPeriod, desktop = false }: HeaderProps) {
  const [year, month] = currentPeriod.split('-');
  const periodLabel = `Kỳ T${parseInt(month)}/${year}`;

  if (desktop) {
    // Desktop header — nằm ngang, tối giản hơn
    return (
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-[#141415]">
            Xin chào, <span className="text-[#0068FF]">{tenChuHo}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Phòng {maPhong} · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-notification-desktop"
            className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors relative"
          >
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            id="btn-menu-desktop"
            className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
          >
            <Menu size={18} className="text-gray-500" />
          </button>
        </div>
      </header>
    );
  }

  // Mobile header — gradient xanh với decorative circles
  return (
    <header className="bg-gradient-to-r from-[#0068FF] to-[#4A9EFF] text-white rounded-b-2xl px-4 pt-10 pb-5 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -left-6 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-sm font-bold">
            {maPhong.replace('P', '')}
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">{tenChuHo}</h1>
            <p className="text-xs text-white/70 mt-0.5">Phòng {maPhong} · {periodLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-notification-mobile"
            className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Bell size={18} />
          </button>
          <button
            id="btn-menu-mobile"
            className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
