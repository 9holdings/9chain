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
import type { Tu } from '../en';

export const vi: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    // 🔴 "chạy trên Avalanche" ĐÃ BỊ GỠ 2026-08-27 — nó SAI, và sai tốn kém.
    // Đo (2026-08-28, mạng công khai): `info.getNetworkID` → **999999999**,
    // `getNetworkName` → **`9chain-a1-g0`**.
    // ⚠️ Chú thích này từng ghi `9001` / `network-9001`. CẢ HAI ĐỀU CHẾT: `9001` mất
    // khi mạng sinh lại sang thế hệ g0 (D-081), còn `network-9001` chưa bao giờ đúng
    // sau D-050 — lúc đó tên đã là `9chain-a1`. Một chú thích chép hằng số của mạng
    // sẽ mục đi lặng lẽ, vì không cổng nào đọc chú thích. Nguồn duy nhất là
    // `lib/chain.ts`, và thứ giữ nó khớp mạng thật là `check-chain-id.mjs`.
    // Avalanche mainnet là 1, Fuji là 5 ⇒ A1 là **mạng riêng biệt**, không nối vào
    // mạng Avalanche nào. README gọi đúng từ đầu ("sovereign fork của avalanchego");
    // chỉ câu quảng bá công khai là nói khác.
    // Người đọc hiểu "chạy TRÊN X" = chạy trên MẠNG X, rồi suy ra ba điều đều sai:
    // tra được LOVE9 trên Snowtrace · được validator Avalanche bảo vệ · có cầu sẵn
    // sang C-Chain. Không điều nào đúng — A1 có 9 node trên một máy.
    //
    // 🔴 VÀ ĐỪNG ĐỔI THÀNH "dựng từ mã nguồn Avalanche" (bản tôi đề xuất đầu tiên,
    // David bác): câu đó nói về GỐC GÁC — thì quá khứ, cố định — nên nó ngầm đặt
    // trần rằng 9Chain mãi là bên tiêu thụ mã của người khác. Hôm nay A1 đã có 16
    // patch, netgen riêng, cơ chế khắc chữ; và sẽ còn đi xa hơn, như mọi dự án theo
    // mô hình này. Chữ phải mô tả CÁI ĐANG VẬN HÀNH, không phải NƠI XUẤT PHÁT.
    //
    // "engine" là từ dự án đã dùng ở `/compare/` — giữ một từ vựng cho cả hai bề mặt.
    moTaNgan: 'Testnet công khai của 9Chain, mạng riêng chạy engine Avalanche',
    // 🔴 BẢN NGẮN CHO <title>, KHÔNG PHẢI BẢN DƯ THỪA (2026-08-27).
    // Ghép `tenSanPham — moTaNgan` ra: "9Chain Testnet A1 — Testnet công khai của
    // 9Chain, mạng riêng chạy engine Avalanche" = **82 ký tự**, lặp cả "9Chain" lẫn
    // "Testnet", và kết quả tìm kiếm cắt ở khoảng 60 ⇒ đúng vế mang thông tin mới
    // ("mạng riêng chạy engine Avalanche") là vế bị cắt mất.
    // Bản ngắn bỏ phần đã có trong tên sản phẩm, giữ lại đúng phần người đọc chưa
    // biết. `moTaNgan` vẫn dùng nguyên cho câu văn (dòng dẫn trang chủ, chân trang).
    tagTitle: 'mạng riêng chạy engine Avalanche',
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

    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: 'Đã sinh lại một lượt ngày 27/08/2026',
    daXayRaMoTa:
      'A1 đã sinh lại một lượt ngày 27/08/2026, trước ngày ghi bên dưới. Nếu bạn có token thử trước đó thì số dư nay là 0 — con số đó đúng, không phải ví bạn hỏng. Không chain nào của người dùng bị mất: danh bạ khi ấy chỉ có chain do máy kiểm thử sinh ra. Hãy xin lại token ở trang faucet.',
    ngayLuuY: 'Ngày có thể trượt',
    ngayLuuYMoTa:
      'Ngày {ngay} phụ thuộc một cổng kiểm trước đó. Nếu trượt, chúng tôi sẽ đổi ngày trên ' +
      'trang này thay vì im lặng.',
  },

  /**
   * Chân trang (Đ1-13, 2026-08-27).
   *
   * Trước lượt này chân trang có **0 liên kết** — chỉ logo + hai dòng chữ. Với một
   * site mà mọi đường đi đều nằm ở thanh điều hướng trên cùng, chân trang rỗng là
   * một nửa màn hình không làm gì.
   *
   * 🔴 LUẬT CỦA MỤC NÀY: chỉ đặt liên kết đã ĐO LÀ SỐNG. Chỗ chưa có trang thì
   * **để trống**, không đặt liên kết chết — một chân trang đầy liên kết hỏng còn tệ
   * hơn một chân trang rỗng, vì nó hứa rồi nuốt lời ngay tại chỗ.
   * Đo `27/08`: `a1.9scan.org` 200 · `9chain.org` 200 ·
   * 🔴 `9chain.org/docs/` **404 ở cả ba dạng** ⇒ CỐ Ý không có mục tài liệu ở đây.
   *
   * ⚠️ Mục "liên hệ / báo lỗi" cũng CỐ Ý chưa có: kênh liên hệ thật là câu hỏi **D2**
   * David chưa trả lời. Bịa một địa chỉ email để chân trang trông đầy đủ là thứ tệ
   * nhất trong cả mục này — người ta sẽ viết vào đó và không ai đọc.
   */
  chanTrang: {
    dungThu: 'Dùng thử',
    kham: 'Xem mạng',
    veDuAn: 'Về dự án',
    explorer: 'Explorer 9Scan-A1',
    trangChinh: 'Trang chính 9Chain',
    moTabMoi: '(mở tab mới)',
    // 🔴 `aria-label` cho <nav> chân trang. Thiếu nó thì trang 404 (vốn có <nav>
    // riêng cho ba đường ra) có HAI landmark cùng vai, không cái nào có tên —
    // axe bắt đúng: `landmark-unique`. Trình đọc màn hình đọc ra "navigation,
    // navigation" và người dùng không biết cái nào là cái nào.
    nhanNav: 'Liên kết chân trang',
    // 🔴 KHÔNG dùng lại `reGenesis.bangNut` ("Chi tiết") ở đây. Chuỗi đó viết cho dải
    // banner, nơi câu ngay trước nó đã nói rõ chuyện gì; tách ra khỏi ngữ cảnh thì
    // chân trang đọc thành "Về dự án → Chi tiết" — không nói được gì cả.
    // Cùng lớp lỗi với việc dùng chung `og:*`: một chuỗi đúng ở chỗ này không tự
    // động đúng ở chỗ khác.
    reGenesis: 'Kế hoạch sinh lại mạng',
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

  loadTest: {
    badge: 'Bài bơm tải',
    banner: 'Chúng tôi đang chạy một bài bơm tải công khai — {tps} giao dịch mỗi giây, do chúng tôi tự sinh ra, không phải người dùng thật.',
    bannerLink: 'Xem số liệu đang chạy',
    title: 'Bài bơm tải công khai',
    intro: 'A1 là mạng thử nghiệm còn non, gần như chưa có người dùng thật, nên để yên thì nó hầu như không sinh block nào. Chúng tôi tự sinh một dòng giao dịch đều đặn để mạng luôn được vận hành và để bạn nhìn thấy nó đang chạy. Dòng giao dịch này là của chúng tôi. Nó không phải mức sử dụng, và chúng tôi cũng không tính nó là mức sử dụng — mọi địa chỉ gửi nó đều liệt kê bên dưới để bạn trừ ra được.',
    running: 'Đang chạy',
    stopped: 'Hiện không chạy',
    stoppedWhy: 'Lý do đã ghi: {reason}',
    labelTps: 'Giao dịch mỗi giây',
    labelBlockHeight: 'Block C-Chain',
    labelSecondsPerBlock: 'Số giây mỗi block',
    labelTotal: 'Giao dịch đã chốt từ lúc bắt đầu',
    labelUptime: 'Đã chạy được',
    committedNote: 'Những con số này đếm từ chính các block, không phải từ số lượt chúng tôi gửi đi. Một giao dịch mạng đã nhận nhưng chưa bao giờ đưa vào block thì không được tính ở đây.',
    addressesTitle: 'Chín địa chỉ gửi',
    addressesNote: 'Mọi giao dịch từ những địa chỉ này đều do máy của chúng tôi sinh ra. Lọc chúng đi để thấy phần hoạt động thật, nếu có.',
    measuring: 'Đang đọc trạng thái bài bơm tải…',
    notMeasured: 'Không đọc được trạng thái bài bơm tải',
    notMeasuredMore: 'Trang vẫn dùng được — đây chỉ là phần hiển thị tình trạng.',
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
      'A1 engine Avalanche, C1 engine Cosmos. Bảng này ghi lại các đánh đổi giữa hai hướng, ' +
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

  /** Bộ chọn ngôn ngữ. Xem `components/ChonNgonNgu.tsx` cho lý do từng nhãn. */
  chonNgonNgu: {
    nhan: 'Ngôn ngữ',
    mayDich: 'máy dịch',
    mayDichGiaiThich: 'Chỉ bản tiếng Việt có người soát. Các bản còn lại là máy dịch và có thể sai — bản tiếng Anh là nguồn chuẩn.',
    chuaCo: 'chưa có',
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
    nhanNav: 'Đường đi tiếp',
    veTrangChu: 'Về trang chủ',
    diFaucet: 'Nhận token thử',
    diDeChain: 'Đẻ chain của bạn',
    // Ghi chú cho người đọc mã, KHÔNG hiện ra: explorer nằm ở tên miền khác
    // (9Scan-A1) và Blockscout phục vụ `/tx/`, `/address/` ngay trên tên miền này —
    // nên nếu người dùng đang tìm một giao dịch, họ KHÔNG lạc, họ chỉ gõ sai băm.
    timGiaoDich: 'Đang tìm một giao dịch hay một địa chỉ? Kiểm lại mã băm rồi thử lại.',
  },
};

export default vi;
