import { useState } from 'react';
import { Zap, Droplets, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, role: string, ma_ho: string | null) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Sai tên đăng nhập hoặc mật khẩu');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      // ma_ho: null cho admin, mã phòng cho user thường
      if (data.ma_ho) {
        localStorage.setItem('ma_ho', data.ma_ho);
      } else {
        localStorage.removeItem('ma_ho');
      }
      onLogin(data.username, data.role, data.ma_ho ?? null);
    } catch {
      // Fallback: demo mode (khi backend không chạy)
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('token', 'demo-admin');
        localStorage.setItem('username', 'admin');
        localStorage.setItem('role', 'admin');
        localStorage.removeItem('ma_ho');
        onLogin('admin', 'admin', null);
      } else if (username === 'user1' && password === 'user123') {
        localStorage.setItem('token', 'demo-user');
        localStorage.setItem('username', 'user1');
        localStorage.setItem('role', 'user');
        localStorage.setItem('ma_ho', 'HO-001');
        onLogin('user1', 'user', 'HO-001');
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu');
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003BBE] via-[#0055D4] to-[#0068FF] flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/10">
            <div className="flex gap-1">
              <Zap size={18} className="text-amber-300 fill-amber-300" />
              <Droplets size={18} className="text-sky-300 fill-sky-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Điện Nước</h1>
          <p className="text-sm text-white/60 mt-1">Hệ thống quản lý hóa đơn có tích hợp AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/20">
          <h2 className="text-lg font-bold text-[#141415] mb-1">Đăng nhập</h2>
          <p className="text-xs text-gray-400 mb-5">Nhập tài khoản để tiếp tục</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="admin hoặc user1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-[#141415] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#0068FF] transition-colors"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-[#141415] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#0068FF] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${isLoading
                  ? 'bg-[#0068FF]/70 text-white cursor-wait'
                  : 'bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-lg shadow-blue-200 active:scale-[0.98]'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center mb-2.5 uppercase tracking-wider font-semibold">Tài khoản demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setUsername('admin'); setPassword('admin123'); setError(''); }}
                className="py-2 rounded-lg bg-blue-50 text-[11px] font-semibold text-[#0068FF] hover:bg-blue-100 transition-colors"
              >
                👑 Admin
              </button>
              <button
                onClick={() => { setUsername('user1'); setPassword('user123'); setError(''); }}
                className="py-2 rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                👤 User
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/30 mt-6">
          v1.0.0 © Nhóm 5 — Hệ thống Quản lý Điện Nước có tích hợp AI
        </p>
      </div>
    </div>
  );
}
