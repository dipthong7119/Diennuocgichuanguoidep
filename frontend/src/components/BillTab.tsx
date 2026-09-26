import { useState, useEffect } from 'react';
import {
  Zap, Droplets, CheckCircle, XCircle, Sparkles, Lightbulb,
  Printer, CreditCard, ChevronDown, ChevronUp, Shield, Loader2, MessageCircle, Send, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import {
  hoGiaDinhList, dongHoList
} from '../data/mockData';

interface Props {
  desktop?: boolean;
  userMaHo?: string | null;
  userRole?: string;
  onSessionExpired?: () => void;
}

export default function BillTab({ desktop = false, userMaHo = null, userRole = 'admin', onSessionExpired }: Props) {
  const visibleHoList = userRole === 'admin'
    ? hoGiaDinhList
    : hoGiaDinhList.filter(h => h.MaHo === userMaHo);

  const defaultMaHo = userMaHo && userRole !== 'admin' ? userMaHo : (visibleHoList[0]?.MaHo ?? 'HO-001');
  const [selectedHo, setSelectedHo] = useState(defaultMaHo);
  const [aiExpanded, setAiExpanded] = useState(true);

  type ChatMsg = { role: 'user' | 'ai'; text: string };
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [cauHoi, setCauHoi] = useState('');
  const [hoiDapLoading, setHoiDapLoading] = useState(false);
  const [hoiDapError, setHoiDapError] = useState('');

  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [localPaid, setLocalPaid] = useState<Record<string, boolean>>({});

  // DB States
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [dienHistory, setDienHistory] = useState<any[]>([]);
  const [nuocHistory, setNuocHistory] = useState<any[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách hóa đơn và chỉ số từ backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsLoading(true);

    // 1. Fetch bills
    fetch(`/chi-so/hoa-don/${selectedHo}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { onSessionExpired?.(); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (Array.isArray(data)) {
          setBills(data);
          if (data.length > 0) setSelectedBillId(data[0].MaHoaDon);
          else setSelectedBillId('');
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    // 2. Fetch meter history
    const maDien = `DH-D${selectedHo.split('-')[1]}`;
    const maNuoc = `DH-N${selectedHo.split('-')[1]}`;

    if (maDien) {
      fetch(`/chi-so/${maDien}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => Array.isArray(d) && setDienHistory(d)).catch(console.error);
    }
    if (maNuoc) {
      fetch(`/chi-so/${maNuoc}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => Array.isArray(d) && setNuocHistory(d)).catch(console.error);
    }
  }, [selectedHo]);

  // Lấy AI insight khi chọn hóa đơn
  useEffect(() => {
    if (!selectedBillId) { setAiInsight(null); return; }
    const token = localStorage.getItem('token');
    fetch(`/ai-insight/${selectedBillId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAiInsight(data[0]);
        } else {
          setAiInsight(null);
        }
      })
      .catch(console.error);
  }, [selectedBillId]);

  function handleGenerateAI() {
    if (!selectedBillId) return;
    setGeneratingAI(true);
    const token = localStorage.getItem('token');
    fetch(`/ai-insight/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ma_ho: selectedHo, ma_hoa_don: selectedBillId })
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok) setAiInsight(data);
      else alert(data.detail || 'Lỗi khi tạo AI Insight');
    })
    .catch(console.error)
    .finally(() => setGeneratingAI(false));
  }

  const hoaDon = bills.find(b => b.MaHoaDon === selectedBillId);
  const isActuallyPaid = hoaDon ? (localPaid[hoaDon.MaHoaDon] ?? hoaDon.TrangThaiThanhToan) : false;

  const ho = hoGiaDinhList.find(h => h.MaHo === selectedHo)!;
  const periodPrefix = hoaDon?.ThangNam ? hoaDon.ThangNam.substring(0, 7) : '';
  const dienCu = hoaDon ? dienHistory.find(d => d.ThangNam.startsWith(periodPrefix)) : null;
  const nuocCu = hoaDon ? nuocHistory.find(d => d.ThangNam.startsWith(periodPrefix)) : null;

  const dienTieuThu = dienCu ? (dienCu.ChiSoMoi - dienCu.ChiSoCu) : 0;
  const nuocTieuThu = nuocCu ? (nuocCu.ChiSoMoi - nuocCu.ChiSoCu) : 0;
  
  const dienDonGia = 3500;
  const nuocDonGia = 15000;
  const dienTien = dienTieuThu * dienDonGia;
  const nuocTien = nuocTieuThu * nuocDonGia;

  const alertColor: Record<string, { bg: string; text: string; border: string; badge: string; label: string }> = {
    danger:  { bg: 'from-red-950 via-red-900 to-slate-950',     text: 'text-red-300',    border: 'border-red-800/30',    badge: 'bg-red-500',    label: 'Nguy hiểm' },
    warning: { bg: 'from-amber-950 via-amber-900/80 to-slate-950', text: 'text-amber-300',  border: 'border-amber-800/30',  badge: 'bg-amber-500',  label: 'Cảnh báo' },
    normal:  { bg: 'from-emerald-950 via-emerald-900/80 to-slate-950', text: 'text-emerald-300', border: 'border-emerald-800/30', badge: 'bg-emerald-500', label: 'Bình thường' },
    Bình_thường:  { bg: 'from-emerald-950 via-emerald-900/80 to-slate-950', text: 'text-emerald-300', border: 'border-emerald-800/30', badge: 'bg-emerald-500', label: 'Bình thường' },
    Cao: { bg: 'from-amber-950 via-amber-900/80 to-slate-950', text: 'text-amber-300',  border: 'border-amber-800/30',  badge: 'bg-amber-500',  label: 'Cảnh báo' },
    Nguy_hiểm:  { bg: 'from-red-950 via-red-900 to-slate-950',     text: 'text-red-300',    border: 'border-red-800/30',    badge: 'bg-red-500',    label: 'Nguy hiểm' }
  };

  function getAlertColor(mucDo: string) {
    if (!mucDo) return alertColor['normal'];
    const key = mucDo.replace(' ', '_');
    return alertColor[key] || alertColor['normal'];
  }

  function handlePay() {
    if (!hoaDon || isActuallyPaid) return;
    setPayLoading(true);
    setPaySuccess(false);

    const token = localStorage.getItem('token');
    fetch(`/chi-so/hoa-don/${hoaDon.MaHoaDon}/thanh-toan`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(() => {
        setPayLoading(false);
        setPaySuccess(true);
        setLocalPaid(prev => ({ ...prev, [hoaDon.MaHoaDon]: true }));
        setTimeout(() => setPaySuccess(false), 5000);
      })
      .catch(() => {
        setPayLoading(false);
        setPaySuccess(true);
        setLocalPaid(prev => ({ ...prev, [hoaDon.MaHoaDon]: true }));
        setTimeout(() => setPaySuccess(false), 5000);
      });
  }

  function handleHoiDap(questionOverride?: string) {
    const q = (questionOverride ?? cauHoi).trim();
    if (!q || hoiDapLoading) return;

    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setCauHoi('');
    setHoiDapLoading(true);
    setHoiDapError('');

    const token = localStorage.getItem('token');
    fetch('/ai-insight/hoi-dap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ma_ho: selectedHo, cau_hoi: q }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 401) {
          setChatHistory(prev => [...prev, { role: 'ai', text: '⚠️ Phiên đăng nhập hết hạn. Đang đưa bạn về trang đăng nhập...' }]);
          setTimeout(() => onSessionExpired?.(), 1500);
          return;
        }
        if (!r.ok) throw new Error(data?.detail || 'Có lỗi xảy ra, thử lại sau.');
        setChatHistory(prev => [...prev, { role: 'ai', text: data.tra_loi }]);
      })
      .catch((err) => {
        const errMsg = err.message || 'Không thể kết nối tới máy chủ.';
        setChatHistory(prev => [...prev, { role: 'ai', text: '❌ ' + errMsg }]);
        setHoiDapError(errMsg);
      })
      .finally(() => setHoiDapLoading(false));
  }

  function renderMarkdown(text: string) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="font-semibold text-[#141415]">{part}</strong> : part
      );
      if (line.startsWith('  •') || line.startsWith('• ') || line.startsWith('  -') || line.startsWith('- ')) {
        return <li key={i} className="ml-3 list-disc">{rendered}</li>;
      }
      if (line === '') return <br key={i} />;
      return <p key={i}>{rendered}</p>;
    });
  }

  function formatThangDisplay(thangNam: string) {
    if (!thangNam) return '';
    const [year, month] = thangNam.split('-');
    return `T${parseInt(month, 10)}/${year}`;
  }
  
  function formatVND(amount: number) {
    return amount.toLocaleString('vi-VN') + ' đ';
  }

  function handlePrint() {
    if (!hoaDon) return;
    const content = `
HÓA ĐƠN ĐIỆN NƯỚC
==================
Phòng: ${ho.MaPhong} — ${ho.TenChuHo}
Kỳ: ${formatThangDisplay(hoaDon.ThangNam)}
SĐT: ${ho.SoDienThoai}

Điện: ${dienCu?.ChiSoCu ?? '-'} → ${dienCu?.ChiSoMoi ?? '-'} = ${dienTieuThu} kWh × ${formatVND(dienDonGia)} = ${formatVND(dienTien)}
Nước: ${nuocCu?.ChiSoCu ?? '-'} → ${nuocCu?.ChiSoMoi ?? '-'} = ${nuocTieuThu} m³ × ${formatVND(nuocDonGia)} = ${formatVND(nuocTien)}

TỔNG CỘNG: ${formatVND(hoaDon.TongTien)}
Trạng thái: ${isActuallyPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family:monospace;padding:20px">${content}</pre>`);
      win.print();
    }
  }

  const roomSelector = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
        {userRole === 'admin' ? 'Chọn phòng xem hóa đơn' : 'Hóa đơn phòng của bạn'}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {visibleHoList.map(h => (
          <button
            key={h.MaHo}
            onClick={() => {
              setSelectedHo(h.MaHo);
              setPaySuccess(false);
            }}
            disabled={userRole !== 'admin'}
            className={`text-xs py-2 rounded-xl font-semibold transition-all duration-200 ${
              selectedHo === h.MaHo
                ? 'bg-[#0068FF] text-white shadow-md shadow-blue-200'
                : userRole === 'admin'
                  ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  : 'bg-blue-50 text-blue-700 cursor-default'
            }`}
          >
            {h.MaPhong}
          </button>
        ))}
      </div>
      {userRole !== 'admin' && (
        <p className="text-xs text-gray-400 mt-2">
          Chủ hộ: <span className="text-[#141415] font-medium">{ho.TenChuHo}</span>
          <span className="ml-2 text-gray-300">·</span>
          <span className="ml-2">SĐT: {ho.SoDienThoai}</span>
        </p>
      )}
    </div>
  );

  const billDetail = isLoading ? (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 h-64 flex flex-col items-center justify-center">
      <Loader2 size={30} className="animate-spin text-blue-500 mb-2" />
      <p className="text-sm text-gray-400">Đang tải hóa đơn...</p>
    </div>
  ) : hoaDon ? (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#141415]">
              Hóa đơn 
            </h2>
            <select 
              value={selectedBillId} 
              onChange={(e) => setSelectedBillId(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#0068FF] font-semibold text-[#0068FF]"
            >
              {bills.map(b => (
                <option key={b.MaHoaDon} value={b.MaHoaDon}>
                  Tháng {formatThangDisplay(b.ThangNam)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Phòng {ho.MaPhong} · {ho.TenChuHo}
          </p>
        </div>
        {isActuallyPaid ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle size={12} /> Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
            <XCircle size={12} /> Chưa thanh toán
          </span>
        )}
      </div>

      <div className="px-4 pb-4">
        <table className="w-full text-xs mt-2">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-400 font-medium">Loại</th>
              <th className="text-right py-2 text-gray-400 font-medium">Số cũ</th>
              <th className="text-right py-2 text-gray-400 font-medium">Số mới</th>
              <th className="text-right py-2 text-gray-400 font-medium">Tiêu thụ</th>
              <th className="text-right py-2 text-gray-400 font-medium">Đơn giá</th>
              <th className="text-right py-2 text-gray-400 font-medium">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-2.5">
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-500" />
                  <span className="font-medium text-[#141415]">Điện</span>
                </div>
              </td>
              <td className="text-right text-gray-500 py-2.5">{dienCu?.ChiSoCu ?? '-'}</td>
              <td className="text-right text-gray-500 py-2.5">{dienCu?.ChiSoMoi ?? '-'}</td>
              <td className="text-right font-semibold text-[#141415] py-2.5">{dienTieuThu} kWh</td>
              <td className="text-right text-gray-500 py-2.5">{formatVND(dienDonGia)}</td>
              <td className="text-right font-semibold text-[#141415] py-2.5">{formatVND(dienTien)}</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-1.5">
                  <Droplets size={12} className="text-sky-500" />
                  <span className="font-medium text-[#141415]">Nước</span>
                </div>
              </td>
              <td className="text-right text-gray-500 py-2.5">{nuocCu?.ChiSoCu ?? '-'}</td>
              <td className="text-right text-gray-500 py-2.5">{nuocCu?.ChiSoMoi ?? '-'}</td>
              <td className="text-right font-semibold text-[#141415] py-2.5">{nuocTieuThu} m³</td>
              <td className="text-right text-gray-500 py-2.5">{formatVND(nuocDonGia)}</td>
              <td className="text-right font-semibold text-[#141415] py-2.5">{formatVND(nuocTien)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-100">
              <td colSpan={5} className="py-3 text-xs font-semibold text-gray-500 uppercase">
                Tổng cộng
              </td>
              <td className="text-right py-3 text-base font-bold text-[#0068FF]">
                {formatVND(hoaDon.TongTien)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 h-48 flex flex-col items-center justify-center text-center">
      <p className="text-sm text-gray-400">Không có hóa đơn nào cho phòng này</p>
    </div>
  );

  const aiPanel = (aiInsight && !generatingAI) ? (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getAlertColor(aiInsight.MucDoCanhBao).bg} shadow-lg`}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full blur-2xl" />

      <div className="relative z-10 p-4">
        <button
          onClick={() => setAiExpanded(!aiExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white">AI Insight & Energy Advisor</h3>
              <p className="text-[10px] text-white/50">Phân tích tự động bởi AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${getAlertColor(aiInsight.MucDoCanhBao).badge}`}>
              {getAlertColor(aiInsight.MucDoCanhBao).label}
            </span>
            {aiExpanded ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
          </div>
        </button>

        {aiExpanded && (
          <div className="mt-4 space-y-4">
            <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 border ${getAlertColor(aiInsight.MucDoCanhBao).border}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Shield size={12} className={getAlertColor(aiInsight.MucDoCanhBao).text} />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${getAlertColor(aiInsight.MucDoCanhBao).text}`}>
                  Nhận xét
                </span>
              </div>
              <p className="text-[12px] text-gray-200 leading-relaxed">
                {aiInsight.NoiDungNhanXet}
              </p>
            </div>
            {aiInsight.GoiYTietKiem && (
              <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 border ${getAlertColor(aiInsight.MucDoCanhBao).border}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={12} className="text-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">Gợi ý tiết kiệm</span>
                </div>
                <div className="text-[12px] text-gray-200 leading-relaxed">
                  {aiInsight.GoiYTietKiem.map((g: string, i: number) => <p key={i}>• {g}</p>)}
                </div>
              </div>
            )}
            
            {aiInsight.DuLieuBieuDo && aiInsight.DuLieuBieuDo.length > 0 && (
              <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 border ${getAlertColor(aiInsight.MucDoCanhBao).border}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className={getAlertColor(aiInsight.MucDoCanhBao).text} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${getAlertColor(aiInsight.MucDoCanhBao).text}`}>
                    Biến động 3 kỳ gần nhất
                  </span>
                </div>
                <div className="h-24 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiInsight.DuLieuBieuDo.map((val: number, idx: number) => ({ name: `Kỳ ${idx+1}`, value: val }))}>
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {aiInsight.DuLieuBieuDo.map((_: number, idx: number) => (
                          <Cell key={idx} fill={idx === aiInsight.DuLieuBieuDo.length - 1 ? '#F59E0B' : '#94A3B8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 h-40 flex flex-col items-center justify-center text-center">
      <Sparkles size={24} className="text-gray-300 mb-2" />
      <p className="text-sm text-gray-400 mb-3">Chưa có phân tích AI cho kỳ này</p>
      <button onClick={handleGenerateAI} disabled={generatingAI || !hoaDon} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2">
        {generatingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {generatingAI ? 'Đang phân tích...' : 'Phân tích hóa đơn này'}
      </button>
    </div>
  );

  const QUICK_QUESTIONS = [
    'Tháng nào dùng điện nhiều nhất?',
    'Hóa đơn nào chưa thanh toán?',
    'Tóm tắt lịch sử tiêu thụ',
    'Kỳ gần nhất tiêu thụ bao nhiêu?',
  ];

  const hoiDapPanel = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-[#0068FF]/10 flex items-center justify-center">
            <MessageCircle size={13} className="text-[#0068FF]" />
          </div>
          <span className="text-xs font-semibold text-[#141415]">Hỏi AI về hóa đơn của bạn</span>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={() => { setChatHistory([]); setHoiDapError(''); }}
            className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      <div className="px-3 py-3 space-y-3 max-h-72 overflow-y-auto">
        {chatHistory.length === 0 && (
          <div className="text-center py-3">
            <p className="text-[11px] text-gray-400 mb-2.5">
              Hỏi về lịch sử điện nước, hóa đơn, thanh toán...
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleHoiDap(q)}
                  disabled={hoiDapLoading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-[#0068FF] hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-[#0068FF]/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Sparkles size={11} className="text-[#0068FF]" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${msg.role === 'user' ? 'bg-[#0068FF] text-white rounded-tr-sm' : 'bg-gray-50 text-gray-700 rounded-tl-sm border border-gray-100'}`}>
              {msg.role === 'ai' ? <div className="space-y-0.5">{renderMarkdown(msg.text)}</div> : msg.text}
            </div>
          </div>
        ))}

        {hoiDapLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-[#0068FF]/10 flex items-center justify-center shrink-0 mr-2">
              <Sparkles size={11} className="text-[#0068FF]" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 border border-gray-100 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin text-[#0068FF]" />
              <span className="text-[11px] text-gray-400">Đang truy vấn dữ liệu...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cauHoi}
            onChange={(e) => setCauHoi(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleHoiDap()}
            placeholder="Nhập câu hỏi..."
            maxLength={500}
            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-[#141415] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#0068FF]"
          />
          <button
            onClick={() => handleHoiDap()}
            disabled={hoiDapLoading || !cauHoi.trim()}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${hoiDapLoading || !cauHoi.trim() ? 'bg-gray-100 text-gray-300' : 'bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-sm shadow-blue-200'}`}
          >
            {hoiDapLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        {hoiDapError && <p className="text-[10px] text-red-500 mt-1.5 pl-1">{hoiDapError}</p>}
      </div>
    </div>
  );

  const footerActions = (
    <div className="space-y-3">
      {hoaDon && !isActuallyPaid && (
        <button
          onClick={handlePay}
          disabled={payLoading}
          className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${payLoading ? 'bg-[#0068FF]/70 text-white cursor-wait' : 'bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-lg shadow-blue-200'}`}
        >
          {payLoading ? <><Loader2 size={16} className="animate-spin" /><span>Đang xử lý...</span></> : <><CreditCard size={16} /><span>Thanh toán ngay — {formatVND(hoaDon.TongTien)}</span></>}
        </button>
      )}

      {hoaDon && isActuallyPaid && (
        <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3.5 border border-emerald-100">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">Hóa đơn đã được thanh toán đầy đủ</p>
        </div>
      )}

      {paySuccess && (
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">Thanh toán thành công! Hóa đơn đã được cập nhật.</p>
        </div>
      )}

      <button
        onClick={handlePrint}
        className="w-full py-3 rounded-2xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Printer size={16} />
        Xuất / In hóa đơn
      </button>
    </div>
  );

  if (desktop) {
    return (
      <div className="space-y-6">
        {roomSelector}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 space-y-4">
            {billDetail}
            {footerActions}
          </div>
          <div className="col-span-2 space-y-4">
            {aiPanel}
            {hoiDapPanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 px-4">
      {roomSelector}
      {billDetail}
      {aiPanel}
      {hoiDapPanel}
      {footerActions}
    </div>
  );
}
