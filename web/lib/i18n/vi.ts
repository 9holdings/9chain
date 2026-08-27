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
 *
 * ═══ 2026-08-27 — DAVID ĐÃ DUYỆT TOÀN BỘ 57 CHUỖI ĐANG TỒN, LUẬT VẪN NGUYÊN ═══
 * Luật `[?]` KHÔNG bị bãi bỏ. Chuỗi MỚI viết từ nay vẫn phải mang dấu.
 *
 * 🔴 VÌ SAO ĐỢT DUYỆT NÀY GẤP: 57 dấu đó không nằm im trong mã — chúng **đang hiển
 * thị ra cho người đọc** trên mạng công khai. Đo `27/08`: `/re-genesis/` mang **64**
 * dấu (gồm cả `<h1>` và mọi `<h2>`), 5 trang còn lại mỗi trang 6 dấu từ dải banner.
 * `/re-genesis/` là trang nói với người lạ rằng tài sản của họ sắp bị xoá — dấu
 * ngoặc-hỏi sau mỗi câu cảnh báo đọc đúng nghĩa đen của nó: đội chưa chắc về chính
 * lời mình nói.
 *
 * 🔴 NAY CÓ CỔNG CHẶN: `scripts/check-no-marker.mjs` chạy trong `postbuild`, đọc
 * thư mục `out/` và **làm ĐỎ bản dựng** nếu còn một dấu nào. Chốt ở `out/` chứ
 * không chốt ở tệp này, vì nó phải đo THỨ ĐÃ XUẤT RA.
 * ⚠️ TUYỆT ĐỐI KHÔNG cắt dấu ở tầng render để "cho sạch màn hình" — làm thế là
 * giấu khỏi mắt David, tức phá đúng cơ chế mà chú thích này dựng ra. Chỗ duy nhất
 * được phép cắt là thẻ meta (`lib/seo.ts`), vì chữ ở đó bị máy khác đọc và hiện
 * lại nguyên văn, ngoài tầm với của mọi lượt sửa sau.
 */
export const vi = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Testnet công khai của 9Chain, chạy trên Avalanche',
    // Một câu cho MỌI nút gọi ví. Trước 2026-08-27 câu này tồn tại HAI bản trùng
    // nguyên văn (`deChain.viTuChoi` và `chainCuaToi.themViTuChoi`) — hai bản của
    // cùng một câu là hai chỗ để chúng lệch nhau về sau mà không ai thấy.
    viTuChoi: 'Bạn đã từ chối trong ví. Chưa có gì thay đổi.',
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

  /**
   * ═══ BẢN CÔNG BỐ SAU NGÀY G — VIẾT SẴN 2026-08-27, DÙNG NGÀY 01/09 ═══
   * (Đ1-12 W0. Đây chính là "bản nháp công bố" mà chú thích đầu `re-genesis/page.tsx`
   * từng nhắc tới trong khi nó KHÔNG TỒN TẠI ở đâu cả — `grep` toàn repo ra 0 kết quả.)
   *
   * 🔴 VÌ SAO PHẢI VIẾT TRƯỚC, KHÔNG PHẢI VIẾT ĐÚNG HÔM ĐÓ:
   * Ngày G là ngày sinh lại mạng — người trực sẽ bận, và luật `[?]` bắt mọi chuỗi mới
   * phải qua David duyệt giọng. Không ai duyệt giọng được vào lúc đang sinh mạng.
   * Viết trước nghĩa là hôm đó chỉ phải **dán 2 giá trị** (`luuUrl`, `luuSha256`),
   * không phải viết hơn chục đoạn văn về mất mát tài sản trong lúc vội.
   *
   * 🔴 KHỐI RIÊNG, KHÔNG SỬA ĐÈ `reGenesis`. Bản tương lai phải còn nguyên tới đúng
   * phút chuyển — nếu ngày G bị hoãn, gỡ khối này ra là xong, không phải khôi phục.
   *
   * `luuUrl` / `luuSha256` để RỖNG có chủ ý: trang tự ẩn mục đó khi rỗng, nên bản
   * viết sẵn này an toàn để commit ngay hôm nay mà không hứa một đường dẫn chưa có.
   */
  reGenesisXong: {
    /** Điền vào ngày G. Rỗng ⇒ trang ẩn mục "bản lưu". */
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 đã sinh lại ngày {ngay}. Mọi số dư và chain tạo trước ngày đó không còn tồn tại.',
    bangNut: 'Điều này nghĩa là gì',
    nhan: 'Đã sinh lại',

    tieuDe: 'A1 đã sinh lại ngày {ngay}',
    moTa:
      'Mạng thử nghiệm A1 đã được dựng lại từ block 0. Chain, số dư và lịch sử giao dịch ' +
      'tạo trước ngày đó không còn tồn tại — không phải bị ẩn, mà là không còn. ' +
      'Trang này nói bạn đang thấy gì và cần làm gì.',

    thayGiTieuDe: 'Bạn sẽ thấy gì',
    thayGi1:
      'Ví của bạn vẫn kết nối được, vẫn hiện đúng tên mạng và đúng Chain ID {chainId} — ' +
      'vì Chain ID được giữ nguyên có chủ ý. Nhưng số dư sẽ là 0.',
    thayGi2:
      'Mọi L1 bạn từng đẻ đã biến mất khỏi danh bạ. Tên và Chain ID của chúng nay trống, ' +
      'ai cũng đăng ký lại được.',
    thayGi3:
      'Giao dịch bạn đã ký nhưng chưa phát đi thì đừng phát nữa — chúng thuộc về một mạng ' +
      'không còn tồn tại.',

    lamGiTieuDe: 'Bạn cần làm gì',
    lamGi1: 'Xin lại token thử ở trang faucet. Hạn mức đã được đặt lại cho mọi người.',
    lamGi2:
      'Gỡ từng L1 cũ khỏi ví — chúng có Chain ID riêng và nay trỏ vào chỗ trống. ' +
      'Mạng A1 chính thì KHÔNG cần gỡ, vì thông số của nó không đổi.',
    lamGi3: 'Đẻ lại chain của bạn nếu cần. Tên cũ có thể đã có người khác lấy.',

    luuTieuDe: 'Bản lưu của mạng cũ',
    luuMoTa:
      'Trạng thái cuối cùng của mạng trước khi sinh lại đã được lưu lại và công bố mã băm, ' +
      'để ai muốn đối chiếu đều kiểm được.',
  },

  /**
   * Re-genesis — xem `PLAN-REGENESIS-2026-09-01.md`, mục O3 và luật "nhiều lần cài".
   *
   * 🔴 NGÀY NẰM Ở ĐÚNG MỘT CHỖ (`ngay`), mọi chuỗi khác nội suy `{ngay}` qua `dien()`.
   * Cổng GO/NO-GO là 29/08 và sàn cứng là 06/09 — ngày này TRƯỢT ĐƯỢC. Chép ngày ra
   * nhiều chuỗi là tự đặt bẫy: lúc trượt sẽ sửa được chỗ này, sót chỗ kia, và trang
   * lại nói hai ngày khác nhau ở hai màn.
   *
   * 🔴 Vì sao các chuỗi cảnh báo bên dưới KHÔNG được làm nhẹ đi: chúng nói "vĩnh viễn"
   * là để chặn người dùng tưởng thu hồi thì lấy lại được tên. Sửa cho đúng sự thật
   * nghĩa là THU PHẠM VI ("trên mạng này"), không phải hạ giọng ("tạm thời").
   */
  reGenesis: {
    ngay: '01/09/2026',
    bang: 'Mạng A1 sinh lại ngày {ngay} — mọi chain, số dư và lịch sử tạo trước ngày đó sẽ bị xoá.',
    bangNut: 'Chi tiết',
    nhan: 'Sắp sinh lại',

    tieuDe: 'A1 sinh lại ngày {ngay}',
    moTa:
      'Toàn bộ mạng thử nghiệm A1 sẽ được dựng lại từ block 0. Mọi thứ tạo ra trước ngày ' +
      'đó sẽ không còn — không phải bị ẩn đi, mà là không còn tồn tại. Trang này nói rõ ' +
      'cái gì mất và bạn cần làm gì.',

    viSaoTieuDe: 'Vì sao phải sinh lại',
    viSao1:
      'Genesis của một mạng là bất biến. Đó chính là thứ làm nó đáng tin — không ai, kể cả ' +
      'người dựng ra nó, sửa được con số đã khắc vào block 0.',
    viSao2:
      'Cái giá của điều đó: muốn đổi một con số nằm trong genesis thì không có đường nào ' +
      'khác ngoài dựng lại mạng từ đầu. A1 đổi tổng cung lên 9.000.000.000 LOVE9, kéo theo ' +
      'cả dải tham số staking phải tính lại cho khớp.',
    viSao3:
      'Đây là testnet, và sinh lại là việc testnet được phép làm. Thực ra đó là lý do ' +
      'testnet tồn tại: để những thay đổi kiểu này xảy ra ở đây, chứ không xảy ra trên ' +
      'mainnet.',

    matTieuDe: 'Cái gì sẽ mất',
    matMoTa: 'Tất cả, không có ngoại lệ:',
    mat1: 'Mọi L1 người dùng đã đẻ, kể cả chain đang chạy tốt.',
    mat2: 'Mọi số dư LOVE9, gồm cả token nhận từ faucet.',
    mat3: 'Mọi giao dịch, mọi block, toàn bộ lịch sử của C-Chain, P-Chain và X-Chain.',
    mat4: 'Mọi validator và mọi khoản uỷ quyền.',

    conTieuDe: 'Cái gì giữ lại',
    conMoTa:
      'Trước khi xoá, toàn bộ mạng đang chết sẽ được xuất ra kèm mã băm và công bố, để dấu ' +
      'vết còn truy lại được. Cái đã xảy ra vẫn kiểm chứng được, kể cả khi mạng chạy nó ' +
      'không còn. Đường dẫn bản lưu sẽ đăng ở đây trong ngày sinh lại.',

    lamTieuDe: 'Bạn cần làm gì',
    lamTruoc: 'Trước ngày sinh lại:',
    lam1:
      'Đừng xây thứ gì cần dữ liệu sống lâu trên A1 lúc này. Nếu bạn đang thử một ý tưởng ' +
      'thì cứ tự nhiên — chỉ đừng coi chain hiện tại là chỗ cất giữ.',
    lamSau: 'Sau ngày sinh lại:',
    // 🔴 BA CHUỖI NÀY ĐÃ SỬA SAU D-047, ĐỪNG LÙI VỀ BẢN CŨ. Bản cũ bảo người dùng
    // "gỡ mạng chính rồi thêm lại, đừng chép thông số cũ" — lời khuyên đó chỉ đúng
    // cho kịch bản chainId ĐỔI. D-047 chốt GIỮ `9000000009`, nên thông số mạng mới
    // y hệt cũ: gỡ rồi thêm lại là một thao tác không đổi gì cả. Cái THẬT SỰ cần gỡ
    // là từng L1 riêng (những chain đó biến mất), và cái thật sự cần làm là xin lại
    // token. Cùng họ lỗi với "số chép sang thang khác": bê lời khuyên từ một kịch
    // bản sang kịch bản mà tiền đề của nó không còn đúng.
    lam2:
      'Gỡ khỏi ví từng L1 riêng bạn đã thêm — những chain đó không còn tồn tại, và ví trỏ ' +
      'vào chúng sẽ chỉ nằm im. Mạng A1 chính thì không phải gỡ: thông số của nó không đổi.',
    lam3:
      'Nếu ví bạn chưa có mạng A1, thêm bằng nút ở trang faucet thay vì gõ tay thông số.',
    lam4: 'Xin lại token từ faucet, và đẻ lại chain nếu bạn muốn.',

    // ── Hai vế D-047 giao lại cho câu chữ ────────────────────────────────────
    // D-047 giữ chainId `9000000009` sau khi lý do mạnh nhất của phía "đổi" (phát
    // lại chữ ký SIWE) bị đo là ĐỔ. Hai lý do còn lại thì ĐỨNG, và quyết định ghi
    // rõ chúng "xử bằng CÂU CHỮ trên trang, không bằng đổi số" — tức là hai chuỗi
    // dưới đây LÀ phần thực thi của D-047, không phải trang trí.
    // 🔴 KHÔNG thêm nút "thêm lại mạng" vào trang này. Nút đó đã có ở faucet
    // (`FaucetForm.tsx:114`); nhân đôi một nút gọi ví là nhân đôi chỗ để hai bản
    // lệch nhau, mà đây đúng là loại nút không được phép lệch.
    imLangTieuDe: 'Ví của bạn sẽ không báo gì cả',
    imLangMoTa:
      'Mạng mới giữ nguyên Chain ID {chainId}, cùng địa chỉ RPC và cùng tên với mạng cũ. Đó ' +
      'là chủ ý — để mọi tài liệu và hướng dẫn đã phát ra ngoài không thành sai. Cái giá là ' +
      'ví không có một dấu hiệu nào để nhận ra nó vừa nối vào một mạng khác. Hai chuyện dưới ' +
      'đây vì thế sẽ xảy ra trong im lặng.',
    imLang1:
      'Ví còn cấu hình cũ vẫn nối được, vẫn hiện đúng tên mạng, và sẽ báo số dư 0. Con số đó ' +
      'ĐÚNG: token cũ của bạn không còn tồn tại, chứ không phải bị ẩn đi. Bạn không cần thêm ' +
      'lại mạng — chỉ cần xin token mới ở trang faucet. Nếu ví báo giao dịch kẹt hoặc sai số ' +
      'thứ tự, hãy xoá dữ liệu hoạt động của mạng đó trong ví: ví còn nhớ số đếm giao dịch ' +
      'của chuỗi đã chết, trong khi chuỗi mới đếm lại từ 0.',
    imLang2:
      'Nếu bạn còn giao dịch đã ký mà chưa phát lên mạng, hãy bỏ nó đi. Chữ ký vẫn hợp lệ ' +
      'trên mạng mới, vì Chain ID không đổi. Nó sẽ chết vì ví không còn tiền — nhưng đúng ' +
      'lúc bạn xin token từ faucet thì nó chạy được, và có thể tự chạy vào một thời điểm ' +
      'bạn không ngờ.',

    lapTieuDe: 'Chuyện này còn xảy ra nữa không',
    lapMoTa:
      'Có thể. A1 vẫn là testnet, và cho tới khi cộng đồng chọn hướng mainnet giữa A1 và ' +
      'C1, chúng tôi vẫn giữ quyền sinh lại mạng khi cần đổi thứ nằm trong genesis. Điều ' +
      'chúng tôi cam kết là sẽ báo trước, và nói thẳng cái gì mất.',

    ngayLuuY: 'Ngày có thể trượt',
    ngayLuuYMoTa:
      'Ngày {ngay} phụ thuộc một cổng kiểm trước đó. Nếu trượt, chúng tôi sẽ đổi ngày trên ' +
      'trang này thay vì im lặng.',
  },

  dieuHuong: {
    trangChu: 'Trang chủ',
    faucet: 'Nhận token thử',
    console: 'Đẻ chain',
    chainCuaToi: 'Chain của tôi',
    bang: 'A1 ↔ C1',
    danhBa: 'Danh bạ L1',
    explorer: 'Explorer',
    banGiao: 'Mở 9Scan-A1 ở tab mới',
  },

  trangChu: {
    nhanTestnet: 'Testnet — token không có giá trị thật',
    nutChinh: 'Đẻ chain của bạn',
    nutPhu: 'Nhận token thử trước đã',

    // ── Trang chủ — David chọn BẢN C ngày 2026-08-26 (M10.3, U-3).
    //
    // 🔴 SỬA 2026-08-27 (Đ1-4). Bản cũ CHỈ TRỎ vào bảng bên dưới:
    //   cTieuDe: 'Những L1 này do người dùng đẻ ra'
    //   cPhu:    'Mỗi dòng là một chain thật đang chạy trên A1, có chủ riêng…'
    // Đo `27/08`: danh bạ có **0 chain sống**, cả 6 bản ghi đều nằm trong `retired`
    // và đều là chain smoke-test do MÁY sinh (`SmokeA8ER40`, `WarpNguonD46U`…).
    // ⇒ Hai câu đó trỏ vào những dòng KHÔNG TỒN TẠI. Không phải nói quá — nói sai.
    //
    // Cách sửa theo đúng luật đã dùng cho khối `reGenesis`: **THU PHẠM VI cho đúng
    // sự thật, KHÔNG hạ giọng**. Tiêu đề nay là một câu về SẢN PHẨM (đúng ở cả
    // trạng thái đầy lẫn rỗng); câu "mỗi dòng là một chain thật" hạ xuống làm chú
    // thích NGAY TRÊN bảng, nơi nó chỉ xuất hiện khi bảng có dòng.
    cTieuDe: 'Đẻ chain riêng của bạn trên A1',
    cPhu: 'Một L1 của riêng bạn, có chủ là ví bạn ký, chạy thật trên mạng thử nghiệm. Mất khoảng ba phút.',
    // Chỉ hiện khi bảng CÓ dòng — xem `ChainTable`.
    cBangChuThich: 'Mỗi dòng là một chain thật đang chạy trên A1, có chủ riêng.',
    cCot: 'Chain',
    cCotKieu: 'Kiểu',
    cCotChu: 'Chủ sở hữu',
    cMacDinh: 'mặc định của hệ thống',
    // Bản cũ: 'Chưa có L1 nào ngoài chain hệ thống' — khẳng định có một chain hệ
    // thống, mà bảng KHÔNG hề hiện chain nào. Câu mới không hứa thứ không thấy.
    cTrong: 'Chưa có L1 nào đang chạy',
    cTrongMoTa: 'Bạn sẽ là người đầu tiên. Danh bạ cập nhật ngay sau khi chain của bạn lên.',

    // ── Tự tố, đứng ngay dưới khối số liệu (Đ1-4) ────────────────────────────
    // 🔴 Vì sao câu này phải có: 9 validator, 9/9 connected — đúng, và đó là một chỉ
    // số kỹ thuật THẬT. Nhưng cả 9 chạy trên **một máy, một nhà cung cấp**
    // (`139.99.145.13`, cùng máy chạy Caddy + faucet + console). Để một con số đúng
    // đứng ở vị trí gợi ra kết luận sai thì site không nói dối bằng câu chữ, nhưng
    // vẫn để người đọc tự rút ra điều không đúng. Đây là chỗ rẻ nhất để nói thẳng.
    tuTo: '9 validator hiện chạy trên cùng một máy chủ, cùng một nhà cung cấp — phân tán về giao thức, chưa phân tán về hạ tầng.',
    // Đo 10 mẫu/5 phút: P-Chain đứng yên, C-Chain đứng yên. Đây là BÌNH THƯỜNG.
    blockDungYen: 'Avalanche không đẻ block rỗng, nên số block đứng yên khi chưa ai giao dịch là bình thường. Phép đo sống/chết là số validator ở ô bên cạnh.',
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
    moTaTen:
      'Chữ, số và dấu cách. 2–32 ký tự. Trên mạng này, tên đã dùng thì không cấp lại — ' +
      'kể cả cho chain đã thu hồi.',
    tenXau: 'Tên chỉ gồm chữ, số và dấu cách, dài 2–32 ký tự.',
    nhanKieu: 'Kiểu chain',
    moTaKieu: 'Chọn xong là cố định — genesis của chain không sửa lại được.',
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
    soatReGenesis:
      'Và một điều nữa phải biết trước khi bấm: A1 sinh lại toàn mạng ngày {ngay}. ' +
      'Chain bạn đẻ hôm nay sẽ bị xoá cùng mạng cũ — không phải ẩn đi, mà là không còn.',
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
    // Ba chuỗi này lấp đúng chỗ trước đây `catch {}` trắng — nút hỏng mà không một
    // chữ nào hiện ra, người dùng bấm lại vô hạn.
    xongThemViLoi: 'Không thêm được chain vào ví. {chiTiet}',
    xongKichHoatLoi: 'Không kích hoạt được chain. {chiTiet}',

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
    themViLoi: 'Không thêm được vào ví. {chiTiet}',

    thuHoi: 'Thu hồi',
    thuHoiTieuDe: 'Thu hồi “{ten}”?',
    thuHoiY1: 'Chain ngừng phục vụ RPC ngay lập tức và biến khỏi danh bạ công khai.',
    thuHoiY2:
      'Thu hồi KHÔNG xoá subnet trên P-Chain — thứ đã đẻ ra ở đó thì không gỡ được, ' +
      'chừng nào mạng này còn chạy. Nó cũng không xoá mạng khỏi ví của những người đã ' +
      'thêm chain này.',
    thuHoiY3:
      'Tên và Chain ID bị giữ chỗ và KHÔNG cấp lại cho ai trên mạng này. Cấp lại Chain ID ' +
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
    daThuHoiMoTa: 'Giữ chỗ tên và Chain ID trên mạng này.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — bảng so sánh',
    // 🔴 SỬA 2026-08-27 (Đ1-4). Bản cũ kết bằng "…chọn hướng mainnet bằng dữ liệu,
    // không bằng tranh luận" — rồi khối NGAY DƯỚI tự bác lại: điểm là đội tự chấm,
    // 8/10 tiêu chí là `kienTruc` (suy từ thiết kế, không phải đo), và **cả 2 tiêu
    // chí `song` cũng chưa có số C1**. Hứa "bằng dữ liệu" ở câu mở đầu rồi đính
    // chính ở khối kế là tự làm hỏng uy tín của chính bảng.
    // Câu mới nói đúng thứ bảng này LÀ: một bản ghi công khai các đánh đổi.
    moTa:
      '9Chain chạy HAI testnet song song của cùng một sản phẩm, khác nhau ở engine: ' +
      'A1 trên Avalanche, C1 trên Cosmos. Bảng này ghi lại các đánh đổi giữa hai hướng, ' +
      'công khai để ai cũng phản bác được — phần C1 hiện chưa có số đo sống.',

    // 🔴 Câu này KHÔNG được bỏ: điểm dưới đây do đội tự chấm.
    tuChamTieuDe: 'Điểm dưới đây là ĐỘI TỰ CHẤM, không phải đo độc lập',
    tuChamMoTa:
      'Cột "đo thế nào" nói rõ mỗi tiêu chí kiểm bằng cách gì. Tiêu chí nào chưa có ' +
      'phép đo có ngày thì đó là đánh giá kiến trúc, không phải số liệu. Trọng số do ' +
      'bạn đặt — điểm đổi theo.',

    cotSo: '#',
    cotTieuChi: 'Tiêu chí',
    cotLoai: 'Loại',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Trọng số',
    loaiKienTruc: 'kiến trúc',
    loaiSong: 'số sống',

    tongDiem: 'Tổng điểm theo trọng số của bạn',
    hoaNhau: 'Hoà nhau',
    dangDan: 'đang dẫn',

    soLieuTieuDe: 'Số liệu sống',
    a1Validator: 'A1 — validator kết nối',
    a1Chain: 'A1 — L1 đang sống',
    a1Block: 'A1 — block C-Chain',
    c1Vang: 'C1 — chưa nối được',
    c1VangMoTa:
      'Cần URL Cosmos REST của C1 (cổng 1317). Bảng vẫn dùng được: phần A1 là số ' +
      'sống, phần C1 là đánh giá kiến trúc như các tiêu chí còn lại.',
    dangDo: 'đang đo…',
    khongDo: 'chưa đo được',
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
    themMangTuChoi: 'Bạn đã bấm từ chối trong ví. Bấm lại nếu muốn thêm mạng.',
    themMangLoi: 'Ví không thêm được mạng. Thêm tay bằng thông số bên cạnh — và gửi dòng dưới đây cho đội kỹ thuật:',
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
    thongSoThapPhan: 'Số thập phân',
    thongSoExplorer: 'Explorer',
    // Người đọc TOKENOMICS thấy "9 chữ số" rồi mở ví thấy 18 sẽ kết luận tài liệu
    // sai — và họ không có cách nào tự biết là không. Cả hai đều đúng, ở hai chỗ
    // khác nhau. Xem `docs/TOKENOMICS.md` §0.
    thapPhanGiaiThich:
      'Ví hiện 18 chữ số vì C-Chain chạy EVM. Trên P/X-Chain, LOVE9 đếm bằng 9 chữ số. ' +
      'Cùng một đồng, hai thang đo — không phải hai loại token.',
    loiChung: 'Không gửi được. {chiTiet}',
  },

  loi: {
    khongKetNoi: 'Không kết nối được tới mạng',
    khongKetNoiMoTa: 'Có thể mạng đang bận hoặc đường truyền của bạn bị gián đoạn.',
    trongRong: 'Chưa có gì ở đây',
  },

  /**
   * Trang 404 (Đ1-2, 2026-08-27).
   *
   * Trước lượt này, mọi URL sai rơi vào vỏ 404 của Blockscout: 75.964 byte, tiếng
   * Anh, `<title>` rỗng, `grep -ci 9chain` = 0, không một liên kết nào về site.
   *
   * Giọng: KHÔNG xin lỗi, KHÔNG đùa. Nói đúng ba việc — chuyện gì đã xảy ra, vì sao
   * nó có thể xảy ra, và đi tiếp bằng đường nào. Người tới đây đang lạc, không đang
   * cần được giải trí.
   */
  khongThay: {
    ma: '404',
    tieuDe: 'Không có trang này',
    moTa:
      'Đường dẫn bạn mở không tồn tại trên 9Chain Testnet A1. ' +
      'Có thể nó đã được đổi tên, hoặc URL bị thiếu vài ký tự lúc sao chép.',
    dayLaGi: 'Ba đường dùng nhiều nhất:',
    veTrangChu: 'Về trang chủ',
    diFaucet: 'Nhận token thử',
    diDeChain: 'Đẻ chain của bạn',
    // Ghi chú cho người đọc mã, KHÔNG hiện ra: explorer nằm ở tên miền khác
    // (9Scan-A1) và Blockscout phục vụ `/tx/`, `/address/` ngay trên tên miền này —
    // nên nếu người dùng đang tìm một giao dịch, họ KHÔNG lạc, họ chỉ gõ sai băm.
    timGiaoDich: 'Đang tìm một giao dịch hay một địa chỉ? Kiểm lại mã băm rồi thử lại.',
  },
} as const;

export type Tu = typeof vi;

/** Thay `{khoa}` trong chuỗi bằng giá trị. Thiếu khoá thì GIỮ NGUYÊN dấu ngoặc —
 *  một chỗ trống lặng lẽ đọc như dữ liệu bị mất, còn `{so}` lộ ra thì sửa được ngay. */
export function dien(mau: string, gt: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (nguyen, k) => (k in gt ? String(gt[k]) : nguyen));
}
