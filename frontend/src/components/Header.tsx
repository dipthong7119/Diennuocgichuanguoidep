import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Shield, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface HeaderProps {
  maPhong: string;
  tenChuHo: string;
  currentPeriod: string;
  desktop?: boolean;
  username?: string;
  role?: string;
  onLogout?: () => void;
}

// Dữ liệu thông báo mẫu dựa trên hệ thống
const NOTIFICATIONS = [
  {
    id: 1,
    type: 'warning',
    title: 'Tiêu thụ nước tăng bất thường',
    desc: 'Phòng P102 tháng 8/2026 tăng 150% so với trung bình. Kiểm tra rò rỉ ngay.',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Hóa đơn tháng 8/2026 đã được tạo',
    desc: '5 hóa đơn tháng 8 đã sẵn sàng. 5 hóa đơn chưa thanh toán.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Thanh toán thành công',
    desc: 'Hóa đơn tháng 7/2026 đã được thanh toán đầy đủ.',
    time: 'Hôm qua',
    read: true,
  },
];

export default function Header({
  maPhong, tenChuHo, currentPeriod, desktop = false,
  username, role, onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const [year, month] = currentPeriod.split('-');
  const periodLabel = `Kỳ T${parseInt(month)}/${year}`;

  const isAdmin = role === 'admin';
  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const notifIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle size={14} className="text-amber-500" />;
    if (type === 'success') return <CheckCircle size={14} className="text-emerald-500" />;
    return <Info size={14} className="text-blue-500" />;
  };

  const notifBg = (type: string) => {
    if (type === 'warning') return 'bg-amber-50';
    if (type === 'success') return 'bg-emerald-50';
    return 'bg-blue-50';
  };

  // Panel thông báo
  const bellPanel = bellOpen && (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 z-[999] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#0068FF]" />
          <span className="text-sm font-semibold text-[#141415]">Thông báo</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-[#0068FF] hover:underline"
            >
              Đọc tất cả
            </button>
          )}
          <button
            onClick={() => setBellOpen(false)}
            className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl ${notifBg(n.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                {notifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[12px] font-semibold leading-tight ${!n.read ? 'text-[#141415]' : 'text-gray-500'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#0068FF] shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 text-center">
        <p className="text-[11px] text-gray-400">Dữ liệu phân tích từ AI hệ thống</p>
      </div>
    </div>
  );

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
              ? <> Xin chào, <span className="text-[#0068FF]">Quản trị viên</span></>
              : <> Xin chào, <span className="text-[#0068FF]">{tenChuHo}</span></>}
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

          {/* Bell button */}
          <div ref={bellRef} className="relative">
            <button
              id="btn-notification-desktop"
              onClick={() => { setBellOpen(!bellOpen); setMenuOpen(false); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative ${bellOpen ? 'bg-[#0068FF] text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            {bellPanel}
          </div>

          <button
            id="btn-menu-desktop"
            onClick={() => { setMenuOpen(!menuOpen); setBellOpen(false); }}
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
          {/* Bell button mobile */}
          <div ref={bellRef} className="relative">
            <button
              id="btn-notification-mobile"
              onClick={() => { setBellOpen(!bellOpen); setMenuOpen(false); }}
              className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              )}
            </button>
            {bellPanel}
          </div>

          <button
            id="btn-menu-mobile"
            onClick={() => { setMenuOpen(!menuOpen); setBellOpen(false); }}
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
