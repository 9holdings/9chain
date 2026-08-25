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

    // ── Bản A: dẫn bằng lời hứa
    aTieuDe: 'Chain của riêng bạn, đẻ ra trong ba phút',
    aPhu:
      'Không dựng máy chủ, không xin phép ai. Bấm một nút, nhận về một L1 mà ví ' +
      'của bạn là chủ: genesis, phí gas, quyền deploy đều do bạn đặt.',
    aY1Ten: 'Chain thuộc về ví đã ký',
    aY1: 'Đăng nhập bằng chữ ký ví. Địa chỉ chủ chain lấy từ chữ ký, không ai gõ tay — gõ sai một ký tự là chain vô chủ vĩnh viễn.',
    aY2Ten: 'Sáu kiểu chain chọn sẵn',
    aY2: 'Phí gần như bằng 0, tự in thêm token, chỉ chủ chain deploy, chain kín, thông lượng cao — hoặc bản chuẩn.',
    aY3Ten: 'Nói chuyện được với L1 khác',
    aY3: 'Warp/ICM bật sẵn trong genesis mọi chain, nên tài sản đi được giữa hai L1.',

    // ── Bản B: đặt thẳng màn đẻ chain
    bTieuDe: 'Đặt tên cho chain của bạn',
    bPhu: 'Một lượt đẻ mất khoảng ba phút. Bạn cần một ví để ký — chain sẽ thuộc về ví đó.',
    bNhanTen: 'Tên chain',
    bGoiYTen: 'Ví dụ: ChainCuaToi',
    bBatDau: 'Bắt đầu đẻ chain',
    bLuuY: 'Bấm sẽ mở màn đẻ chain, nơi bạn ký bằng ví và soát lại trước khi gửi. Chưa có gì được tạo ở bước này.',
    bTenXau: 'Tên chỉ gồm chữ, số và dấu cách, dài 2–32 ký tự.',

    // ── Bản C: dẫn bằng chain đã có
    cTieuDe: 'Những L1 này do người dùng đẻ ra',
    cPhu: 'Mỗi dòng là một chain thật đang chạy trên A1, có chủ riêng. Bản của bạn mất khoảng ba phút.',
    cCot: 'Chain',
    cCotKieu: 'Kiểu',
    cCotChu: 'Chủ sở hữu',
    cMacDinh: 'mặc định của hệ thống',
    cTrong: 'Chưa có L1 nào ngoài chain hệ thống',
    cTrongMoTa: 'Bạn sẽ là người đầu tiên. Danh bạ cập nhật ngay sau khi chain của bạn lên.',
  },

  soLieu: {
    tieuDe: 'Mạng đang chạy thật',
    validator: 'Validator kết nối',
    soL1: 'L1 đang sống',
    chieuCao: 'Block C-Chain',
    dangDo: 'Đang đo mạng…',
    khongDo: 'Chưa đọc được số liệu mạng',
    khongDoMoTa: 'Trang vẫn dùng được — đây chỉ là phần hiển thị tình trạng.',
  },

  bienThe: {
    tieuDe: 'Ba biến thể trang chủ — chọn một',
    moTa:
      'Đối tượng đã chốt: người muốn có chain riêng. Ba bản dưới đây khác nhau ở ' +
      'CÁCH DẪN, không ở nhắm ai. Mở từng bản rồi chọn.',
    xemBan: 'Xem bản này',
    aTen: 'A — dẫn bằng lời hứa',
    aMoTa:
      'Nói thẳng bạn nhận được gì, rồi mới mời bấm. Ít thứ trên màn nhất, ' +
      'đọc nhanh nhất, nhưng bắt người ta tin trước khi thấy.',
    bTen: 'B — đặt thẳng màn đẻ chain lên trang chủ',
    bMoTa:
      'Ô nhập tên chain nằm ngay dưới tiêu đề. Ngắn đường nhất tới hành động, ' +
      'nhưng hỏi người lạ một câu (đặt tên) trước khi họ hiểu mình đang mua gì.',
    cTen: 'C — dẫn bằng chain người khác đã đẻ',
    cMoTa:
      'Cho thấy L1 có thật đang chạy rồi mới mời. Thuyết phục nhất khi danh bạ ' +
      'có nhiều chain, yếu nhất khi danh bạ vắng — mà hôm nay nó đang vắng.',
    luuYVang: 'Danh bạ hiện chỉ có {so} L1 — bản C sẽ mạnh dần khi có thêm chain.',
  },

  deChain: {
    tieuDe: 'Đẻ chain của bạn',
    moTa:
      'Một L1 riêng, do ví của bạn làm chủ. Bạn ký một lần để chứng minh mình là ai, ' +
      'soát lại, rồi mạng dựng chain trong khoảng ba phút.',

    // ── bước 1: ví
    noiVi: 'Kết nối ví',
    dangNoi: 'Đang kết nối…',
    kyDeVao: 'Ký để đăng nhập',
    dangKy: 'Đang chờ chữ ký…',
    viCuaBan: 'Ví của bạn',
    laChuChain: 'Chain sẽ thuộc về ví này. Địa chỉ lấy từ chữ ký — không ai gõ tay.',
    khongCoVi: 'Không thấy ví trong trình duyệt. Cài MetaMask rồi tải lại trang.',
    tuChoiKy: 'Bạn đã từ chối ký. Không có gì được tạo.',
    doiVi: 'Dùng ví khác',

    // ── bước 2: form
    nhanTen: 'Tên chain',
    goiYTen: 'Ví dụ: ChainCuaToi',
    moTaTen: 'Chữ, số và dấu cách. 2–32 ký tự. Tên đã dùng thì không cấp lại, kể cả cho chain đã thu hồi.',
    tenXau: 'Tên chỉ gồm chữ, số và dấu cách, dài 2–32 ký tự.',
    nhanKieu: 'Kiểu chain',
    moTaKieu: 'Chọn xong là cố định vĩnh viễn — genesis không sửa lại được.',
    conCho: 'Còn {con}/{tong} chỗ',
    hetCho: 'Đã hết chỗ',
    hetChoMoTa:
      'Mô hình hiện tại cho mọi validator track mọi L1, mà giao thức cắt kết nối node khai quá 16 subnet. ' +
      'Đây là trần cứng, không nới được. Thu hồi một chain sẽ trả lại chỗ.',
    soatLai: 'Soát lại trước khi gửi',

    // ── bước 3: soát lại
    soatTieuDe: 'Soát lại — đây là cửa một chiều',
    soatMoTa:
      'Genesis của một L1 đã đẻ là BẤT BIẾN. Sau bước này không sửa được tên, kiểu chain ' +
      'hay chủ sở hữu — thu hồi cũng không trả lại tên và chain ID.',
    soatTen: 'Tên chain',
    soatKieu: 'Kiểu chain',
    soatChu: 'Chủ sở hữu',
    soatQuayLai: 'Quay lại sửa',
    soatDongY: 'Tôi đã soát, đẻ chain',

    // ── bước 4: tiến trình
    dangDe: 'Đang đẻ chain “{ten}”',
    dangDeMoTa:
      'Năm node restart LẦN LƯỢT để mạng không mất quorum — vì vậy nó chậm, và đó là chủ ý. ' +
      'Đừng đóng tab; nếu lỡ đóng, chain vẫn tiếp tục được dựng.',
    conKhoang: 'Còn khoảng {phut} phút',
    dangChuanBi: 'Đang chuẩn bị…',

    // ── bước 5: xong
    xongTieuDe: 'Xong — chain “{ten}” đang chạy',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Thêm chain vào ví',
    xongDaThem: 'Đã thêm vào ví',
    xongKichHoat: 'Kích hoạt chain (mở block 1)',
    xongDaKichHoat: 'Đã kích hoạt',
    xongDangKichHoat: 'Đang chờ ví…',
    deTiep: 'Đẻ chain khác',
    loiDe: 'Không đẻ được chain. {chiTiet}',
    loiKhongRo: 'Chain không xuất hiện trong danh bạ sau khi lượt chạy kết thúc.',
    luuYTieuDe: 'Giao dịch đầu tiên của chain mới',
    luuYCachLam:
      'Đừng tin ước lượng gas cho giao dịch đầu. Cách rẻ nhất để mở block 1 là một ' +
      'giao dịch chuyển tiền thường — bấm “Kích hoạt chain” bên dưới.',
  },

  chainCuaToi: {
    tieuDe: 'Chain của tôi',
    moTa: 'Các L1 do ví đang đăng nhập làm chủ. Thu hồi được, nhưng đọc kỹ phần cảnh báo.',
    noiVi: 'Kết nối ví để xem chain của bạn',
    trongTieuDe: 'Ví này chưa làm chủ chain nào',
    trongMoTa: 'Đẻ một chain rồi quay lại — nó sẽ hiện ở đây ngay.',
    trongNut: 'Đẻ chain của bạn',

    cotChain: 'Chain',
    cotKieu: 'Kiểu',
    cotSong: 'Tình trạng',
    cotViec: '',

    songDo: '{so} validator',
    songDangDo: 'đang đo',
    songKhongDo: 'chưa đo được',
    // Vì sao đo bằng validator chứ không bằng chiều cao block — xem chú thích trong mã.
    songGiaiThich: 'Đo bằng số validator của subnet, không bằng chiều cao block.',
    khongValidator: '0 validator',
    khongValidatorMoTa:
      'Chain này KHÔNG chốt được giao dịch nào: subnet chưa có validator. Nó vẫn trả lời ' +
      'RPC và ví vẫn kết nối được, nên không có dấu hiệu nào khác để nhận ra.',

    thongSo: 'Thông số cho ví',
    themVaoVi: 'Thêm vào ví',
    daThemVaoVi: 'Đã thêm',

    thuHoi: 'Thu hồi',
    thuHoiTieuDe: 'Thu hồi “{ten}”?',
    thuHoiY1: 'Chain ngừng phục vụ RPC ngay lập tức và biến khỏi danh bạ công khai.',
    thuHoiY2:
      'Thu hồi KHÔNG xoá subnet trên P-Chain — thứ đã đẻ ra ở đó là vĩnh viễn. ' +
      'Nó cũng không xoá mạng khỏi ví của những người đã thêm chain này.',
    thuHoiY3:
      'Tên và Chain ID bị giữ chỗ VĨNH VIỄN, không cấp lại cho ai. Cấp lại Chain ID ' +
      'là để ví của người từng dùng chain cũ lặng lẽ trỏ vào chain của người khác.',
    thuHoiY4: 'Đổi lại, một chỗ trong trần 15 L1 được trả về.',
    thuHoiGoNhan: 'Gõ lại đúng tên chain để xác nhận',
    thuHoiSaiTen: 'Chưa khớp tên chain.',
    thuHoiXacNhan: 'Thu hồi vĩnh viễn',
    thuHoiHuy: 'Hủy',
    thuHoiDangChay: 'Đang thu hồi “{ten}” — khoảng ba phút',
    thuHoiXong: 'Đã thu hồi “{ten}”. Còn {con}/{tong} chỗ.',
    thuHoiLoi: 'Không thu hồi được. {chiTiet}',
    thuHoiKhongRo: 'Chain vẫn còn trong danh bạ sau khi lượt chạy kết thúc.',

    daThuHoi: 'Đã thu hồi',
    daThuHoiMoTa: 'Giữ chỗ tên và Chain ID vĩnh viễn.',
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
