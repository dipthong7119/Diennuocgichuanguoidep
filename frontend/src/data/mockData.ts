import type { HoGiaDinh, DongHo, ChiSoTieuThu, HoaDon, PhanTichAI } from '../types';

// ═══════════════════════════════════════════════════════════════════
// 1. HỘ GIA ĐÌNH
// ═══════════════════════════════════════════════════════════════════
export const hoGiaDinhList: HoGiaDinh[] = [
  { MaHo: 'HO-001', TenChuHo: 'Nguyễn Văn An',   SoDienThoai: '0901234567', MaPhong: 'P101' },
  { MaHo: 'HO-002', TenChuHo: 'Trần Thị Bình',   SoDienThoai: '0912345678', MaPhong: 'P102' },
  { MaHo: 'HO-003', TenChuHo: 'Lê Minh Cường',   SoDienThoai: '0923456789', MaPhong: 'P201' },
  { MaHo: 'HO-004', TenChuHo: 'Phạm Thị Dung',   SoDienThoai: '0934567890', MaPhong: 'P202' },
  { MaHo: 'HO-005', TenChuHo: 'Hoàng Văn Em',    SoDienThoai: '0945678901', MaPhong: 'P301' },
];

// ═══════════════════════════════════════════════════════════════════
// 2. ĐỒNG HỒ (Điện 3000 VNĐ/kWh — Nước 15000 VNĐ/m³)
// ═══════════════════════════════════════════════════════════════════
export const dongHoList: DongHo[] = [
  { MaDongHo: 'DH-D001', MaHo: 'HO-001', Loai: 'Dien', DonGia: 3000 },
  { MaDongHo: 'DH-N001', MaHo: 'HO-001', Loai: 'Nuoc', DonGia: 15000 },
  { MaDongHo: 'DH-D002', MaHo: 'HO-002', Loai: 'Dien', DonGia: 3000 },
  { MaDongHo: 'DH-N002', MaHo: 'HO-002', Loai: 'Nuoc', DonGia: 15000 },
  { MaDongHo: 'DH-D003', MaHo: 'HO-003', Loai: 'Dien', DonGia: 3000 },
  { MaDongHo: 'DH-N003', MaHo: 'HO-003', Loai: 'Nuoc', DonGia: 15000 },
  { MaDongHo: 'DH-D004', MaHo: 'HO-004', Loai: 'Dien', DonGia: 3000 },
  { MaDongHo: 'DH-N004', MaHo: 'HO-004', Loai: 'Nuoc', DonGia: 15000 },
  { MaDongHo: 'DH-D005', MaHo: 'HO-005', Loai: 'Dien', DonGia: 3000 },
  { MaDongHo: 'DH-N005', MaHo: 'HO-005', Loai: 'Nuoc', DonGia: 15000 },
];

// ═══════════════════════════════════════════════════════════════════
// 3. CHỈ SỐ TIÊU THỤ — 3 tháng gần nhất (T1, T2, T3/2026)
// ═══════════════════════════════════════════════════════════════════
export const chiSoTieuThuList: ChiSoTieuThu[] = [
  // ── Hộ 001 (P101) — Bình thường ─────────────────────────────
  { MaChiSo: 'CS-0001', MaDongHo: 'DH-D001', ThangNam: '2026-01', ChiSoCu: 1000, ChiSoMoi: 1120 },
  { MaChiSo: 'CS-0002', MaDongHo: 'DH-N001', ThangNam: '2026-01', ChiSoCu: 50,   ChiSoMoi: 58 },
  { MaChiSo: 'CS-0003', MaDongHo: 'DH-D001', ThangNam: '2026-02', ChiSoCu: 1120, ChiSoMoi: 1235 },
  { MaChiSo: 'CS-0004', MaDongHo: 'DH-N001', ThangNam: '2026-02', ChiSoCu: 58,   ChiSoMoi: 67 },
  { MaChiSo: 'CS-0005', MaDongHo: 'DH-D001', ThangNam: '2026-03', ChiSoCu: 1235, ChiSoMoi: 1360 },
  { MaChiSo: 'CS-0006', MaDongHo: 'DH-N001', ThangNam: '2026-03', ChiSoCu: 67,   ChiSoMoi: 75 },

  // ── Hộ 002 (P102) — Nước tăng bất thường T3 ────────────────
  { MaChiSo: 'CS-0007', MaDongHo: 'DH-D002', ThangNam: '2026-01', ChiSoCu: 2000, ChiSoMoi: 2150 },
  { MaChiSo: 'CS-0008', MaDongHo: 'DH-N002', ThangNam: '2026-01', ChiSoCu: 100,  ChiSoMoi: 108 },
  { MaChiSo: 'CS-0009', MaDongHo: 'DH-D002', ThangNam: '2026-02', ChiSoCu: 2150, ChiSoMoi: 2290 },
  { MaChiSo: 'CS-0010', MaDongHo: 'DH-N002', ThangNam: '2026-02', ChiSoCu: 108,  ChiSoMoi: 118 },
  { MaChiSo: 'CS-0011', MaDongHo: 'DH-D002', ThangNam: '2026-03', ChiSoCu: 2290, ChiSoMoi: 2430 },
  { MaChiSo: 'CS-0012', MaDongHo: 'DH-N002', ThangNam: '2026-03', ChiSoCu: 118,  ChiSoMoi: 143 },

  // ── Hộ 003 (P201) — Điện ổn định ───────────────────────────
  { MaChiSo: 'CS-0013', MaDongHo: 'DH-D003', ThangNam: '2026-01', ChiSoCu: 500,  ChiSoMoi: 565 },
  { MaChiSo: 'CS-0014', MaDongHo: 'DH-N003', ThangNam: '2026-01', ChiSoCu: 30,   ChiSoMoi: 36 },
  { MaChiSo: 'CS-0015', MaDongHo: 'DH-D003', ThangNam: '2026-02', ChiSoCu: 565,  ChiSoMoi: 630 },
  { MaChiSo: 'CS-0016', MaDongHo: 'DH-N003', ThangNam: '2026-02', ChiSoCu: 36,   ChiSoMoi: 42 },
  { MaChiSo: 'CS-0017', MaDongHo: 'DH-D003', ThangNam: '2026-03', ChiSoCu: 630,  ChiSoMoi: 698 },
  { MaChiSo: 'CS-0018', MaDongHo: 'DH-N003', ThangNam: '2026-03', ChiSoCu: 42,   ChiSoMoi: 48 },

  // ── Hộ 004 (P202) — Tiêu thụ cao ──────────────────────────
  { MaChiSo: 'CS-0019', MaDongHo: 'DH-D004', ThangNam: '2026-01', ChiSoCu: 3000, ChiSoMoi: 3250 },
  { MaChiSo: 'CS-0020', MaDongHo: 'DH-N004', ThangNam: '2026-01', ChiSoCu: 200,  ChiSoMoi: 215 },
  { MaChiSo: 'CS-0021', MaDongHo: 'DH-D004', ThangNam: '2026-02', ChiSoCu: 3250, ChiSoMoi: 3480 },
  { MaChiSo: 'CS-0022', MaDongHo: 'DH-N004', ThangNam: '2026-02', ChiSoCu: 215,  ChiSoMoi: 232 },
  { MaChiSo: 'CS-0023', MaDongHo: 'DH-D004', ThangNam: '2026-03', ChiSoCu: 3480, ChiSoMoi: 3700 },
  { MaChiSo: 'CS-0024', MaDongHo: 'DH-N004', ThangNam: '2026-03', ChiSoCu: 232,  ChiSoMoi: 248 },

  // ── Hộ 005 (P301) — Tiêu thụ thấp ─────────────────────────
  { MaChiSo: 'CS-0025', MaDongHo: 'DH-D005', ThangNam: '2026-01', ChiSoCu: 100,  ChiSoMoi: 130 },
  { MaChiSo: 'CS-0026', MaDongHo: 'DH-N005', ThangNam: '2026-01', ChiSoCu: 10,   ChiSoMoi: 14 },
  { MaChiSo: 'CS-0027', MaDongHo: 'DH-D005', ThangNam: '2026-02', ChiSoCu: 130,  ChiSoMoi: 162 },
  { MaChiSo: 'CS-0028', MaDongHo: 'DH-N005', ThangNam: '2026-02', ChiSoCu: 14,   ChiSoMoi: 18 },
  { MaChiSo: 'CS-0029', MaDongHo: 'DH-D005', ThangNam: '2026-03', ChiSoCu: 162,  ChiSoMoi: 190 },
  { MaChiSo: 'CS-0030', MaDongHo: 'DH-N005', ThangNam: '2026-03', ChiSoCu: 18,   ChiSoMoi: 22 },
];

// ═══════════════════════════════════════════════════════════════════
// 4. HÓA ĐƠN — Tháng 3/2026 (kỳ hiện tại)
// ═══════════════════════════════════════════════════════════════════
export const hoaDonList: HoaDon[] = [
  { MaHoaDon: 'HD-0001', MaHo: 'HO-001', ThangNam: '2026-03', TongTien: 495000,  TrangThaiThanhToan: true },
  { MaHoaDon: 'HD-0002', MaHo: 'HO-002', ThangNam: '2026-03', TongTien: 795000,  TrangThaiThanhToan: false },
  { MaHoaDon: 'HD-0003', MaHo: 'HO-003', ThangNam: '2026-03', TongTien: 294000,  TrangThaiThanhToan: true },
  { MaHoaDon: 'HD-0004', MaHo: 'HO-004', ThangNam: '2026-03', TongTien: 900000,  TrangThaiThanhToan: false },
  { MaHoaDon: 'HD-0005', MaHo: 'HO-005', ThangNam: '2026-03', TongTien: 144000,  TrangThaiThanhToan: true },
];

// ═══════════════════════════════════════════════════════════════════
// 5. PHÂN TÍCH AI
// ═══════════════════════════════════════════════════════════════════
export const phanTichAIList: PhanTichAI[] = [
  {
    MaDanhGia: 'AI-001',
    MaHoaDon: 'HD-0001',
    MucDoCanhBao: 'normal',
    NoiDungNhanXet: 'Mức tiêu thụ điện và nước của phòng P101 ổn định qua 3 tháng. Điện trung bình 120 kWh/tháng, nước 8 m³/tháng — nằm trong ngưỡng bình thường.',
    GoiYTietKiem: [
      'Tắt điều hòa khi ra khỏi phòng, đặt timer tự động.',
      'Sử dụng bóng đèn LED tiết kiệm điện.',
      'Kiểm tra vòi nước định kỳ để tránh rò rỉ nhỏ.',
    ],
  },
  {
    MaDanhGia: 'AI-002',
    MaHoaDon: 'HD-0002',
    MucDoCanhBao: 'danger',
    NoiDungNhanXet: 'Cảnh báo: Lượng nước tháng 3 phòng P102 tăng 150% so với trung bình 3 tháng trước (25 m³ so với trung bình 10 m³). Nghi vấn rò rỉ bồn cầu hoặc đường ống.',
    GoiYTietKiem: [
      '🚨 Kiểm tra ngay bồn cầu và các mối nối đường ống nước.',
      'Đóng van nước tổng khi không sử dụng để kiểm tra đồng hồ có chạy không.',
      'Liên hệ thợ sửa ống nước nếu phát hiện rò rỉ.',
    ],
  },
  {
    MaDanhGia: 'AI-003',
    MaHoaDon: 'HD-0003',
    MucDoCanhBao: 'normal',
    NoiDungNhanXet: 'Phòng P201 có mức tiêu thụ điện ổn định (65–68 kWh/tháng). Nước tiêu thụ thấp (6 m³/tháng). Không phát hiện bất thường.',
    GoiYTietKiem: [
      'Duy trì thói quen sử dụng tiết kiệm hiện tại.',
      'Cân nhắc sử dụng máy giặt vào khung giờ thấp điểm.',
      'Sử dụng vòi sen tiết kiệm nước để giảm thêm chi phí.',
    ],
  },
  {
    MaDanhGia: 'AI-004',
    MaHoaDon: 'HD-0004',
    MucDoCanhBao: 'warning',
    NoiDungNhanXet: 'Phòng P202 có mức tiêu thụ điện cao liên tục (220–250 kWh/tháng). Mặc dù không tăng đột biến, tổng mức tiêu thụ cao hơn 80% so với trung bình toàn khu trọ.',
    GoiYTietKiem: [
      'Kiểm tra điều hòa — có thể gas yếu khiến máy hoạt động liên tục.',
      'Hạn chế sử dụng nhiều thiết bị công suất lớn đồng thời.',
      'Đặt nhiệt độ điều hòa ở 26°C thay vì 22°C để tiết kiệm 20% điện năng.',
    ],
  },
  {
    MaDanhGia: 'AI-005',
    MaHoaDon: 'HD-0005',
    MucDoCanhBao: 'normal',
    NoiDungNhanXet: 'Phòng P301 tiêu thụ rất tiết kiệm. Điện chỉ 28–32 kWh/tháng, nước 4 m³/tháng. Đây là mức thấp nhất toàn khu trọ.',
    GoiYTietKiem: [
      'Mức tiêu thụ rất tốt, tiếp tục duy trì!',
      'Cân nhắc lắp công tắc cảm biến để tiết kiệm hơn nữa.',
      'Chia sẻ kinh nghiệm tiết kiệm với các phòng khác.',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/** Lấy tiêu thụ (Mới - Cũ) theo hộ, loại, tháng */
export function getTieuThu(maHo: string, loai: 'Dien' | 'Nuoc', thangNam: string): number {
  const dh = dongHoList.find(d => d.MaHo === maHo && d.Loai === loai);
  if (!dh) return 0;
  const cs = chiSoTieuThuList.find(c => c.MaDongHo === dh.MaDongHo && c.ThangNam === thangNam);
  if (!cs) return 0;
  return cs.ChiSoMoi - cs.ChiSoCu;
}

/** Lấy chỉ số gần nhất theo hộ và loại */
export function getLatestChiSo(maHo: string, loai: 'Dien' | 'Nuoc'): ChiSoTieuThu | null {
  const dh = dongHoList.find(d => d.MaHo === maHo && d.Loai === loai);
  if (!dh) return null;
  const sorted = chiSoTieuThuList
    .filter(c => c.MaDongHo === dh.MaDongHo)
    .sort((a, b) => b.ThangNam.localeCompare(a.ThangNam));
  return sorted[0] || null;
}

/** Lấy 3 tháng tiêu thụ gần nhất theo hộ và loại */
export function getLast3Months(maHo: string, loai: 'Dien' | 'Nuoc'): { thang: string; tieuThu: number }[] {
  const dh = dongHoList.find(d => d.MaHo === maHo && d.Loai === loai);
  if (!dh) return [];
  return chiSoTieuThuList
    .filter(c => c.MaDongHo === dh.MaDongHo)
    .sort((a, b) => a.ThangNam.localeCompare(b.ThangNam))
    .map(c => ({ thang: c.ThangNam, tieuThu: c.ChiSoMoi - c.ChiSoCu }));
}

/** Format số tiền VND */
export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ';
}

/** Tháng hiện tại (kỳ mới nhất) */
export const CURRENT_PERIOD = '2026-03';

/** Format tên tháng */
export function formatThang(thangNam: string): string {
  const [year, month] = thangNam.split('-');
  return `T${parseInt(month)}/${year}`;
}
