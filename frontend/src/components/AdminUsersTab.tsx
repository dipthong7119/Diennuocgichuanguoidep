import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MapPin, Phone, Search, Send, ShieldCheck, Users } from 'lucide-react';

interface UserRow {
  username: string;
  role: string;
  ma_ho: string | null;
  ten_nguoi_dung: string;
  ma_phong: string | null;
  so_dien_thoai: string | null;
  dia_chi: string | null;
}

interface Props {
  onSessionExpired?: () => void;
}

interface SmsFeedback {
  success: boolean;
  message: string;
}

export default function AdminUsersTab({ onSessionExpired }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [smsReady, setSmsReady] = useState(false);
  const [trialMode, setTrialMode] = useState(false);
  const [smsIssues, setSmsIssues] = useState<string[]>([]);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<SmsFeedback | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/auth/users', { headers })
      .then(async usersResponse => {
        if (usersResponse.status === 401) {
          onSessionExpired?.();
          return;
        }
        if (!usersResponse.ok) throw new Error('Không tải được danh sách người dùng.');
        const userData = await usersResponse.json();
        setUsers(Array.isArray(userData) ? userData : []);
      })
      .catch(() => setError('Không tải được thông tin người dùng.'))
      .finally(() => setLoading(false));

    fetch('/thong-ke/nhac-no/trang-thai', { headers })
      .then(async response => {
        if (response.status === 401) {
          onSessionExpired?.();
          return;
        }
        if (!response.ok) return;
        const smsStatus = await response.json();
        setSenderPhone(typeof smsStatus.sender === 'string' ? smsStatus.sender : '');
        setSmsReady(Boolean(smsStatus.ready));
        setTrialMode(Boolean(smsStatus.trial_mode));
        setSmsIssues(Array.isArray(smsStatus.issues) ? smsStatus.issues : []);
      })
      .catch(() => undefined);
  }, [onSessionExpired]);

  async function sendSms() {
    const token = localStorage.getItem('token');
    if (!token || sendingSms || !smsReady || !recipientPhone.trim()) return;

    setSendingSms(true);
    setSmsFeedback(null);
    try {
      const response = await fetch('/thong-ke/nhac-no/gui-mot', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_phone: recipientPhone }),
      });
      if (response.status === 401) {
        onSessionExpired?.();
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Không gửi được SMS.');
      setSmsFeedback({
        success: true,
        message: `Twilio đã nhận yêu cầu gửi tới ${result.recipient}. Kiểm tra mục Logs để xem trạng thái phát tin.`,
      });
    } catch (sendError) {
      setSmsFeedback({
        success: false,
        message: sendError instanceof Error ? sendError.message : 'Gửi SMS thất bại.',
      });
    } finally {
      setSendingSms(false);
    }
  }

  function selectRecipient(phone: string) {
    setRecipientPhone(phone);
    setSmsFeedback(null);
    document.getElementById('sms-recipient')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return users;
    return users.filter(user =>
      [user.username, user.ten_nguoi_dung, user.ma_phong, user.so_dien_thoai, user.dia_chi]
        .some(value => (value || '').toLocaleLowerCase('vi').includes(query)),
    );
  }, [users, search]);

  const tenantCount = users.filter(user => user.role !== 'admin').length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-medium text-[#0068FF]">Quản lý tài khoản</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#141415]">Danh sách người dùng</h1>
        <p className="mt-1 text-sm text-gray-500">Thông tin tài khoản và người thuê theo từng phòng.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0068FF]"><Users size={18} /></span>
          <div><p className="text-xs text-gray-500">Tổng tài khoản</p><p className="mt-1 text-xl font-bold text-[#141415]">{users.length}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><ShieldCheck size={18} /></span>
          <div><p className="text-xs text-gray-500">Người thuê</p><p className="mt-1 text-xl font-bold text-[#141415]">{tenantCount}</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#141415]">Thông tin SMS</h2>
        <p className="mt-1 text-xs text-gray-500">
          {trialMode
            ? 'Tài khoản Trial gửi mẫu Appointment Reminders tới số đã xác minh; để gửi nội dung riêng cần nâng cấp Twilio.'
            : 'Nhập số nhận hoặc bấm số điện thoại người thuê bên dưới để điền nhanh. Nội dung SMS được tạo sẵn.'}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-gray-600">
            Số nhận (To)
            <input
              id="sms-recipient"
              type="tel"
              autoComplete="tel"
              placeholder="09xxxxxxxx hoặc +849xxxxxxxx"
              value={recipientPhone}
              onChange={event => setRecipientPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0068FF]"
            />
          </label>
          <label className="text-xs text-gray-600">
            Số gửi (From)
            <input
              type="text"
              readOnly
              placeholder={trialMode ? 'Twilio tự chọn số gửi cho số nhận' : 'Số Twilio đã cấu hình'}
              value={senderPhone}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={sendSms}
          disabled={!smsReady || sendingSms || !recipientPhone.trim()}
          className="mt-3 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0068FF] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {sendingSms ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
          {sendingSms ? 'Đang gửi…' : 'Gửi SMS'}
        </button>
        {!smsReady && smsIssues.length > 0 && (
          <p className="mt-2 text-xs text-amber-700">{smsIssues.join(' ')}</p>
        )}
        {smsFeedback && (
          <p role={smsFeedback.success ? 'status' : 'alert'} className={`mt-2 text-xs ${smsFeedback.success ? 'text-emerald-700' : 'text-rose-700'}`}>
            {smsFeedback.message}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#141415]">Tài khoản và thông tin phòng</h2>
            <p className="mt-1 text-xs text-gray-500">Chỉ quản trị viên xem được bảng này.</p>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Tìm tên, tài khoản, phòng…"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0068FF]"
            />
          </label>
        </div>

        {error && <p role="alert" className="px-5 py-3 text-sm text-rose-600">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Tài khoản</th>
                <th className="px-4 py-3 font-medium">Người dùng</th>
                <th className="px-4 py-3 font-medium">Phòng</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Địa chỉ</th>
                <th className="px-5 py-3 text-right font-medium">Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(user => (
                <tr key={user.username} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30">
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{user.username}</td>
                  <td className="px-4 py-3 font-medium text-[#141415]">{user.ten_nguoi_dung}</td>
                  <td className="px-4 py-3 text-gray-600">{user.ma_phong || '—'}</td>
                  <td className="px-4 py-3">
                    {user.so_dien_thoai ? (
                      <button
                        type="button"
                        title="Bấm để điền số này vào ô nhận SMS"
                        onClick={() => selectRecipient(user.so_dien_thoai!)}
                        className="inline-flex items-center gap-1.5 text-[#0068FF] hover:underline"
                      >
                        <Phone size={13} />{user.so_dien_thoai}
                      </button>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-xs text-gray-500">
                    {user.dia_chi ? <span className="inline-flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 shrink-0" />{user.dia_chi}</span> : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người thuê'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && visibleUsers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Không tìm thấy người dùng phù hợp.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Đang tải danh sách…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
