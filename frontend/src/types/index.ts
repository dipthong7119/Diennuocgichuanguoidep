// ═══════════════════════════════════════════════════════════════════
// TypeScript interfaces — khớp 100% với CSDL đặc tả
// ═══════════════════════════════════════════════════════════════════

export interface HoGiaDinh {
  MaHo: string;
  TenChuHo: string;
  SoDienThoai: string;
  MaPhong: string;
  DiaChi?: string | null;
  GioiTinh?: string | null;
}

export interface DongHo {
  MaDongHo: string;
  MaHo: string;
  Loai: 'Dien' | 'Nuoc';
  DonGia: number;
}

export interface ChiSoTieuThu {
  MaChiSo: string;
  MaDongHo: string;
  ThangNam: string; // "2026-06", "2026-07", ...
  ChiSoCu: number;
  ChiSoMoi: number;
}

export interface HoaDon {
  MaHoaDon: string;
  MaHo: string;
  ThangNam: string;
  TongTien: number;
  TrangThaiThanhToan: boolean;
}

export interface PhanTichAI {
  MaDanhGia: string;
  MaHoaDon: string;
  MucDoCanhBao: 'warning' | 'normal' | 'danger' | 'Bình thường' | 'Cao' | 'Nguy hiểm';
  NoiDungNhanXet: string;
  GoiYTietKiem?: string[];
  DuLieuBieuDo?: number[]; // Added for requirement 6
}

export type TabId = 'dashboard' | 'meter' | 'bill';
