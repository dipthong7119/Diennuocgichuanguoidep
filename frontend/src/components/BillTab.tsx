import { useState } from 'react';
import {
  Zap, Droplets, CheckCircle, XCircle, Sparkles, Lightbulb,
  Printer, CreditCard, ChevronDown, ChevronUp, Shield,
} from 'lucide-react';
import {
  hoGiaDinhList, dongHoList, hoaDonList, phanTichAIList,
  getTieuThu, getLatestChiSo, formatVND, formatThang, CURRENT_PERIOD,
} from '../data/mockData';

interface Props {
  desktop?: boolean;
}

export default function BillTab({ desktop = false }: Props) {
  const [selectedHo, setSelectedHo] = useState('HO-001');
  const [aiExpanded, setAiExpanded] = useState(true);

  const ho = hoGiaDinhList.find(h => h.MaHo === selectedHo)!;
  const hoaDon = hoaDonList.find(hd => hd.MaHo === selectedHo && hd.ThangNam === CURRENT_PERIOD);
  const aiInsight = hoaDon
    ? phanTichAIList.find(ai => ai.MaHoaDon === hoaDon.MaHoaDon)
    : null;

  // Chỉ số chi tiết
  const dienCu = getLatestChiSo(selectedHo, 'Dien');
  const nuocCu = getLatestChiSo(selectedHo, 'Nuoc');
  const dienTieuThu = getTieuThu(selectedHo, 'Dien', CURRENT_PERIOD);
  const nuocTieuThu = getTieuThu(selectedHo, 'Nuoc', CURRENT_PERIOD);
  const dienDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Dien')?.DonGia || 3000;
  const nuocDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Nuoc')?.DonGia || 15000;
  const dienTien = dienTieuThu * dienDonGia;
  const nuocTien = nuocTieuThu * nuocDonGia;

  const alertColor: Record<string, { bg: string; text: string; border: string; badge: string; label: string }> = {
    danger:  { bg: 'from-red-950 via-red-900 to-slate-950',     text: 'text-red-300',    border: 'border-red-800/30',    badge: 'bg-red-500',    label: 'Nguy hiểm' },
    warning: { bg: 'from-amber-950 via-amber-900/80 to-slate-950', text: 'text-amber-300',  border: 'border-amber-800/30',  badge: 'bg-amber-500',  label: 'Cảnh báo' },
    normal:  { bg: 'from-emerald-950 via-emerald-900/80 to-slate-950', text: 'text-emerald-300', border: 'border-emerald-800/30', badge: 'bg-emerald-500', label: 'Bình thường' },
  };

  const roomSelector = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
        Chọn phòng xem hóa đơn
      </label>
      <div className="grid grid-cols-5 gap-2">
        {hoGiaDinhList.map(h => (
          <button
            key={h.MaHo}
            onClick={() => setSelectedHo(h.MaHo)}
            className={`text-xs py-2 rounded-xl font-semibold transition-all duration-200 ${
              selectedHo === h.MaHo
                ? 'bg-[#0068FF] text-white shadow-md shadow-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {h.MaPhong}
          </button>
        ))}
      </div>
    </div>
  );

  const billDetail = hoaDon && (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      {/* Header hóa đơn */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
        <div>
          <h2 className="text-sm font-semibold text-[#141415]">
            Hóa đơn {formatThang(CURRENT_PERIOD)}
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Phòng {ho.MaPhong} · {ho.TenChuHo}
          </p>
        </div>
        {hoaDon.TrangThaiThanhToan ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle size={12} /> Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
            <XCircle size={12} /> Chưa thanh toán
          </span>
        )}
      </div>

      {/* Bảng kê chi tiết */}
      <div className="px-4 pb-4">
        <table className="w-full text-xs">
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
              <td className="text-right text-gray-500 py-2.5">{dienCu?.ChiSoCu || '-'}</td>
              <td className="text-right text-gray-500 py-2.5">{dienCu?.ChiSoMoi || '-'}</td>
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
              <td className="text-right text-gray-500 py-2.5">{nuocCu?.ChiSoCu || '-'}</td>
              <td className="text-right text-gray-500 py-2.5">{nuocCu?.ChiSoMoi || '-'}</td>
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
  );

  const aiPanel = aiInsight && (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${alertColor[aiInsight.MucDoCanhBao].bg} shadow-lg`}>
      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full blur-2xl" />

      <div className="relative z-10 p-4">
        {/* Header */}
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
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${alertColor[aiInsight.MucDoCanhBao].badge}`}>
              {alertColor[aiInsight.MucDoCanhBao].label}
            </span>
            {aiExpanded ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
          </div>
        </button>

        {aiExpanded && (
          <div className="mt-4 space-y-4">
            {/* Nhận xét */}
            <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 border ${alertColor[aiInsight.MucDoCanhBao].border}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Shield size={12} className={alertColor[aiInsight.MucDoCanhBao].text} />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${alertColor[aiInsight.MucDoCanhBao].text}`}>
                  Nhận xét
                </span>
              </div>
              <p className="text-[12px] text-gray-200 leading-relaxed">
                {aiInsight.NoiDungNhanXet}
              </p>
            </div>

            {/* Gợi ý tiết kiệm */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Lightbulb size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                  Gợi ý tiết kiệm
                </span>
              </div>
              <ul className="space-y-2">
                {aiInsight.GoiYTietKiem.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/60 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-gray-300 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const footerActions = (
    <div className="flex gap-3">
      {hoaDon && !hoaDon.TrangThaiThanhToan && (
        <button className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <CreditCard size={16} />
          Thanh toán ngay
        </button>
      )}
      <button className={`${hoaDon && !hoaDon.TrangThaiThanhToan ? 'flex-1' : 'w-full'} py-3 rounded-2xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2`}>
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
          <div className="col-span-2">
            {aiPanel || (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 h-48 flex flex-col items-center justify-center text-center">
                <Sparkles size={24} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Chưa có phân tích AI cho kỳ này</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="space-y-4 pb-4 px-4">
      {roomSelector}
      {billDetail}
      {aiPanel}
      {footerActions}
    </div>
  );
}
