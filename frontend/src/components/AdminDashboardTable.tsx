import { useState, useEffect } from 'react';
import { Trophy, Filter, Search, Calendar } from 'lucide-react';
import { formatVND, formatThang } from '../data/mockData';

export default function AdminDashboardTable({ token }: { token: string | null }) {
  const [activeTab, setActiveTab] = useState<'ranking' | 'invoices'>('ranking');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);

  // Filtering state
  const [rankingLoai, setRankingLoai] = useState<'Dien' | 'Nuoc'>('Dien');
  const [rankingThang, setRankingThang] = useState('');
  const [rankingSapXep, setRankingSapXep] = useState<'giam_dan' | 'tang_dan'>('giam_dan');

  const [invoiceNam, setInvoiceNam] = useState('');
  const [invoiceThang, setInvoiceThang] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);

    if (activeTab === 'ranking') {
      const params = new URLSearchParams({ loai: rankingLoai, sap_xep: rankingSapXep });
      if (rankingThang) params.append('thang', rankingThang);

      fetch(`/thong-ke/xep-hang?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setRankingData(data) : setRankingData([]))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      const params = new URLSearchParams();
      if (invoiceNam) params.append('nam', invoiceNam);
      if (invoiceThang) params.append('thang', invoiceThang);

      fetch(`/thong-ke/hoa-don-loc?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setInvoiceData(data) : setInvoiceData([]))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [activeTab, rankingLoai, rankingThang, rankingSapXep, invoiceNam, invoiceThang, token]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-[#141415]">Quản lý nâng cao</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ranking' ? 'bg-white text-[#0068FF] shadow-sm' : 'text-gray-500'
            }`}
          >
            Xếp hạng
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'invoices' ? 'bg-white text-[#0068FF] shadow-sm' : 'text-gray-500'
            }`}
          >
            Hóa đơn
          </button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'ranking' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <select 
                value={rankingLoai} 
                onChange={(e) => setRankingLoai(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF]"
              >
                <option value="Dien">Điện</option>
                <option value="Nuoc">Nước</option>
              </select>
              <input 
                type="month" 
                value={rankingThang} 
                onChange={(e) => setRankingThang(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF]"
              />
              <select 
                value={rankingSapXep} 
                onChange={(e) => setRankingSapXep(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF]"
              >
                <option value="giam_dan">Cao nhất</option>
                <option value="tang_dan">Thấp nhất</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-3 px-4 font-medium w-16">Top</th>
                    <th className="py-3 px-4 font-medium">Phòng</th>
                    <th className="py-3 px-4 font-medium">Chủ hộ</th>
                    <th className="py-3 px-4 font-medium">Tiêu thụ</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item, idx) => (
                    <tr key={item.ma_ho} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {idx < 3 ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-gray-300' : 'bg-amber-700'
                          }`}>
                            {idx + 1}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-semibold pl-2">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#141415]">{item.ma_phong}</td>
                      <td className="py-3 px-4 text-gray-600">{item.ten_chu_ho}</td>
                      <td className="py-3 px-4 font-bold text-[#0068FF]">
                        {item.tieu_thu} {item.loai === 'Dien' ? 'kWh' : 'm³'}
                      </td>
                    </tr>
                  ))}
                  {rankingData.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <input 
                type="number" 
                placeholder="Năm (VD: 2026)"
                value={invoiceNam} 
                onChange={(e) => setInvoiceNam(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] w-32"
              />
              <input 
                type="number" 
                placeholder="Tháng (1-12)"
                min="1" max="12"
                value={invoiceThang} 
                onChange={(e) => setInvoiceThang(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] w-32"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-3 px-4 font-medium">Mã HĐ</th>
                    <th className="py-3 px-4 font-medium">Phòng</th>
                    <th className="py-3 px-4 font-medium">Chủ hộ</th>
                    <th className="py-3 px-4 font-medium">Kỳ hóa đơn</th>
                    <th className="py-3 px-4 font-medium text-right">Tổng tiền</th>
                    <th className="py-3 px-4 font-medium text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((item) => (
                    <tr key={item.ma_hoa_don} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">{item.ma_hoa_don}</td>
                      <td className="py-3 px-4 font-semibold text-[#141415]">{item.ma_phong}</td>
                      <td className="py-3 px-4 text-gray-600">{item.ten_chu_ho}</td>
                      <td className="py-3 px-4">{formatThang(item.thang_nam)}</td>
                      <td className="py-3 px-4 text-right font-semibold">{formatVND(item.tong_tien)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-semibold ${
                          item.trang_thai_thanh_toan ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {item.trang_thai_thanh_toan ? 'Đã thu' : 'Chưa thu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoiceData.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
