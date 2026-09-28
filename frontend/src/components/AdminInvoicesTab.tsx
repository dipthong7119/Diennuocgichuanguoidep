import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CircleDollarSign, FileText, Filter, Search } from 'lucide-react';
import { formatThang } from '../data/mockData';

interface Room {
  MaHo: string;
  MaPhong: string;
}

interface InvoiceRow {
  ma_hoa_don: string;
  ma_ho: string;
  ma_phong: string;
  ten_chu_ho: string;
  thang_nam: string;
  tong_tien: number;
  trang_thai_thanh_toan: boolean;
}

interface Props {
  onSessionExpired?: () => void;
}

const money = (amount: number) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;

export default function AdminInvoicesTab({ onSessionExpired }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState('');
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/ho-gia-dinh/', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (response.status === 401) { onSessionExpired?.(); return []; }
        if (!response.ok) throw new Error('Không tải được danh sách phòng.');
        return response.json();
      })
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setError('Không tải được danh sách phòng.'));
  }, [onSessionExpired]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const params = new URLSearchParams();
    if (year) params.set('nam', year);
    if (month) params.set('thang', month);
    if (roomId) params.set('ma_ho', roomId);
    if (status) params.set('trang_thai', status);

    setLoading(true);
    setError('');
    fetch(`/thong-ke/hoa-don-loc?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        if (response.status === 401) { onSessionExpired?.(); return []; }
        if (!response.ok) throw new Error('Không tải được danh sách hóa đơn.');
        return response.json();
      })
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => { setInvoices([]); setError('Không tải được danh sách hóa đơn.'); })
      .finally(() => setLoading(false));
  }, [year, month, roomId, status, onSessionExpired]);

  const visibleInvoices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return invoices;
    return invoices.filter(invoice =>
      [invoice.ma_hoa_don, invoice.ma_phong, invoice.ten_chu_ho]
        .some(value => value.toLocaleLowerCase('vi').includes(query)),
    );
  }, [invoices, search]);

  const collected = visibleInvoices.reduce((sum, invoice) =>
    sum + (invoice.trang_thai_thanh_toan ? invoice.tong_tien : 0), 0);
  const outstanding = visibleInvoices.reduce((sum, invoice) =>
    sum + (!invoice.trang_thai_thanh_toan ? invoice.tong_tien : 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#0068FF]">Quản lý thu tiền</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#141415]">Danh sách hóa đơn</h1>
          <p className="mt-1 text-sm text-gray-500">Lọc hóa đơn theo phòng, kỳ và tình trạng thu.</p>
        </div>
        <div className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
          <CalendarDays size={14} className="mr-1.5 inline" />Năm {year || 'tất cả'}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500"><FileText size={15} />Số hóa đơn</div>
          <p className="mt-2 text-2xl font-bold text-[#141415]">{visibleInvoices.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700"><CircleDollarSign size={15} />Đã thu</div>
          <p className="mt-2 text-xl font-bold text-emerald-800">{money(collected)}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-700"><CircleDollarSign size={15} />Còn phải thu</div>
          <p className="mt-2 text-xl font-bold text-rose-800">{money(outstanding)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#141415]">
            <Filter size={16} className="text-[#0068FF]" />Bộ lọc hóa đơn
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <input
              aria-label="Năm"
              type="number"
              min="2000"
              max="2100"
              placeholder="Năm"
              value={year}
              onChange={event => setYear(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0068FF]"
            />
            <select value={month} onChange={event => setMonth(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0068FF]">
              <option value="">Tất cả các tháng</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>
              ))}
            </select>
            <select value={roomId} onChange={event => setRoomId(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0068FF]">
              <option value="">Tất cả các phòng</option>
              {rooms.map(room => <option key={room.MaHo} value={room.MaHo}>{room.MaPhong}</option>)}
            </select>
            <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0068FF]">
              <option value="">Mọi trạng thái</option>
              <option value="da_thu">Đã thu</option>
              <option value="chua_thu">Chưa thu</option>
            </select>
            <label className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Tìm mã, phòng, chủ hộ"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0068FF]"
              />
            </label>
          </div>
        </div>

        {error && <p role="alert" className="px-5 py-3 text-sm text-rose-600">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Mã hóa đơn</th>
                <th className="px-4 py-3 font-medium">Phòng</th>
                <th className="px-4 py-3 font-medium">Chủ hộ</th>
                <th className="px-4 py-3 font-medium">Kỳ hóa đơn</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                <th className="px-5 py-3 text-center font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.map(invoice => (
                <tr key={invoice.ma_hoa_don} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{invoice.ma_hoa_don}</td>
                  <td className="px-4 py-3 font-semibold text-[#141415]">{invoice.ma_phong}</td>
                  <td className="px-4 py-3 text-gray-600">{invoice.ten_chu_ho}</td>
                  <td className="px-4 py-3">{formatThang(invoice.thang_nam)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(invoice.tong_tien)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${invoice.trang_thai_thanh_toan ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {invoice.trang_thai_thanh_toan ? 'Đã thu' : 'Chưa thu'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && visibleInvoices.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Không có hóa đơn khớp với bộ lọc.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Đang tải hóa đơn…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
