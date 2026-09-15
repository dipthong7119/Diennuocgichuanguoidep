import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Shield, X } from 'lucide-react';

interface HeaderProps {
  maPhong: string;
  tenChuHo: string;
  currentPeriod: string;
  desktop?: boolean;
  username?: string;
  role?: string;
  onLogout?: () => void;
}

export default function Header({
  maPhong, tenChuHo, currentPeriod, desktop = false,
  username, role, onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [year, month] = currentPeriod.split('-');
  const periodLabel = `Kỳ T${parseInt(month)}/${year}`;

  const isAdmin = role === 'admin';

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const userMenu = menuOpen && (
    <div
      ref={menuRef}
      className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 z-[999] overflow-hidden ${desktop ? '' : 'mr-4'}`}
    >
      {/* User info */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
            {isAdmin ? '👑' : '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#141415] truncate">{username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <Shield size={10} /> Quản trị viên
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  <User size={10} /> Người dùng
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Permissions */}
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Quyền hạn</p>
        <div className="space-y-1.5">
          {isAdmin ? (
            <>
              <PermRow icon="✅" text="CRUD Hộ gia đình & Đồng hồ" />
              <PermRow icon="✅" text="Nhập chỉ số & Thanh toán" />
              <PermRow icon="✅" text="Xem tất cả phòng & Dashboard" />
              <PermRow icon="✅" text="Gọi AI phân tích tất cả phòng" />
            </>
          ) : (
            <>
              <PermRow icon="✅" text="Xem hóa đơn phòng mình" />
              <PermRow icon="✅" text="Xem phân tích AI" />
              <PermRow icon="❌" text="Không thể CRUD / Nhập chỉ số" muted />
              <PermRow icon="❌" text="Không xem được phòng khác" muted />
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors active:scale-[0.98]"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  if (desktop) {
    return (
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm relative">
        <div>
          <h2 className="text-sm font-semibold text-[#141415]">
            {isAdmin
              ? <>Xin chào, <span className="text-[#0068FF]">Quản trị viên</span></>
              : <>Xin chào, <span className="text-[#0068FF]">{tenChuHo}</span></>}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isAdmin ? 'Quản trị hệ thống' : `Phòng ${maPhong} · ${periodLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* User badge */}
          <div className={`hidden lg:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full ${isAdmin ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            {isAdmin ? <Shield size={12} /> : <User size={12} />}
            {username} ({isAdmin ? 'Admin' : 'User'})
          </div>
          <button
            id="btn-notification-desktop"
            className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors relative"
          >
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            id="btn-menu-desktop"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${menuOpen ? 'bg-[#0068FF] text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
          >
            <Menu size={18} />
          </button>
          {userMenu}
        </div>
      </header>
    );
  }

  // Mobile header
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
            {isAdmin ? (
              <>
                <h1 className="text-base font-semibold leading-tight">Quản trị viên</h1>
                <p className="text-xs text-white/70 mt-0.5">Quản trị hệ thống · {periodLabel}</p>
              </>
            ) : (
              <>
                <h1 className="text-base font-semibold leading-tight">{tenChuHo}</h1>
                <p className="text-xs text-white/70 mt-0.5">Phòng {maPhong} · {periodLabel}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            id="btn-notification-mobile"
            className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Bell size={18} />
          </button>
          <button
            id="btn-menu-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-9 h-9 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors ${menuOpen ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'}`}
          >
            <Menu size={18} />
          </button>
          {userMenu}
        </div>
      </div>
    </header>
  );
}

function PermRow({ icon, text, muted = false }: { icon: string; text: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs">{icon}</span>
      <span className={`text-[11px] ${muted ? 'text-gray-400' : 'text-gray-600'}`}>{text}</span>
    </div>
  );
}
