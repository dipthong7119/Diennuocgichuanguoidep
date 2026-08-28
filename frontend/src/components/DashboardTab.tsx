import { useState } from 'react';
import { Zap, Droplets, Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import {
  hoGiaDinhList, dongHoList, chiSoTieuThuList, hoaDonList,
  phanTichAIList, getLast3Months, getTieuThu, formatVND, formatThang,
  CURRENT_PERIOD,
} from '../data/mockData';

interface Props {
  desktop?: boolean;
}

export default function DashboardTab({ desktop = false }: Props) {
  const [selectedHo] = useState('HO-001');

  const ho = hoGiaDinhList.find(h => h.MaHo === selectedHo)!;
  const hoaDon = hoaDonList.find(hd => hd.MaHo === selectedHo && hd.ThangNam === CURRENT_PERIOD);

  // Tiêu thụ kỳ hiện tại
  const dienTieuThu = getTieuThu(selectedHo, 'Dien', CURRENT_PERIOD);
  const nuocTieuThu = getTieuThu(selectedHo, 'Nuoc', CURRENT_PERIOD);
  const dienDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Dien')?.DonGia || 3000;
  const nuocDonGia = dongHoList.find(d => d.MaHo === selectedHo && d.Loai === 'Nuoc')?.DonGia || 15000;
  const tongTamTinh = dienTieuThu * dienDonGia + nuocTieuThu * nuocDonGia;

  // Tiêu thụ tháng trước để tính trend
  const dienPrev = getTieuThu(selectedHo, 'Dien', '2026-02');
  const nuocPrev = getTieuThu(selectedHo, 'Nuoc', '2026-02');
  const dienTrend = dienPrev > 0 ? ((dienTieuThu - dienPrev) / dienPrev * 100) : 0;
  const nuocTrend = nuocPrev > 0 ? ((nuocTieuThu - nuocPrev) / nuocPrev * 100) : 0;

  // AI insight cho phòng hiện tại
  const aiInsight = phanTichAIList.find(ai => ai.MaHoaDon === hoaDon?.MaHoaDon);

  // Chart data — 3 tháng
  const dien3m = getLast3Months(selectedHo, 'Dien');
  const nuoc3m = getLast3Months(selectedHo, 'Nuoc');

  const chartData = dien3m.map((d, i) => ({
    thang: formatThang(d.thang),
    dien: d.tieuThu,
    nuoc: nuoc3m[i]?.tieuThu || 0,
  }));

  // Tổng hợp tất cả phòng cho summary
  const tongPhong = hoGiaDinhList.length;
  const tongDienAll = chiSoTieuThuList
    .filter(c => c.ThangNam === CURRENT_PERIOD && c.MaDongHo.includes('-D'))
    .reduce((s, c) => s + (c.ChiSoMoi - c.ChiSoCu), 0);
  const tongNuocAll = chiSoTieuThuList
    .filter(c => c.ThangNam === CURRENT_PERIOD && c.MaDongHo.includes('-N'))
    .reduce((s, c) => s + (c.ChiSoMoi - c.ChiSoCu), 0);
  const tongDoanhThu = hoaDonList
    .filter(hd => hd.ThangNam === CURRENT_PERIOD)
    .reduce((s, hd) => s + hd.TongTien, 0);

  // Cảnh báo nổi bật (danger first, then warning)
  const alertsAll = phanTichAIList
    .filter(a => a.MucDoCanhBao !== 'normal')
    .sort((a, b) => (a.MucDoCanhBao === 'danger' ? -1 : 1));

  function TrendIcon({ value }: { value: number }) {
    if (Math.abs(value) < 2) return <Minus size={14} className="text-gray-400" />;
    return value > 0
      ? <TrendingUp size={14} className="text-red-500" />
      : <TrendingDown size={14} className="text-emerald-500" />;
  }

  function TrendBadge({ value }: { value: number }) {
    const color = Math.abs(value) < 2
      ? 'bg-gray-100 text-gray-500'
      : value > 0
        ? 'bg-red-50 text-red-600'
        : 'bg-emerald-50 text-emerald-600';
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
        <TrendIcon value={value} />
        {Math.abs(value).toFixed(0)}%
      </span>
    );
  }

  const alertBadgeColor: Record<string, string> = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    normal: 'bg-emerald-500',
  };

  const alertBadgeLabel: Record<string, string> = {
    danger: 'Nguy hiểm',
    warning: 'Cảnh báo',
    normal: 'Bình thường',
  };

  // Desktop: 2-column layout
  if (desktop) {
    return (
      <div className="space-y-6">
        {/* ── Summary Cards Grid — 4 col on desktop ── */}
        <div className="grid grid-cols-4 gap-4">
          {/* Tổng phòng */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0068FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
              </div>
              <span className="text-sm text-gray-500 font-medium">Tổng phòng</span>
            </div>
            <p className="text-3xl font-bold text-[#141415]">{tongPhong}</p>
            <p className="text-xs text-gray-400 mt-1">phòng đang quản lý</p>
          </div>

          {/* Doanh thu kỳ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
              </div>
              <span className="text-sm text-gray-500 font-medium">Doanh thu kỳ</span>
            </div>
            <p className="text-xl font-bold text-[#141415]">{formatVND(tongDoanhThu)}</p>
            <p className="text-xs text-gray-400 mt-1">{formatThang(CURRENT_PERIOD)}</p>
          </div>

          {/* Tổng điện */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Zap size={18} className="text-amber-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Tổng điện</span>
            </div>
            <p className="text-3xl font-bold text-[#141415]">{tongDienAll} <span className="text-base font-medium text-gray-400">kWh</span></p>
            <p className="text-xs text-gray-400 mt-1">tổng tiêu thụ</p>
          </div>

          {/* Tổng nước */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Droplets size={18} className="text-sky-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Tổng nước</span>
            </div>
            <p className="text-3xl font-bold text-[#141415]">{tongNuocAll} <span className="text-base font-medium text-gray-400">m³</span></p>
            <p className="text-xs text-gray-400 mt-1">tổng tiêu thụ</p>
          </div>
        </div>

        {/* ── 2-column section ── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Left col: Phòng của bạn + Chart */}
          <div className="col-span-3 space-y-4">
            {/* Phòng của bạn */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#141415]">Phòng {ho.MaPhong} — {ho.TenChuHo}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#0068FF] font-semibold">
                  {formatThang(CURRENT_PERIOD)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={16} className="text-amber-500" />
                    <TrendBadge value={dienTrend} />
                  </div>
                  <p className="text-2xl font-bold text-[#141415]">{dienTieuThu}</p>
                  <p className="text-xs text-gray-500 mt-1">kWh điện</p>
                </div>
                <div className="text-center bg-sky-50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Droplets size={16} className="text-sky-500" />
                    <TrendBadge value={nuocTrend} />
                  </div>
                  <p className="text-2xl font-bold text-[#141415]">{nuocTieuThu}</p>
                  <p className="text-xs text-gray-500 mt-1">m³ nước</p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Tạm tính</p>
                  <p className="text-xl font-bold text-[#0068FF]">{formatVND(tongTamTinh)}</p>
                  <p className="text-xs text-gray-500 mt-1">ước tính</p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#141415]">Tiêu thụ 3 tháng gần nhất</h2>
                <span className="text-xs text-gray-400">Phòng {ho.MaPhong}</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4} barCategoryGap="25%">
                    <XAxis
                      dataKey="thang"
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #F3F4F6',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="dien" radius={[6, 6, 0, 0]} name="Điện (kWh)">
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill={idx === chartData.length - 1 ? '#F59E0B' : '#FDE68A'} />
                      ))}
                    </Bar>
                    <Bar dataKey="nuoc" radius={[6, 6, 0, 0]} name="Nước (m³)">
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill={idx === chartData.length - 1 ? '#0EA5E9' : '#BAE6FD'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-400" />
                  <span className="text-xs text-gray-500">Điện (kWh)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-sky-400" />
                  <span className="text-xs text-gray-500">Nước (m³)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right col: AI Alerts */}
          <div className="col-span-2">
            {alertsAll.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-5 shadow-lg h-full">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#0068FF]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Cảnh báo AI</h3>
                      <p className="text-[10px] text-white/50">bất thường tiêu thụ</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">
                      {alertsAll.length} cảnh báo
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-80">
                    {alertsAll.map(alert => {
                      const hd = hoaDonList.find(h => h.MaHoaDon === alert.MaHoaDon);
                      const hoInfo = hd ? hoGiaDinhList.find(h => h.MaHo === hd.MaHo) : null;
                      return (
                        <div key={alert.MaDanhGia} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alertBadgeColor[alert.MucDoCanhBao]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-white">
                                Phòng {hoInfo?.MaPhong || '?'}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                alert.MucDoCanhBao === 'danger'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {alertBadgeLabel[alert.MucDoCanhBao]}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                              {alert.NoiDungNhanXet}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 mt-1 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout (original)
  return (
    <div className="space-y-4 pb-4">
      {/* ── Summary Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {/* Tổng phòng */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0068FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
            </div>
            <span className="text-xs text-gray-400 font-medium">Tổng phòng</span>
          </div>
          <p className="text-2xl font-bold text-[#141415]">{tongPhong}</p>
        </div>

        {/* Doanh thu kỳ */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
            </div>
            <span className="text-xs text-gray-400 font-medium">Doanh thu kỳ</span>
          </div>
          <p className="text-lg font-bold text-[#141415]">{formatVND(tongDoanhThu)}</p>
        </div>

        {/* Tổng điện */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Zap size={16} className="text-amber-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Tổng điện</span>
          </div>
          <p className="text-2xl font-bold text-[#141415]">{tongDienAll} <span className="text-sm font-medium text-gray-400">kWh</span></p>
        </div>

        {/* Tổng nước */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
              <Droplets size={16} className="text-sky-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Tổng nước</span>
          </div>
          <p className="text-2xl font-bold text-[#141415]">{tongNuocAll} <span className="text-sm font-medium text-gray-400">m³</span></p>
        </div>
      </div>

      {/* ── Phòng của bạn ─────────────────────────────────── */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#141415]">Phòng {ho.MaPhong} — {ho.TenChuHo}</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0068FF] font-semibold">
            {formatThang(CURRENT_PERIOD)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={14} className="text-amber-500" />
              <TrendBadge value={dienTrend} />
            </div>
            <p className="text-xl font-bold text-[#141415]">{dienTieuThu}</p>
            <p className="text-[10px] text-gray-400">kWh</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Droplets size={14} className="text-sky-500" />
              <TrendBadge value={nuocTrend} />
            </div>
            <p className="text-xl font-bold text-[#141415]">{nuocTieuThu}</p>
            <p className="text-[10px] text-gray-400">m³</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-1">Tạm tính</p>
            <p className="text-lg font-bold text-[#0068FF]">{formatVND(tongTamTinh)}</p>
          </div>
        </div>
      </div>

      {/* ── AI Highlight Banner ────────────────────────────── */}
      {alertsAll.length > 0 && (
        <div className="mx-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 shadow-lg">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0068FF]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Cảnh báo AI bất thường</h3>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">
                  {alertsAll.length} cảnh báo
                </span>
              </div>

              <div className="space-y-2.5">
                {alertsAll.map(alert => {
                  const hd = hoaDonList.find(h => h.MaHoaDon === alert.MaHoaDon);
                  const hoInfo = hd ? hoGiaDinhList.find(h => h.MaHo === hd.MaHo) : null;
                  return (
                    <div key={alert.MaDanhGia} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alertBadgeColor[alert.MucDoCanhBao]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white">
                            Phòng {hoInfo?.MaPhong || '?'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            alert.MucDoCanhBao === 'danger'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {alertBadgeLabel[alert.MucDoCanhBao]}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                          {alert.NoiDungNhanXet}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 mt-1 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Biểu đồ tiêu thụ 3 tháng ─────────────────────── */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#141415]">Tiêu thụ 3 tháng gần nhất</h2>
          <span className="text-[10px] text-gray-400">Phòng {ho.MaPhong}</span>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} barCategoryGap="25%">
              <XAxis
                dataKey="thang"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Bar dataKey="dien" radius={[6, 6, 0, 0]} name="Điện (kWh)">
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={idx === chartData.length - 1 ? '#F59E0B' : '#FDE68A'} />
                ))}
              </Bar>
              <Bar dataKey="nuoc" radius={[6, 6, 0, 0]} name="Nước (m³)">
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={idx === chartData.length - 1 ? '#0EA5E9' : '#BAE6FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-[10px] text-gray-500">Điện (kWh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
            <span className="text-[10px] text-gray-500">Nước (m³)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
