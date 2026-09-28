import { useState, useEffect, type ReactNode } from 'react';
import {
  Zap, Droplets, CheckCircle, XCircle, Sparkles, Lightbulb,
  Printer, CreditCard, ChevronDown, ChevronUp, Shield, Loader2, MessageCircle, Send, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

  type ChatMsg = { role: 'user' | 'ai'; text: string; sources?: { title: string; url: string }[] };
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
  const [aiError, setAiError] = useState('');
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

  // Tự lấy hoặc tạo phân tích AI khi mở một hóa đơn, không yêu cầu bấm nút.
  useEffect(() => {
    if (!selectedBillId) { setAiInsight(null); return; }
    const token = localStorage.getItem('token');
    if (!token) return;
    let cancelled = false;
    setAiInsight(null);
    setGeneratingAI(true);
    setAiError('');

    fetch(`/ai-insight/${selectedBillId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (response.status === 401) { onSessionExpired?.(); return null; }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data[0];
        const generated = await fetch('/ai-insight/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ma_ho: selectedHo, ma_hoa_don: selectedBillId }),
        });
        if (!generated.ok) {
          const detail = await generated.json().catch(() => ({}));
          throw new Error(detail.detail || 'Chưa thể tạo phân tích cho hóa đơn này.');
        }
        return generated.json();
      })
      .then(data => { if (!cancelled && data) setAiInsight(data); })
      .catch(error => { if (!cancelled) setAiError(error.message || 'Không thể tạo phân tích.'); })
      .finally(() => { if (!cancelled) setGeneratingAI(false); });

    return () => { cancelled = true; };
  }, [selectedBillId, selectedHo, onSessionExpired]);

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
        setChatHistory(prev => [...prev, { role: 'ai', text: data.tra_loi, sources: data.sources || [] }]);
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
    const formatInline = (line: string, keyPrefix: string) =>
      line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${keyPrefix}-${index}`} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={`${keyPrefix}-${index}`}>{part.slice(1, -1)}</em>;
        }
        return part;
      });

    const content: ReactNode[] = [];
    let listItems: { text: string; key: number }[] = [];
    const flushList = () => {
      if (!listItems.length) return;
      content.push(
        <ul key={`list-${listItems[0].key}`} className="my-1.5 list-disc space-y-1 pl-4 marker:text-[#0068FF]">
          {listItems.map(item => <li key={item.key}>{formatInline(item.text, `item-${item.key}`)}</li>)}
        </ul>,
      );
      listItems = [];
    };

    text.replace(/\r/g, '').split('\n').forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) { flushList(); return; }

      const bullet = line.match(/^(?:[-•*])\s+(.+)$/);
      if (bullet) {
        listItems.push({ text: bullet[1], key: index });
        return;
      }

      flushList();
      const heading = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\*\*(.+)\*\*$/);
      if (heading) {
        content.push(<p key={`heading-${index}`} className="pt-1 font-semibold">{formatInline(heading[1], `heading-${index}`)}</p>);
      } else {
        content.push(<p key={`paragraph-${index}`}>{formatInline(line, `paragraph-${index}`)}</p>);
      }
    });
    flushList();
    return <div className="space-y-1.5">{content}</div>;
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
              <h3 className="text-sm font-semibold text-white">Phân tích tiêu thụ</h3>
              <p className="text-[10px] text-white/60">Tự động theo dữ liệu hóa đơn</p>
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
                  Kết quả
                </span>
              </div>
              <div className="text-[13px] text-gray-100 leading-relaxed [&_strong]:text-white">
                {renderMarkdown(aiInsight.NoiDungNhanXet)}
              </div>
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
                  Tiêu thụ 3 kỳ gần đây
                  </span>
                </div>
                <div className="h-24 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiInsight.DuLieuBieuDo} barGap={5}>
                      <XAxis dataKey="thang" tick={{ fontSize: 9, fill: '#CBD5E1' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="dien" hide domain={[0, 'dataMax + 10']} />
                      <YAxis yAxisId="nuoc" orientation="right" hide domain={[0, 'dataMax + 2']} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        formatter={(value, name) => [
                          `${value ?? 0} ${name === 'dien' ? 'kWh' : 'm³'}`,
                          name === 'dien' ? 'Điện' : 'Nước',
                        ]}
                      />
                      <Legend formatter={(value) => value === 'dien' ? 'Điện (kWh)' : 'Nước (m³)'} wrapperStyle={{ fontSize: 10, color: '#CBD5E1' }} />
                      <Bar yAxisId="dien" dataKey="dien" name="dien" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="nuoc" dataKey="nuoc" name="nuoc" fill="#38BDF8" radius={[4, 4, 0, 0]} />
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
      {generatingAI ? <Loader2 size={22} className="mb-2 animate-spin text-[#0068FF]" /> : <Sparkles size={22} className="mb-2 text-gray-300" />}
      <p className="text-sm leading-relaxed text-gray-600">
        {generatingAI ? 'Đang phân tích hóa đơn và dựng biểu đồ…' : aiError || (hoaDon ? 'Chưa thể tạo phân tích cho hóa đơn này.' : 'Chưa có hóa đơn để phân tích.')}
      </p>
      {aiInsight?.DuLieuBieuDo?.length > 0 && <p className="mt-1 text-xs text-gray-500">Biểu đồ điện và nước đang được cập nhật.</p>}
    </div>
  );

  const QUICK_QUESTIONS = [
    'Tháng nào dùng điện nhiều nhất?',
    'Hóa đơn nào chưa thanh toán?',
    'Tóm tắt lịch sử tiêu thụ',
    'Kỳ gần nhất tiêu thụ bao nhiêu?',
    'Giá một số điện hiện nay là bao nhiêu?',
  ];

  const hoiDapPanel = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-[#0068FF]/10 flex items-center justify-center">
            <MessageCircle size={13} className="text-[#0068FF]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#141415]">Trợ lý điện nước</span>
            <p className="text-[10px] text-gray-400">Hóa đơn, mức tiêu thụ và kiến thức chung</p>
          </div>
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
              <span className="block text-xs font-medium text-gray-600">Bạn cần xem thông tin gì?</span>
              <span className="mt-1 block text-[11px] text-gray-400">Hỏi về hóa đơn, mức dùng điện nước hoặc kiến thức chung.</span>
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
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#0068FF] text-white rounded-tr-sm' : 'bg-gray-50 text-gray-700 rounded-tl-sm border border-gray-100'}`}>
              {msg.role === 'ai' ? (
                <div className="space-y-1.5">
                  {renderMarkdown(msg.text)}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Nguồn tham khảo</p>
                      <div className="space-y-1">
                        {msg.sources.map((source, index) => (
                          <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="block truncate text-[11px] font-medium text-[#0068FF] hover:underline">
                            {source.title} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : msg.text}
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
              <span className="text-xs text-gray-500">Đang soạn câu trả lời…</span>
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
            placeholder="Nhập câu hỏi của bạn…"
            maxLength={500}
            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-[#141415] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#0068FF]"
          />
          <button
            onClick={() => handleHoiDap()}
            disabled={hoiDapLoading || !cauHoi.trim()}
            aria-label="Gửi câu hỏi"
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
