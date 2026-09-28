import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { formatThang } from '../data/mockData';

interface RankingItem {
  ma_ho: string;
  ma_phong: string;
  ten_chu_ho: string;
  tieu_thu: number;
  loai: string;
}

export default function AdminDashboardTable({ token }: { token: string | null }) {
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [loai, setLoai] = useState<'Dien' | 'Nuoc'>('Dien');
  const [thang, setThang] = useState('');
  const [sapXep, setSapXep] = useState<'giam_dan' | 'tang_dan'>('giam_dan');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams({ loai, sap_xep: sapXep });
    if (thang) params.append('thang', thang);
    setIsLoading(true);

    fetch(`/thong-ke/xep-hang?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setRankingData(Array.isArray(data) ? data : []))
      .catch(() => setRankingData([]))
      .finally(() => setIsLoading(false));
  }, [loai, sapXep, thang, token]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy size={17} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#141415]">Xếp hạng tiêu thụ</h2>
            <p className="mt-0.5 text-xs text-gray-500">So sánh mức sử dụng giữa các phòng</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Loại tiêu thụ"
            value={loai}
            onChange={event => setLoai(event.target.value as 'Dien' | 'Nuoc')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0068FF]"
          >
            <option value="Dien">Điện</option>
            <option value="Nuoc">Nước</option>
          </select>
          <input
            aria-label="Kỳ xếp hạng"
            type="month"
            value={thang}
            onChange={event => setThang(event.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0068FF]"
          />
          <select
            aria-label="Thứ tự xếp hạng"
            value={sapXep}
            onChange={event => setSapXep(event.target.value as 'giam_dan' | 'tang_dan')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0068FF]"
          >
            <option value="giam_dan">Cao nhất</option>
            <option value="tang_dan">Thấp nhất</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              <th className="w-20 px-5 py-3 font-medium">Hạng</th>
              <th className="px-4 py-3 font-medium">Phòng</th>
              <th className="px-4 py-3 font-medium">Chủ hộ</th>
              <th className="px-5 py-3 text-right font-medium">Tiêu thụ</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((item, index) => (
              <tr key={item.ma_ho} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70">
                <td className="px-5 py-3">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>{index + 1}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-[#141415]">{item.ma_phong}</td>
                <td className="px-4 py-3 text-gray-600">{item.ten_chu_ho}</td>
                <td className="px-5 py-3 text-right font-semibold text-[#0068FF]">
                  {item.tieu_thu} {item.loai === 'Dien' ? 'kWh' : 'm³'}
                </td>
              </tr>
            ))}
            {!isLoading && rankingData.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Chưa có dữ liệu cho kỳ này.</td></tr>
            )}
            {isLoading && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Đang tải dữ liệu…</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {thang && <p className="px-5 py-3 text-xs text-gray-400">Kỳ {formatThang(thang)}</p>}
    </section>
  );
}
