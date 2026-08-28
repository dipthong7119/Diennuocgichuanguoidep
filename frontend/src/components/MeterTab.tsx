import { useState, useMemo } from 'react';
import { Zap, Droplets, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import {
  hoGiaDinhList, dongHoList, getLatestChiSo, formatVND,
} from '../data/mockData';

interface FormErrors {
  dienMoi?: string;
  nuocMoi?: string;
}

export default function MeterTab() {
  const [selectedHo, setSelectedHo] = useState('HO-001');
  const [dienMoiStr, setDienMoiStr] = useState('');
  const [nuocMoiStr, setNuocMoiStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const ho = hoGiaDinhList.find(h => h.MaHo === selectedHo)!;
  const dienCu = getLatestChiSo(selectedHo, 'Dien');
  const nuocCu = getLatestChiSo(selectedHo, 'Nuoc');
  const dienDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Dien')?.DonGia || 3000;
  const nuocDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Nuoc')?.DonGia || 15000;

  const dienMoi = dienMoiStr === '' ? null : parseInt(dienMoiStr);
  const nuocMoi = nuocMoiStr === '' ? null : parseInt(nuocMoiStr);

  // Validation
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

  // Live calculation
  const dienTieuThu = dienMoi !== null && dienCu ? Math.max(0, dienMoi - dienCu.ChiSoMoi) : 0;
  const nuocTieuThu = nuocMoi !== null && nuocCu ? Math.max(0, nuocMoi - nuocCu.ChiSoMoi) : 0;
  const dienThanhTien = dienTieuThu * dienDonGia;
  const nuocThanhTien = nuocTieuThu * nuocDonGia;
  const tongTien = dienThanhTien + nuocThanhTien;

  function handleSubmit() {
    if (hasErrors || isFormEmpty) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Simulate API call + AI analysis
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 2000);
  }

  function handleRoomChange(maHo: string) {
    setSelectedHo(maHo);
    setDienMoiStr('');
    setNuocMoiStr('');
    setSubmitSuccess(false);
  }

  return (
    <div className="space-y-4 pb-4 px-4">
      {/* ── Chọn phòng ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
          Chọn phòng
        </label>
        <div className="grid grid-cols-5 gap-2">
          {hoGiaDinhList.map(h => (
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
        </p>
      </div>

      {/* ── Form nhập chỉ số ──────────────────────────────── */}
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

      {/* ── Live Calculation ──────────────────────────────── */}
      {!isFormEmpty && !hasErrors && (
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
      )}

      {/* ── Submit ────────────────────────────────────────── */}
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
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Đang xử lý & phân tích AI...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Lưu & Kích hoạt AI phân tích</span>
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {isSubmitting && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-200" />
            <div className="h-3 bg-gray-200 rounded-full w-32" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-3/4" />
          <div className="space-y-2 mt-2">
            <div className="h-2.5 bg-gray-100 rounded-full w-5/6" />
            <div className="h-2.5 bg-gray-100 rounded-full w-4/6" />
            <div className="h-2.5 bg-gray-100 rounded-full w-5/6" />
          </div>
        </div>
      )}

      {/* Success notification */}
      {submitSuccess && (
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
          <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Lưu thành công!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Chỉ số đã được lưu và AI đã phân tích xong. Chuyển sang tab "Hóa đơn" để xem chi tiết.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
