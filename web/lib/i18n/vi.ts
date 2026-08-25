/**
 * Từ điển tiếng Việt — nguồn sự thật của MỌI chuỗi hiện ra cho người dùng.
 *
 * ═══ VÌ SAO TÁCH CHUỖI TỪ ĐẦU DÙ CHỈ CÓ MỘT NGÔN NGỮ ═══
 * Tiếng Anh làm sau, nhưng gom chuỗi lại sau thì đắt gấp nhiều lần: lúc đó chúng
 * đã nằm rải trong JSX, một số đã bị nối chuỗi với biến, một số đã bị đưa vào
 * `aria-label` — và không có cách nào biết chỗ nào còn sót ngoài đọc lại từng file.
 *
 * 🔴 Khoá mới đánh dấu `[?]` ở cuối để David duyệt giọng. Đừng bỏ dấu đó hộ — nó là
 * cách duy nhất phân biệt "chữ đã được duyệt" với "chữ tôi tự nghĩ ra".
 */
export const vi = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Testnet công khai của 9Chain, chạy trên Avalanche',
    dangTai: 'Đang tải…',
    thuLai: 'Thử lại',
    saoChep: 'Sao chép',
    daChep: 'Đã chép',
    dong: 'Đóng',
    moMenu: 'Mở menu',
    dongMenu: 'Đóng menu',
    chuyenSangToi: 'Chuyển sang nền tối',
    chuyenSangSang: 'Chuyển sang nền sáng',
    boQuaToiNoiDung: 'Bỏ qua, tới nội dung chính',
  },

  dieuHuong: {
    trangChu: 'Trang chủ',
    faucet: 'Nhận token thử',
    console: 'Đẻ chain',
    danhBa: 'Danh bạ L1',
    explorer: 'Explorer',
    banGiao: 'Mở 9Scan-A1 ở tab mới',
  },

  trangChu: {
    nhanTestnet: 'Testnet — token không có giá trị thật',
    tieuDe: 'Chain của riêng bạn, đẻ ra trong ba phút',
    moTa:
      'A1 là testnet công khai của 9Chain chạy trên Avalanche. Bạn bấm một nút, ' +
      'nhận về một L1 do chính ví bạn làm chủ — genesis, phí, quyền deploy đều là của bạn.',
    nutChinh: 'Đẻ chain của bạn',
    nutPhu: 'Nhận token thử trước đã',
    /* Trang chủ đầy đủ (2–3 biến thể để David chọn) là M10.3 — mục này chỉ đủ để
       khung đứng được và mọi liên kết có đích thật. */
    dangDung: 'Trang chủ đầy đủ đang dựng',
    dangDungMoTa:
      'Ba biến thể trang chủ sẽ được dựng ở mốc M10.3 để David chọn. Trong lúc đó, ' +
      'mọi cửa vào bên dưới đều đã chạy thật.',
    cuaVaoFaucet: 'Xin LOVE9 để trả phí gas khi thử.',
    cuaVaoConsole: 'Đẻ một L1 do chính ví bạn làm chủ.',
    cuaVaoDanhBa: 'Các L1 đã có trên mạng và tình trạng thật.',
  },

  faucet: {
    tieuDe: 'Nhận token thử',
    moTa:
      'LOVE9 trên testnet A1 không có giá trị thật — nó chỉ để bạn trả phí gas khi thử. ' +
      'Nhập địa chỉ ví, chúng tôi gửi ngay.',
    nhanDiaChi: 'Địa chỉ ví của bạn',
    goiYDiaChi: '0x… (40 ký tự hex)',
    nutXin: 'Gửi token cho tôi',
    dangGui: 'Đang gửi…',
    danChoDiaChi: 'Dán địa chỉ ví bạn muốn nhận token. Bấm “Thêm mạng vào ví” ở trên nếu chưa có.',
    themMang: 'Thêm mạng vào ví',
    themMangXong: 'Đã thêm vào ví',
    themMangLoi: 'Ví từ chối hoặc chưa cài. Bạn có thể thêm tay bằng thông số dưới đây.',
    khongCoVi: 'Không thấy ví trong trình duyệt. Cài MetaMask rồi tải lại trang.',
    hanMucConLai: 'Hạn mức còn lại',
    hanMucCachDoc: '{con}/{tong} lượt trong {gio} giờ',
    hanMucHet: 'Bạn đã dùng hết hạn mức. Thử lại sau {phut} phút.',
    hanMucKhongDoc: 'Chưa đọc được hạn mức — bạn vẫn xin được, chỉ là không biết trước còn mấy lượt.',
    thanhCong: 'Đã gửi {so} {kyHieu} tới {diaChi}',
    xemGiaoDich: 'Xem giao dịch',
    thongSoMang: 'Thông số mạng',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Ký hiệu',
    thongSoExplorer: 'Explorer',
    loiChung: 'Không gửi được. {chiTiet}',
  },

  loi: {
    khongKetNoi: 'Không kết nối được tới mạng',
    khongKetNoiMoTa: 'Có thể mạng đang bận hoặc đường truyền của bạn bị gián đoạn.',
    trongRong: 'Chưa có gì ở đây',
  },
} as const;

export type Tu = typeof vi;

/** Thay `{khoa}` trong chuỗi bằng giá trị. Thiếu khoá thì GIỮ NGUYÊN dấu ngoặc —
 *  một chỗ trống lặng lẽ đọc như dữ liệu bị mất, còn `{so}` lộ ra thì sửa được ngay. */
export function dien(mau: string, gt: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (nguyen, k) => (k in gt ? String(gt[k]) : nguyen));
}
