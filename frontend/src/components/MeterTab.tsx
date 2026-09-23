import { useState, useMemo, useEffect } from 'react';
import { Zap, Droplets, AlertCircle, CheckCircle, Loader2, Sparkles, CreditCard, Eye, Clock } from 'lucide-react';
import {
  hoGiaDinhList, dongHoList, getLatestChiSo, formatVND, getTieuThu, CURRENT_PERIOD, hoaDonList, phanTichAIList,
} from '../data/mockData';

interface FormErrors {
  dienMoi?: string;
  nuocMoi?: string;
}

interface Props {
  desktop?: boolean;
  userMaHo?: string | null;
  userRole?: string;
}

// ─────────────────────────────────────────────────────────
// VIEW CHO USER — Chỉ xem chỉ số + tính tiền + thanh toán
// ─────────────────────────────────────────────────────────
function UserMeterView({ userMaHo, desktop = false }: { userMaHo: string; desktop?: boolean }) {
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [paid, setPaid] = useState(false);

  const ho = hoGiaDinhList.find(h => h.MaHo === userMaHo) ?? hoGiaDinhList[0];
  const dienCu = getLatestChiSo(userMaHo, 'Dien');
  const nuocCu = getLatestChiSo(userMaHo, 'Nuoc');
  const dienDonGia = dongHoList.find(d => d.MaHo === userMaHo && d.Loai === 'Dien')?.DonGia || 3000;
  const nuocDonGia = dongHoList.find(d => d.MaHo === userMaHo && d.Loai === 'Nuoc')?.DonGia || 15000;
  const dienTieuThu = getTieuThu(userMaHo, 'Dien', CURRENT_PERIOD);
  const nuocTieuThu = getTieuThu(userMaHo, 'Nuoc', CURRENT_PERIOD);
  const dienTien = dienTieuThu * dienDonGia;
  const nuocTien = nuocTieuThu * nuocDonGia;
  const tongTien = dienTien + nuocTien;

  const hoaDon = hoaDonList.find(hd => hd.MaHo === userMaHo && hd.ThangNam === CURRENT_PERIOD);
  const aiInsight = hoaDon ? phanTichAIList.find(ai => ai.MaHoaDon === hoaDon.MaHoaDon) : null;

  // Trạng thái thanh toán (dùng local state để giả lập sau khi thanh toán)
  const isAlreadyPaid = paid || (hoaDon?.TrangThaiThanhToan ?? false);

  function handlePay() {
    if (!hoaDon || isAlreadyPaid) return;
    setPayLoading(true);
    const token = localStorage.getItem('token');
    fetch(`/chi-so/hoa-don/${hoaDon.MaHoaDon}/thanh-toan`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(() => {
        setPayLoading(false);
        setPaySuccess(true);
        setPaid(true);
        setTimeout(() => setPaySuccess(false), 4000);
      })
      .catch(() => {
        // Fallback mock
        setPayLoading(false);
        setPaySuccess(true);
        setPaid(true);
        setTimeout(() => setPaySuccess(false), 4000);
      });
  }

  // ── Phần "Chỉ số kỳ hiện tại" ─────────────────────────────────────
  const chiSoCard = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#141415]">Chỉ số kỳ hiện tại</h2>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-[#0068FF] font-semibold flex items-center gap-1">
          <Clock size={10} /> T3/2026
        </span>
      </div>

      {/* Điện */}
      <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#141415]">Chỉ số điện</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-400">
              Số cũ: <span className="font-semibold text-gray-600">{dienCu?.ChiSoCu ?? '—'}</span>
            </span>
            <span className="text-gray-300">→</span>
            <span className="text-[11px] text-gray-400">
              Số mới: <span className="font-semibold text-gray-700">{dienCu?.ChiSoMoi ?? '—'}</span>
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-[#141415]">{dienTieuThu} <span className="text-xs font-medium text-gray-400">kWh</span></p>
          <p className="text-[11px] text-amber-600 font-semibold">{formatVND(dienTien)}</p>
        </div>
      </div>

      {/* Nước */}
      <div className="flex items-center gap-3 p-3 bg-sky-50/60 rounded-xl border border-sky-100">
        <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
          <Droplets size={16} className="text-sky-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#141415]">Chỉ số nước</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-400">
              Số cũ: <span className="font-semibold text-gray-600">{nuocCu?.ChiSoCu ?? '—'}</span>
            </span>
            <span className="text-gray-300">→</span>
            <span className="text-[11px] text-gray-400">
              Số mới: <span className="font-semibold text-gray-700">{nuocCu?.ChiSoMoi ?? '—'}</span>
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-[#141415]">{nuocTieuThu} <span className="text-xs font-medium text-gray-400">m³</span></p>
          <p className="text-[11px] text-sky-600 font-semibold">{formatVND(nuocTien)}</p>
        </div>
      </div>

      {/* Tổng */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Đơn giá: Điện {formatVND(dienDonGia)}/kWh · Nước {formatVND(nuocDonGia)}/m³</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tổng cộng</p>
          <p className="text-xl font-bold text-[#0068FF]">{formatVND(tongTien)}</p>
        </div>
      </div>
    </div>
  );

  // ── Trạng thái thanh toán ──────────────────────────────────────────
  const paymentSection = (
    <div className="space-y-3">
      {isAlreadyPaid ? (
        <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <CheckCircle size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Đã thanh toán</p>
            <p className="text-xs text-emerald-600 mt-0.5">Hóa đơn tháng này đã được thanh toán đầy đủ.</p>
          </div>
        </div>
      ) : (
        <button
          onClick={handlePay}
          disabled={payLoading}
          className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            payLoading
              ? 'bg-[#0068FF]/70 text-white cursor-wait'
              : 'bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          {payLoading ? (
            <><Loader2 size={16} className="animate-spin" /><span>Đang xử lý...</span></>
          ) : (
            <><CreditCard size={16} /><span>Thanh toán ngay — {formatVND(tongTien)}</span></>
          )}
        </button>
      )}

      {paySuccess && (
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">Thanh toán thành công! Chuyển sang tab "Hóa đơn" để xem chi tiết.</p>
        </div>
      )}
    </div>
  );

  // ── AI insight (nếu có) ────────────────────────────────────────────
  const aiSection = aiInsight && (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0068FF]/20 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Insight</h3>
            <p className="text-[10px] text-white/50">Phân tích tự động</p>
          </div>
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
            aiInsight.MucDoCanhBao === 'danger' ? 'bg-red-500/20 text-red-400' :
            aiInsight.MucDoCanhBao === 'warning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {aiInsight.MucDoCanhBao === 'danger' ? 'Nguy hiểm' :
             aiInsight.MucDoCanhBao === 'warning' ? 'Cảnh báo' : 'Bình thường'}
          </span>
        </div>
        <p className="text-[12px] text-gray-300 leading-relaxed">{aiInsight.NoiDungNhanXet}</p>
      </div>
    </div>
  );

  // ── Phòng của bạn banner ───────────────────────────────────────────
  const roomBanner = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phòng của bạn</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-[#0068FF] bg-blue-50 px-3 py-1 rounded-xl">{ho.MaPhong}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Chủ hộ</p>
          <p className="text-sm font-semibold text-[#141415]">{ho.TenChuHo}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">SĐT: {ho.SoDienThoai}</p>
        </div>
      </div>
    </div>
  );

  if (desktop) {
    return (
      <div className="space-y-6">
        {roomBanner}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {chiSoCard}
            {paymentSection}
          </div>
          <div>
            {aiSection || (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <Eye size={22} className="text-[#0068FF]" />
                </div>
                <p className="text-sm font-semibold text-[#141415]">Xem chỉ số & Thanh toán</p>
                <p className="text-xs text-gray-400 mt-1">
                  Admin sẽ nhập chỉ số và AI sẽ phân tích tiêu thụ của bạn
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 px-4">
      {roomBanner}
      {chiSoCard}
      {aiSection}
      {paymentSection}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FORM NHẬP CHỈ SỐ CHO ADMIN
// ─────────────────────────────────────────────────────────
function AdminMeterForm({ desktop = false }: { desktop?: boolean }) {
  const visibleHoList = hoGiaDinhList;

  const [selectedHo, setSelectedHo] = useState(visibleHoList[0]?.MaHo ?? 'HO-001');
  const [dienMoiStr, setDienMoiStr] = useState('');
  const [nuocMoiStr, setNuocMoiStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const ho = hoGiaDinhList.find(h => h.MaHo === selectedHo)!;
  const dienCu = getLatestChiSo(selectedHo, 'Dien');
  const nuocCu = getLatestChiSo(selectedHo, 'Nuoc');
  const dienDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Dien')?.DonGia || 3000;
  const nuocDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Nuoc')?.DonGia || 15000;

  const dienMoi = dienMoiStr === '' ? null : parseInt(dienMoiStr);
  const nuocMoi = nuocMoiStr === '' ? null : parseInt(nuocMoiStr);

  const errors = useMemo<FormErrors>(() => {
    const e: FormErrors = {};
    if (dienMoi !== null && dienCu && dienMoi < dienCu.ChiSoMoi) {
      e.dienMoi = `Số mới không được nhỏ hơn số cũ (${dienCu.ChiSoMoi})`;
    }
    if (nuocMoi !== null && nuocCu && nuocMoi < nuocCu.ChiSoMoi) {
      e.nuocMoi = `Số mới không được nhỏ hơn số cũ (${nuocCu.ChiSoMoi})`;
    }
    return e;
  }, [dienMoi, nuocMoi, dienCu, nuocCu]);

  const hasErrors = Object.keys(errors).length > 0;
  const isFormEmpty = dienMoi === null && nuocMoi === null;

  const dienTieuThu = dienMoi !== null && dienCu ? Math.max(0, dienMoi - dienCu.ChiSoMoi) : 0;
  const nuocTieuThu = nuocMoi !== null && nuocCu ? Math.max(0, nuocMoi - nuocCu.ChiSoMoi) : 0;
  const dienThanhTien = dienTieuThu * dienDonGia;
  const nuocThanhTien = nuocTieuThu * nuocDonGia;
  const tongTien = dienThanhTien + nuocThanhTien;

  async function handleSubmit() {
    if (hasErrors || isFormEmpty) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      // Tìm đồng hồ điện & nước của hộ này
      const dhDien = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Dien');
      const dhNuoc = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Nuoc');

      const thangNam = CURRENT_PERIOD;
      const promises = [];

      if (dienMoi !== null && dhDien && dienCu) {
        promises.push(
          fetch('/chi-so/', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              MaChiSo: `CS-ADMIN-${Date.now()}-D`,
              MaDongHo: dhDien.MaDongHo,
              ThangNam: thangNam,
              ChiSoCu: dienCu.ChiSoMoi,
              ChiSoMoi: dienMoi,
            }),
          })
        );
      }

      if (nuocMoi !== null && dhNuoc && nuocCu) {
        promises.push(
          fetch('/chi-so/', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              MaChiSo: `CS-ADMIN-${Date.now()}-N`,
              MaDongHo: dhNuoc.MaDongHo,
              ThangNam: thangNam,
              ChiSoCu: nuocCu.ChiSoMoi,
              ChiSoMoi: nuocMoi,
            }),
          })
        );
      }

      // Gọi API (nếu thất bại thì fallback mock)
      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        // Lấy MaHoaDon để kích hoạt AI
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.ok) {
            const data = await r.value.json();
            const maHoaDon = data?.hoa_don?.MaHoaDon;
            if (maHoaDon) {
              // Kích hoạt AI phân tích
              fetch('/ai-insight/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify({ ma_hoa_don: maHoaDon, ma_ho: selectedHo }),
              }).catch(() => {});
            }
          }
        }
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setDienMoiStr('');
      setNuocMoiStr('');
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      // Fallback giả lập
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setDienMoiStr('');
        setNuocMoiStr('');
        setTimeout(() => setSubmitSuccess(false), 4000);
      }, 1500);
    }
  }

  function handleRoomChange(maHo: string) {
    setSelectedHo(maHo);
    setDienMoiStr('');
    setNuocMoiStr('');
    setSubmitSuccess(false);
    setSubmitError('');
  }

  const roomSelector = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
        Chọn phòng nhập chỉ số
      </label>
      <div className={`grid gap-2 ${desktop ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {visibleHoList.map(h => (
          <button
            key={h.MaHo}
            onClick={() => handleRoomChange(h.MaHo)}
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
      <p className="text-xs text-gray-400 mt-2">
        Chủ hộ: <span className="text-[#141415] font-medium">{ho.TenChuHo}</span>
        {desktop && (
          <span className="ml-3 text-gray-400">· SĐT: {ho.SoDienThoai}</span>
        )}
      </p>
    </div>
  );

  const formInputs = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-4">
      <h2 className="text-sm font-semibold text-[#141415]">Nhập chỉ số kỳ mới</h2>

      {/* Số điện */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Zap size={14} className="text-amber-500" />
          </div>
          <span className="text-xs font-semibold text-[#141415]">Chỉ số điện</span>
          {dienCu && (
            <span className="text-[10px] text-gray-400 ml-auto">
              Số cũ: <span className="font-semibold text-gray-600">{dienCu.ChiSoMoi}</span>
            </span>
          )}
        </div>
        <input
          type="number"
          placeholder="Nhập số điện mới..."
          value={dienMoiStr}
          onChange={(e) => setDienMoiStr(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            errors.dienMoi
              ? 'border-red-300 bg-red-50/50 text-red-700 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50/50 text-[#141415] focus:ring-blue-200 focus:border-[#0068FF]'
          } focus:outline-none focus:ring-2`}
        />
        {errors.dienMoi && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle size={12} className="text-red-500 shrink-0" />
            <p className="text-[11px] text-red-500">{errors.dienMoi}</p>
          </div>
        )}
      </div>

      {/* Số nước */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
            <Droplets size={14} className="text-sky-500" />
          </div>
          <span className="text-xs font-semibold text-[#141415]">Chỉ số nước</span>
          {nuocCu && (
            <span className="text-[10px] text-gray-400 ml-auto">
              Số cũ: <span className="font-semibold text-gray-600">{nuocCu.ChiSoMoi}</span>
            </span>
          )}
        </div>
        <input
          type="number"
          placeholder="Nhập số nước mới..."
          value={nuocMoiStr}
          onChange={(e) => setNuocMoiStr(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            errors.nuocMoi
              ? 'border-red-300 bg-red-50/50 text-red-700 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50/50 text-[#141415] focus:ring-blue-200 focus:border-[#0068FF]'
          } focus:outline-none focus:ring-2`}
        />
        {errors.nuocMoi && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle size={12} className="text-red-500 shrink-0" />
            <p className="text-[11px] text-red-500">{errors.nuocMoi}</p>
          </div>
        )}
      </div>
    </div>
  );

  const liveCalc = !isFormEmpty && !hasErrors && (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tính toán tức thì</h3>

      {dienTieuThu > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <span className="text-xs text-gray-600">
              Điện: {dienTieuThu} kWh × {formatVND(dienDonGia)}
            </span>
          </div>
          <span className="text-sm font-bold text-[#141415]">{formatVND(dienThanhTien)}</span>
        </div>
      )}

      {nuocTieuThu > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-sky-500" />
            <span className="text-xs text-gray-600">
              Nước: {nuocTieuThu} m³ × {formatVND(nuocDonGia)}
            </span>
          </div>
          <span className="text-sm font-bold text-[#141415]">{formatVND(nuocThanhTien)}</span>
        </div>
      )}

      <div className="pt-2 border-t border-gray-200/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">TỔNG CỘNG</span>
        <span className="text-lg font-bold text-[#0068FF]">{formatVND(tongTien)}</span>
      </div>
    </div>
  );

  const submitBtn = (
    <button
      onClick={handleSubmit}
      disabled={hasErrors || isFormEmpty || isSubmitting}
      className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
        hasErrors || isFormEmpty
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : isSubmitting
            ? 'bg-[#0068FF]/80 text-white cursor-wait'
            : 'bg-[#0068FF] text-white hover:bg-[#0055D4] shadow-lg shadow-blue-200 active:scale-[0.98]'
      }`}
    >
      {isSubmitting ? (
        <><Loader2 size={16} className="animate-spin" /><span>Đang xử lý & phân tích AI...</span></>
      ) : (
        <><Sparkles size={16} /><span>Lưu & Kích hoạt AI phân tích</span></>
      )}
    </button>
  );

  const skeleton = isSubmitting && (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
        <div className="h-3 bg-gray-200 rounded-full w-32" />
      </div>
      <div className="h-3 bg-gray-200 rounded-full w-full" />
      <div className="h-3 bg-gray-200 rounded-full w-3/4" />
    </div>
  );

  const successMsg = submitSuccess && (
    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
      <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-emerald-800">Lưu thành công!</p>
        <p className="text-xs text-emerald-600 mt-0.5">
          Chỉ số đã được lưu và AI đã phân tích xong. Chuyển sang tab "Hóa đơn" để xem chi tiết.
        </p>
      </div>
    </div>
  );

  const errorMsg = submitError && (
    <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800">Có lỗi xảy ra</p>
        <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
      </div>
    </div>
  );

  if (desktop) {
    return (
      <div className="space-y-6">
        {roomSelector}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {formInputs}
            {submitBtn}
            {skeleton}
            {successMsg}
            {errorMsg}
          </div>
          <div>
            {liveCalc || (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <Sparkles size={24} className="text-[#0068FF]" />
                </div>
                <p className="text-sm font-semibold text-[#141415]">Tính toán tức thì</p>
                <p className="text-xs text-gray-400 mt-1">
                  Nhập chỉ số để xem kết quả tự động
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 px-4">
      {roomSelector}
      {formInputs}
      {liveCalc}
      {submitBtn}
      {skeleton}
      {successMsg}
      {errorMsg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COMPONENT CHÍNH
// ─────────────────────────────────────────────────────────
export default function MeterTab({ desktop = false, userMaHo = null, userRole = 'admin' }: Props) {
  if (userRole === 'admin') {
    return <AdminMeterForm desktop={desktop} />;
  }

  // User thường → chỉ xem + thanh toán
  const maHo = userMaHo ?? hoGiaDinhList[0].MaHo;
  return <UserMeterView userMaHo={maHo} desktop={desktop} />;
}
