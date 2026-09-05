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
 * ═══ 2026-09-04 — DAVID DUYỆT LÔ THỨ HAI (danh bạ + điện thoại + chữ máy chủ) ═══
 * Hai lô, nguyên văn ở cuối `docs/WEB-PROGRESS.md`:
 *   • danh bạ 108 L1 — `directory.*` (68 khoá) · `home.moreChains` · `home.disclosure`
 *   • đợt `04/09` — `common.noWalletMobile` · `common.openInMetaMask` ·
 *     `presets.*` (6 kiểu × tên + mô tả) · `steps.*` (3 bước)
 * Cả hai lô **đã lên sóng trước khi được duyệt** — duyệt ở đây là bắt kịp lời khai, không
 * phải mở cổng cho chúng ra. 28 bản máy dịch vẫn `review: 'machine'`, không đổi.
 *
 * Lô thứ ba cùng ngày, David duyệt `2026-09-04` (đêm): `faucet.addressFromWallet` và
 * `faucet.useWalletAddress` — sinh ra khi ô địa chỉ faucet biết tự điền từ ví.
 *
 * 🔴 `home.disclosure` là chuỗi DUY NHẤT trong lô khai một sự thật VỀ MẠNG, nên nó được
 * duyệt KÈM PHÉP ĐO của đúng ngày duyệt — `check-decentralisation-claim.mjs` `04/09`:
 * mạng báo **11 validator, 10 connected**, khớp câu "9 trong số 11 … chỉ một trong hai
 * đang trực tuyến". ⚠️ Lời duyệt này KHÔNG theo mạng: khách thứ ba vào, hoặc khách cũ
 * lên lại, là câu SAI dù chữ chưa ai đụng. Cổng đó phải đỏ, và câu phải viết lại — đừng
 * viện "David đã duyệt" để giữ một câu đã hết đúng.
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
import type { Dict } from '../en';

export const vi: Dict = {
  common: {
    productName: '9Chain Testnet A1',
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
    shortDesc: 'Testnet công khai của 9Chain, mạng riêng chạy engine Avalanche',
    // 🔴 BẢN NGẮN CHO <title>, KHÔNG PHẢI BẢN DƯ THỪA (2026-08-27).
    // Ghép `tenSanPham — moTaNgan` ra: "9Chain Testnet A1 — Testnet công khai của
    // 9Chain, mạng riêng chạy engine Avalanche" = **82 ký tự**, lặp cả "9Chain" lẫn
    // "Testnet", và kết quả tìm kiếm cắt ở khoảng 60 ⇒ đúng vế mang thông tin mới
    // ("mạng riêng chạy engine Avalanche") là vế bị cắt mất.
    // Bản ngắn bỏ phần đã có trong tên sản phẩm, giữ lại đúng phần người đọc chưa
    // biết. `moTaNgan` vẫn dùng nguyên cho câu văn (dòng dẫn trang chủ, chân trang).
    tagline: 'mạng riêng chạy engine Avalanche',
    // Một câu cho MỌI nút gọi ví. Trước 2026-08-27 câu này tồn tại HAI bản trùng
    // nguyên văn (`deChain.viTuChoi` và `chainCuaToi.themViTuChoi`) — hai bản của
    // cùng một câu là hai chỗ để chúng lệch nhau về sau mà không ai thấy.
    walletRejected: 'Bạn đã từ chối trong ví. Chưa có gì thay đổi.',
    noWalletMobile: 'Trình duyệt trên điện thoại không cài được tiện ích ví. Hãy mở trang này bên trong app MetaMask — trình duyệt có sẵn trong app đã có ví.',
    openInMetaMask: 'Mở trong app MetaMask',
    loading: 'Đang tải…',
    retry: 'Thử lại',
    copy: 'Sao chép',
    copied: 'Đã chép',
    close: 'Đóng',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    switchToDark: 'Chuyển sang nền tối',
    switchToLight: 'Chuyển sang nền sáng',
    skipToContent: 'Bỏ qua, tới nội dung chính',
    stepDone: ' — xong',
    stepRunning: ' — đang chạy',
    stepFailed: ' — hỏng',
    stepPending: ' — chờ',
  },

  presets: {
    standard: {
      name: 'Tiêu chuẩn',
      desc: 'Một chain EVM thường. Chủ chain nhận toàn bộ token genesis và quyền chỉnh phí.',
    },
    'zero-fee': {
      name: 'Phí gần bằng 0',
      desc: 'baseFee = 1 wei, giao dịch trả đúng mức sàn đó (một lượt chuyển tốn 0,000000000000021 LOVE9). Hợp cho game, thử nghiệm và chain nội bộ. Đổi lại: gần như không có gì cản spam.',
    },
    'high-throughput': {
      name: 'Thông lượng cao',
      desc: 'Mỗi block chứa gấp năm lần số giao dịch (gasLimit 60 triệu thay vì 12 triệu). Hợp cho game, sàn giao dịch, mọi thứ có dòng giao dịch nhỏ đều đặn. Đổi lại: block nặng hơn, và ai chạy node cho chain này cần máy mạnh hơn.',
    },
    mintable: {
      name: 'Cung có thể in thêm',
      desc: 'Chủ chain có thể in thêm token gốc bất cứ lúc nào qua precompile 0x0200000000000000000000000000000000000001. Tổng cung KHÔNG cố định — ai dùng chain này cần biết điều đó.',
    },
    'owner-deploy-only': {
      name: 'Chỉ chủ chain được triển khai hợp đồng',
      desc: 'Mọi người khác vẫn gửi được giao dịch và dùng hợp đồng có sẵn, nhưng không triển khai hợp đồng riêng được. Chủ chain cấp quyền đó cho bất kỳ ai qua precompile 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Có kiểm soát (chỉ ví được duyệt mới gửi)',
      desc: 'Chỉ địa chỉ trong danh sách mới GỬI được giao dịch. Hợp cho chain nội bộ của công ty. ⚠️ Đây là kiểu chặt nhất: một ví lạ vào đây không làm được gì cả.',
    },
  },
  steps: {
    genesis: 'Đang dựng genesis',
    subnet: 'Đang tạo subnet + blockchain trên P-Chain',
    rpc: 'Đang chờ RPC của L1 trả lời',
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
  rebuildDone: {
    /** Điền vào ngày G. Rỗng ⇒ trang ẩn mục "bản lưu". */
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 đã sinh lại ngày {date}. Mọi số dư và chain tạo trước ngày đó không còn tồn tại.',
    bannerLink: 'Điều này nghĩa là gì',
    badge: 'Đã sinh lại',

    title: 'A1 đã sinh lại ngày {date}',
    desc:
      'Mạng thử nghiệm A1 đã được dựng lại từ block 0. Chain, số dư và lịch sử giao dịch ' +
      'tạo trước ngày đó không còn tồn tại — không phải bị ẩn, mà là không còn. ' +
      'Trang này nói bạn đang thấy gì và cần làm gì.',

    willSeeTitle: 'Bạn sẽ thấy gì',
    willSee1:
      'Ví của bạn vẫn kết nối được, vẫn hiện đúng tên mạng và đúng Chain ID {chainId} — ' +
      'vì Chain ID được giữ nguyên có chủ ý. Nhưng số dư sẽ là 0.',
    willSee2:
      'Mọi L1 bạn từng đẻ đã biến mất khỏi danh bạ. Tên và Chain ID của chúng nay trống, ' +
      'ai cũng đăng ký lại được.',
    willSee3:
      'Giao dịch bạn đã ký nhưng chưa phát đi thì đừng phát nữa — chúng thuộc về một mạng ' +
      'không còn tồn tại.',

    toDoTitle: 'Bạn cần làm gì',
    toDo1: 'Xin lại token thử ở trang faucet. Hạn mức đã được đặt lại cho mọi người.',
    toDo2:
      'Gỡ từng L1 cũ khỏi ví — chúng có Chain ID riêng và nay trỏ vào chỗ trống. ' +
      'Mạng A1 chính thì KHÔNG cần gỡ, vì thông số của nó không đổi.',
    toDo3: 'Đẻ lại chain của bạn nếu cần. Tên cũ có thể đã có người khác lấy.',

    archiveTitle: 'Bản lưu của mạng cũ',
    archiveDesc:
      'Trạng thái cuối cùng của mạng trước khi sinh lại đã được lưu lại và công bố mã băm, ' +
      'để ai muốn đối chiếu đều kiểm được.',
  },

  /**
   * Re-genesis — xem `PLAN-REGENESIS-2026-09-01.md`, mục O3 và luật "nhiều lần cài".
   *
   * 🔴 NGÀY NẰM Ở ĐÚNG MỘT CHỖ (`ngay`), mọi chuỗi khác nội suy `{date}` qua `interpolate()`.
   * Cổng GO/NO-GO là 29/08 và sàn cứng là 06/09 — ngày này TRƯỢT ĐƯỢC. Chép ngày ra
   * nhiều chuỗi là tự đặt bẫy: lúc trượt sẽ sửa được chỗ này, sót chỗ kia, và trang
   * lại nói hai ngày khác nhau ở hai màn.
   *
   * 🔴 Vì sao các chuỗi cảnh báo bên dưới KHÔNG được làm nhẹ đi: chúng nói "vĩnh viễn"
   * là để chặn người dùng tưởng thu hồi thì lấy lại được tên. Sửa cho đúng sự thật
   * nghĩa là THU PHẠM VI ("trên mạng này"), không phải hạ giọng ("tạm thời").
   */
  rebuild: {
    date: '01/09/2026',
    banner: 'Mạng A1 sinh lại ngày {date} — mọi chain, số dư và lịch sử tạo trước ngày đó sẽ bị xoá.',
    bannerLink: 'Chi tiết',
    badge: 'Sắp sinh lại',

    title: 'A1 sinh lại ngày {date}',
    desc:
      'Toàn bộ mạng thử nghiệm A1 sẽ được dựng lại từ block 0. Mọi thứ tạo ra trước ngày ' +
      'đó sẽ không còn — không phải bị ẩn đi, mà là không còn tồn tại. Trang này nói rõ ' +
      'cái gì mất và bạn cần làm gì.',

    whyTitle: 'Vì sao phải sinh lại',
    why1:
      'Genesis của một mạng là bất biến. Đó chính là thứ làm nó đáng tin — không ai, kể cả ' +
      'người dựng ra nó, sửa được con số đã khắc vào block 0.',
    why2:
      'Cái giá của điều đó: muốn đổi một con số nằm trong genesis thì không có đường nào ' +
      'khác ngoài dựng lại mạng từ đầu. A1 đổi tổng cung lên 9.000.000.000 LOVE9, kéo theo ' +
      'cả dải tham số staking phải tính lại cho khớp.',
    why3:
      'Đây là testnet, và sinh lại là việc testnet được phép làm. Thực ra đó là lý do ' +
      'testnet tồn tại: để những thay đổi kiểu này xảy ra ở đây, chứ không xảy ra trên ' +
      'mainnet.',

    lostTitle: 'Cái gì sẽ mất',
    lostDesc: 'Tất cả, không có ngoại lệ:',
    lost1: 'Mọi L1 người dùng đã đẻ, kể cả chain đang chạy tốt.',
    lost2: 'Mọi số dư LOVE9, gồm cả token nhận từ faucet.',
    lost3: 'Mọi giao dịch, mọi block, toàn bộ lịch sử của C-Chain, P-Chain và X-Chain.',
    lost4: 'Mọi validator và mọi khoản uỷ quyền.',

    keptTitle: 'Cái gì giữ lại',
    keptDesc:
      'Trước khi xoá, toàn bộ mạng đang chết sẽ được xuất ra kèm mã băm và công bố, để dấu ' +
      'vết còn truy lại được. Cái đã xảy ra vẫn kiểm chứng được, kể cả khi mạng chạy nó ' +
      'không còn. Đường dẫn bản lưu sẽ đăng ở đây trong ngày sinh lại.',

    toDoTitle: 'Bạn cần làm gì',
    toDoBefore: 'Trước ngày sinh lại:',
    toDo1:
      'Đừng xây thứ gì cần dữ liệu sống lâu trên A1 lúc này. Nếu bạn đang thử một ý tưởng ' +
      'thì cứ tự nhiên — chỉ đừng coi chain hiện tại là chỗ cất giữ.',
    toDoAfter: 'Sau ngày sinh lại:',
    // 🔴 BA CHUỖI NÀY ĐÃ SỬA SAU D-047, ĐỪNG LÙI VỀ BẢN CŨ. Bản cũ bảo người dùng
    // "gỡ mạng chính rồi thêm lại, đừng chép thông số cũ" — lời khuyên đó chỉ đúng
    // cho kịch bản chainId ĐỔI. D-047 chốt GIỮ `9000000009`, nên thông số mạng mới
    // y hệt cũ: gỡ rồi thêm lại là một thao tác không đổi gì cả. Cái THẬT SỰ cần gỡ
    // là từng L1 riêng (những chain đó biến mất), và cái thật sự cần làm là xin lại
    // token. Cùng họ lỗi với "số chép sang thang khác": bê lời khuyên từ một kịch
    // bản sang kịch bản mà tiền đề của nó không còn đúng.
    toDo2:
      'Gỡ khỏi ví từng L1 riêng bạn đã thêm — những chain đó không còn tồn tại, và ví trỏ ' +
      'vào chúng sẽ chỉ nằm im. Mạng A1 chính thì không phải gỡ: thông số của nó không đổi.',
    toDo3:
      'Nếu ví bạn chưa có mạng A1, thêm bằng nút ở trang faucet thay vì gõ tay thông số.',
    toDo4: 'Xin lại token từ faucet, và đẻ lại chain nếu bạn muốn.',

    // ── Hai vế D-047 giao lại cho câu chữ ────────────────────────────────────
    // D-047 giữ chainId `9000000009` sau khi lý do mạnh nhất của phía "đổi" (phát
    // lại chữ ký SIWE) bị đo là ĐỔ. Hai lý do còn lại thì ĐỨNG, và quyết định ghi
    // rõ chúng "xử bằng CÂU CHỮ trên trang, không bằng đổi số" — tức là hai chuỗi
    // dưới đây LÀ phần thực thi của D-047, không phải trang trí.
    // 🔴 KHÔNG thêm nút "thêm lại mạng" vào trang này. Nút đó đã có ở faucet
    // (`FaucetForm.tsx:114`); nhân đôi một nút gọi ví là nhân đôi chỗ để hai bản
    // lệch nhau, mà đây đúng là loại nút không được phép lệch.
    silentTitle: 'Ví của bạn sẽ không báo gì cả',
    silentDesc:
      'Mạng mới giữ nguyên Chain ID {chainId}, cùng địa chỉ RPC và cùng tên với mạng cũ. Đó ' +
      'là chủ ý — để mọi tài liệu và hướng dẫn đã phát ra ngoài không thành sai. Cái giá là ' +
      'ví không có một dấu hiệu nào để nhận ra nó vừa nối vào một mạng khác. Hai chuyện dưới ' +
      'đây vì thế sẽ xảy ra trong im lặng.',
    silent1:
      'Ví còn cấu hình cũ vẫn nối được, vẫn hiện đúng tên mạng, và sẽ báo số dư 0. Con số đó ' +
      'ĐÚNG: token cũ của bạn không còn tồn tại, chứ không phải bị ẩn đi. Bạn không cần thêm ' +
      'lại mạng — chỉ cần xin token mới ở trang faucet. Nếu ví báo giao dịch kẹt hoặc sai số ' +
      'thứ tự, hãy xoá dữ liệu hoạt động của mạng đó trong ví: ví còn nhớ số đếm giao dịch ' +
      'của chuỗi đã chết, trong khi chuỗi mới đếm lại từ 0.',
    silent2:
      'Nếu bạn còn giao dịch đã ký mà chưa phát lên mạng, hãy bỏ nó đi. Chữ ký vẫn hợp lệ ' +
      'trên mạng mới, vì Chain ID không đổi. Nó sẽ chết vì ví không còn tiền — nhưng đúng ' +
      'lúc bạn xin token từ faucet thì nó chạy được, và có thể tự chạy vào một thời điểm ' +
      'bạn không ngờ.',

    repeatTitle: 'Chuyện này còn xảy ra nữa không',
    repeatDesc:
      'Có thể. A1 vẫn là testnet, và cho tới khi cộng đồng chọn hướng mainnet giữa A1 và ' +
      'C1, chúng tôi vẫn giữ quyền sinh lại mạng khi cần đổi thứ nằm trong genesis. Điều ' +
      'chúng tôi cam kết là sẽ báo trước, và nói thẳng cái gì mất.',

    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: 'Đã sinh lại một lượt ngày 27/08/2026',
    alreadyDesc:
      'A1 đã sinh lại một lượt ngày 27/08/2026, trước ngày ghi bên dưới. Nếu bạn có token thử trước đó thì số dư nay là 0 — con số đó đúng, không phải ví bạn hỏng. Không chain nào của người dùng bị mất: danh bạ khi ấy chỉ có chain do máy kiểm thử sinh ra. Hãy xin lại token ở trang faucet.',
    dateNote: 'Ngày có thể trượt',
    dateNoteDesc:
      'Ngày {date} phụ thuộc một cổng kiểm trước đó. Nếu trượt, chúng tôi sẽ đổi ngày trên ' +
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
  footer: {
    tryIt: 'Dùng thử',
    explore: 'Xem mạng',
    about: 'Về dự án',
    explorer: 'Explorer 9Scan-A1',
    mainSite: 'Trang chính 9Chain',
    opensNewTab: '(mở tab mới)',
    // 🔴 `aria-label` cho <nav> chân trang. Thiếu nó thì trang 404 (vốn có <nav>
    // riêng cho ba đường ra) có HAI landmark cùng vai, không cái nào có tên —
    // axe bắt đúng: `landmark-unique`. Trình đọc màn hình đọc ra "navigation,
    // navigation" và người dùng không biết cái nào là cái nào.
    navLabel: 'Liên kết chân trang',
    // 🔴 KHÔNG dùng lại `reGenesis.bangNut` ("Chi tiết") ở đây. Chuỗi đó viết cho dải
    // banner, nơi câu ngay trước nó đã nói rõ chuyện gì; tách ra khỏi ngữ cảnh thì
    // chân trang đọc thành "Về dự án → Chi tiết" — không nói được gì cả.
    // Cùng lớp lỗi với việc dùng chung `og:*`: một chuỗi đúng ở chỗ này không tự
    // động đúng ở chỗ khác.
    rebuildPlan: 'Kế hoạch sinh lại mạng',
  },

  nav: {
    home: 'Trang chủ',
    faucet: 'Nhận token thử',
    launch: 'Đẻ chain',
    myChains: 'Chain của tôi',
    compare: 'A1 ↔ C1',
    directory: 'Danh bạ L1',
    explorer: 'Explorer',
    explorerAria: 'Mở 9Scan-A1 ở tab mới',
    ceremony: "Nghi lễ",
  },

  home: {
    testnetBadge: 'Testnet — token không có giá trị thật',
    primaryCta: 'Đẻ chain của bạn',
    secondaryCta: 'Nhận token thử trước đã',

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
    title: 'Đẻ chain riêng của bạn trên A1',
    subtitle: 'Một L1 của riêng bạn, có chủ là ví bạn ký, chạy thật trên mạng thử nghiệm. Mất khoảng ba phút.',
    // Chỉ hiện khi bảng CÓ dòng — xem `ChainTable`.
    tableCaption: 'Mỗi dòng là một chain thật đang chạy trên A1, có chủ riêng.',
    colChain: 'Chain',
    colType: 'Kiểu',
    colOwner: 'Chủ sở hữu',
    systemDefault: 'mặc định của hệ thống',
    // Bản cũ: 'Chưa có L1 nào ngoài chain hệ thống' — khẳng định có một chain hệ
    // thống, mà bảng KHÔNG hề hiện chain nào. Câu mới không hứa thứ không thấy.
    emptyTitle: 'Chưa có L1 nào đang chạy',
    emptyDesc: 'Bạn sẽ là người đầu tiên. Danh bạ cập nhật ngay sau khi chain của bạn lên.',
    moreChains: 'Xem đủ {count} chain trong danh bạ',

    // ── Tự tố, đứng ngay dưới khối số liệu (Đ1-4) ────────────────────────────
    // 🔴 Vì sao câu này phải có: 9 validator, 9/9 connected — đúng, và đó là một chỉ
    // số kỹ thuật THẬT. Nhưng cả 9 chạy trên **một máy, một nhà cung cấp**
    // (`139.99.145.13`, cùng máy chạy Caddy + faucet + console). Để một con số đúng
    // đứng ở vị trí gợi ra kết luận sai thì site không nói dối bằng câu chữ, nhưng
    // vẫn để người đọc tự rút ra điều không đúng. Đây là chỗ rẻ nhất để nói thẳng.
    disclosure: '9 trong số 11 validator chạy trên cùng một máy chủ, cùng một nhà cung cấp; hai validator còn lại tham gia từ nơi khác, và chỉ một trong hai đang trực tuyến — phân tán về giao thức, chưa phân tán về hạ tầng.',
    // Đo 10 mẫu/5 phút: P-Chain đứng yên, C-Chain đứng yên. Đây là BÌNH THƯỜNG.
    idleBlocksNote: 'Avalanche không đẻ block rỗng, nên số block đứng yên khi chưa ai giao dịch là bình thường. Phép đo sống/chết là số validator ở ô bên cạnh.',
  },

  stats: {
    title: 'Mạng đang chạy thật',
    validators: 'Validator kết nối',
    l1Count: 'L1 đang sống',
    blockHeight: 'Block C-Chain',
    measuring: 'Đang đo mạng…',
    cannotMeasure: 'Chưa đọc được số liệu mạng',
    cannotMeasureDesc: 'Trang vẫn dùng được — đây chỉ là phần hiển thị tình trạng.',
  },
  /**
   * Danh bạ L1 (`/chains/`). Chuyển vào từ điển `2026-09-03`.
   *
   * 🔴 CHỮ Ở ĐÂY LÀ BẢN CHUYỂN NGUYÊN VĂN từ trang HTML tự viết cũ, KHÔNG viết lại.
   * Giọng đó David đã duyệt và đã chạy công khai nhiều tuần; viết lại cho "hay hơn"
   * là đánh đổi một bản đã được soát lấy một bản chưa ai đọc.
   */
  directory: {
    lede: 'Mọi chain trên testnet A1 và tình trạng thật của nó.',

    howToTitle: 'Đọc bảng này thế nào.',
    howToBody:
      'Avalanche không đẻ block rỗng — chain chỉ sinh block khi có giao dịch, nên “số block ' +
      'đứng yên” là bình thường, không phải chain chết. Ngược lại, một chain không có validator ' +
      'vẫn trả lời RPC, vẫn cho đọc số dư, ví vẫn kết nối được — nhưng giao dịch treo vô hạn. ' +
      'Vì vậy dấu hiệu sống thật ở đây là số validator của subnet, lấy trực tiếp từ P-Chain, ' +
      'chứ không phải chiều cao block.',
    ownerTitle: 'Chủ sở hữu (admin)',
    ownerBody:
      'là địa chỉ người bấm nút đẻ chain khai báo lúc tạo: nó giữ toàn bộ token genesis và ' +
      'quyền chỉnh phí của chain đó — chain thuộc về họ, không thuộc về quỹ. Chain đẻ trước ' +
      'khi console có ô này hiện là mặc định của hệ thống.',

    mainNetwork: 'MẠNG CHÍNH',
    mainNetworkDesc: 'C-Chain của testnet A1 — nơi faucet và explorer làm việc.',

    running: 'ĐANG CHẠY',
    notAnswering: 'KHÔNG PHẢN HỒI',
    notAnsweringDesc: 'RPC không trả lời — node có thể chưa track subnet này.',
    unclear: 'CHƯA RÕ',
    unclearDesc: 'Không đọc được tập validator từ P-Chain.',

    ownerAdmin: 'Chủ sở hữu (admin)',
    blocks: 'Số block',
    subnetValidators: 'Validator của subnet',
    created: 'Tạo lúc',
    revokedAt: 'Thu hồi lúc',
    copyOwner: 'Chép địa chỉ chủ sở hữu',

    revoked: 'ĐÃ THU HỒI',
    revokedDesc:
      'Chain này đã ngừng phục vụ: không node nào còn chạy nó, RPC không còn trả lời. Nếu bạn ' +
      'từng thêm mạng này vào ví, hãy xoá nó đi — để lại chỉ khiến ví báo lỗi kết nối.',
    neverReissued: 'không cấp lại cho chain khác',
    revokedGroup: 'Đã thu hồi ({count})',

    listError: 'Không đọc được danh sách chain ({error}). Vẫn hiển thị mạng chính bên dưới.',
    footSummary: '{count} L1 đang chạy + mạng chính',
    footRevoked: '{count} đã thu hồi',
    footUpdated: 'cập nhật lúc {time}',
    tileTotal: 'L1 trong danh bạ',
    tileRunning: 'Đo được đang chạy',
    tileAttention: 'Cần để ý',
    tileRevoked: 'Đã thu hồi',
    sweepProgress: 'Đã đo {done}/{total}',
    measuringDesc: 'Đang xếp hàng chờ đo.',
    howToToggle: 'Đọc danh sách này thế nào',
    searchLabel: 'Tìm',
    searchPlaceholder: 'Tên, Chain ID, chủ sở hữu hoặc blockchain ID',
    filterStatus: 'Trạng thái',
    filterAll: 'Tất cả',
    filterRunning: 'Đang chạy',
    filterAttention: 'Cần để ý',
    filterRevoked: 'Đã thu hồi',
    filterType: 'Loại',
    filterTypeAll: 'Mọi loại',
    groupBy: 'Gom theo',
    groupNone: 'Không gom',
    groupOwner: 'Chủ sở hữu',
    groupType: 'Loại',
    groupStatus: 'Trạng thái',
    groupNoType: 'Chưa ghi loại',
    groupCount: '{shown}/{total}',
    sortBy: 'Sắp xếp',
    sortNewest: 'Mới nhất trước',
    sortOldest: 'Cũ nhất trước',
    sortName: 'Tên',
    sortChainId: 'Chain ID',
    sortBlocks: 'Nhiều block nhất',
    refresh: 'Đo lại',
    listCaption: 'Các chain trên A1, kèm trạng thái đo được của từng chain',
    showing: 'Hiện {shown}/{total}',
    showMore: 'Hiện thêm {count}',
    noMatchTitle: 'Không chain nào khớp',
    noMatchDesc: 'Thử từ khoá khác, hoặc xoá bộ lọc.',
    clearFilters: 'Xoá bộ lọc',
    showDetails: 'Chi tiết',
    hideDetails: 'Thu gọn',
    detailsOf: 'Chi tiết của {name}',
    nativeToken: 'Token gốc',
    mismatch: 'SAI CHAIN',
    mismatchDesc: 'RPC trả lời với Chain ID {got} thay vì {expected} — nhiều khả năng là lỗi định tuyến, không phải chain này.',
  },
  ceremony: {
    badge: "Nghi lễ",
    title: "Nghi lễ 9S Union",
    desc: "Vào đúng một giây đã định, mạng ghi ba block có tên. Trang này nói trước điều gì sẽ xảy ra, ba block ấy mang gì, và sau đó bạn tự kiểm lại bằng cách nào mà không phải hỏi ai.",
    momentLabel: "Mốc",
    countdownLabel: "Còn lại",
    days: "ngày",
    hours: "giờ",
    minutes: "phút",
    seconds: "giây",
    yourZone: "Múi giờ của bạn",
    blocksTitle: "Ba block",
    adamDesc: "Block ĐẦU TIÊN có dấu thời gian chạm tới mốc — định nghĩa bằng THỜI GIAN, không phải bằng chiều cao. Ai đẻ ra block đó cũng được.",
    evaDesc: "Block ngay sau Adam, tính theo chiều cao.",
    unionDesc: "Mười block sau Adam. Thông điệp 9S Union neo ở đây.",
    messagesTitle: "Ba block mang gì",
    messagesDesc: "Adam và Eva mang đúng hai câu đã được khắc vào block 0 lúc sinh mạng — nghi lễ trỏ thẳng vào chính những tệp đó, nên hai bên không thể trôi lệch khỏi nhau. Mỗi vân tay dưới đây được đóng băng ngày 2026-09-03, trước nghi lễ, và ai cũng dựng lại được bằng sha256 trên byte gốc.",
    quietTitle: "Một phút yên tĩnh",
    quietDesc: "C-Chain không đẻ block rỗng, nên luồng giao dịch tổng hợp mà chúng tôi công bố ở trang trực tiếp sẽ dừng trước mốc một quãng. Không dừng thì nghi lễ phải đua với một bộ gửi tự động trong cửa sổ chỉ hai giây. Cái giá là một phút yên tĩnh; thứ mua được là ba block này thuộc về nghi lễ chứ không thuộc về một con bot.",
    strangerTitle: "Người lạ có thể lấy mất block đó, và bản ghi vẫn đứng vững",
    strangerDesc: "A1 là mạng thử nghiệm công khai, giây đó ai cũng có quyền gửi giao dịch. Bản ghi neo vào HASH GIAO DỊCH của nghi lễ, không bao giờ neo vào chiều cao block — nên nếu block của người khác chạm mốc trước, thứ đã ghi vẫn đúng; chỉ là nghi lễ không đẻ ra block ấy.",
    checkTitle: "Tự kiểm lấy",
    checkDesc: "Hỏi bất kỳ node A1 nào về block tại mốc rồi đọc dấu thời gian của nó. Không có dòng nào ở trang này buộc bạn phải tin suông.",
    resultTitle: "Đã ghi được gì",
    resultPending: "Chưa công bố. Gói vật chứng — mốc, lượng bù đã dùng, lưu lượng nền, ba hash giao dịch, số block, và kết quả đọc ngược byte từ chain — sẽ đăng ở đây sau nghi lễ.",
    resultBlock: "Block Adam",
    resultTimestamp: "Dấu thời gian của nó",
    resultBundle: "Gói vật chứng",
    reachedNote: "Mốc đã qua. Bản ghi chưa công bố ở đây — việc đó chỉ làm sau khi byte đã được đọc ngược từ chain và đối chiếu với vân tay đã đóng băng.",
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

  launch: {
    title: 'Đẻ chain của bạn',
    desc:
      'Một L1 riêng, do ví của bạn làm chủ. Bạn ký một lần để chứng minh mình là ai, ' +
      'soát lại, rồi mạng dựng chain trong khoảng ba phút.',

    // ── bước 1: ví
    connectWallet: 'Kết nối ví',
    connecting: 'Đang kết nối…',
    signIn: 'Ký để đăng nhập',
    signing: 'Đang chờ chữ ký…',
    yourWallet: 'Ví của bạn',
    youWillOwn: 'Chain sẽ thuộc về ví này. Địa chỉ lấy từ chữ ký — không ai gõ tay.',
    noWallet: 'Không thấy ví trong trình duyệt. Cài MetaMask rồi tải lại trang.',
    signRejected: 'Bạn đã từ chối ký. Không có gì được tạo.',
    switchWallet: 'Dùng ví khác',

    // ── bước 2: form
    nameLabel: 'Tên chain',
    namePlaceholder: 'Ví dụ: ChainCuaToi',
    nameHelp:
      'Chữ, số và dấu cách. 2–32 ký tự. Trên mạng này, tên đã dùng thì không cấp lại — ' +
      'kể cả cho chain đã thu hồi.',
    nameInvalid: 'Tên chỉ gồm chữ, số và dấu cách, dài 2–32 ký tự.',
    typeLabel: 'Kiểu chain',
    typeHelp: 'Chọn xong là cố định — genesis của chain không sửa lại được.',
    slotsLeft: 'Còn {left}/{total} chỗ',
    slotsFull: 'Đã hết chỗ',
    slotsFullDesc:
      'Mô hình hiện tại cho mọi validator track mọi L1, mà giao thức cắt kết nối node khai quá 16 subnet. ' +
      'Đây là trần cứng, không nới được. Thu hồi một chain sẽ trả lại chỗ.',
    reviewCta: 'Soát lại trước khi gửi',

    // ── bước 3: soát lại
    reviewTitle: 'Soát lại — đây là cửa một chiều',
    reviewDesc:
      'Genesis của một L1 đã đẻ là BẤT BIẾN. Sau bước này không sửa được tên, kiểu chain ' +
      'hay chủ sở hữu — thu hồi cũng không trả lại tên và chain ID.',
    reviewRebuild:
      'Và một điều nữa phải biết trước khi bấm: A1 sinh lại toàn mạng ngày {date}. ' +
      'Chain bạn đẻ hôm nay sẽ bị xoá cùng mạng cũ — không phải ẩn đi, mà là không còn.',
    reviewName: 'Tên chain',
    reviewType: 'Kiểu chain',
    reviewOwner: 'Chủ sở hữu',
    reviewBack: 'Quay lại sửa',
    reviewConfirm: 'Tôi đã soát, đẻ chain',

    // ── bước 4: tiến trình
    launching: 'Đang đẻ chain “{name}”',
    launchingDesc:
      'Năm node restart LẦN LƯỢT để mạng không mất quorum — vì vậy nó chậm, và đó là chủ ý. ' +
      'Đừng đóng tab; nếu lỡ đóng, chain vẫn tiếp tục được dựng.',
    etaRemaining: 'Còn khoảng {minutes} phút',
    preparing: 'Đang chuẩn bị…',

    // ── bước 5: xong
    doneTitle: 'Xong — chain “{name}” đang chạy',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Thêm chain vào ví',
    doneAdded: 'Đã thêm vào ví',
    doneActivate: 'Kích hoạt chain (mở block 1)',
    doneActivated: 'Đã kích hoạt',
    doneActivating: 'Đang chờ ví…',
    // Ba chuỗi này lấp đúng chỗ trước đây `catch {}` trắng — nút hỏng mà không một
    // chữ nào hiện ra, người dùng bấm lại vô hạn.
    doneAddWalletError: 'Không thêm được chain vào ví. {detail}',
    doneActivateError: 'Không kích hoạt được chain. {detail}',

    launchAnother: 'Đẻ chain khác',
    launchError: 'Không đẻ được chain. {detail}',
    unknownError: 'Chain không xuất hiện trong danh bạ sau khi lượt chạy kết thúc.',
    noteTitle: 'Giao dịch đầu tiên của chain mới',
    noteHow:
      'Đừng tin ước lượng gas cho giao dịch đầu. Cách rẻ nhất để mở block 1 là một ' +
      'giao dịch chuyển tiền thường — bấm “Kích hoạt chain” bên dưới.',
  },

  myChains: {
    title: 'Chain của tôi',
    desc: 'Các L1 do ví đang đăng nhập làm chủ. Thu hồi được, nhưng đọc kỹ phần cảnh báo.',
    connectWallet: 'Kết nối ví để xem chain của bạn',
    emptyTitle: 'Ví này chưa làm chủ chain nào',
    emptyDesc: 'Đẻ một chain rồi quay lại — nó sẽ hiện ở đây ngay.',
    emptyCta: 'Đẻ chain của bạn',

    colChain: 'Chain',
    colType: 'Kiểu',
    colStatus: 'Tình trạng',
    colActions: '',

    validatorCount: '{count} validator',
    measuring: 'đang đo',
    cannotMeasure: 'chưa đo được',
    // Vì sao đo bằng validator chứ không bằng chiều cao block — xem chú thích trong mã.
    statusHelp: 'Đo bằng số validator của subnet, không bằng chiều cao block.',
    noValidators: '0 validator',
    noValidatorsDesc:
      'Chain này KHÔNG chốt được giao dịch nào: subnet chưa có validator. Nó vẫn trả lời ' +
      'RPC và ví vẫn kết nối được, nên không có dấu hiệu nào khác để nhận ra.',

    walletSettings: 'Thông số cho ví',
    addToWallet: 'Thêm vào ví',
    addedToWallet: 'Đã thêm',
    addWalletError: 'Không thêm được vào ví. {detail}',

    revoke: 'Thu hồi',
    revokeTitle: 'Thu hồi “{name}”?',
    revokeWarn1: 'Chain ngừng phục vụ RPC ngay lập tức và biến khỏi danh bạ công khai.',
    revokeWarn2:
      'Thu hồi KHÔNG xoá subnet trên P-Chain — thứ đã đẻ ra ở đó thì không gỡ được, ' +
      'chừng nào mạng này còn chạy. Nó cũng không xoá mạng khỏi ví của những người đã ' +
      'thêm chain này.',
    revokeWarn3:
      'Tên và Chain ID bị giữ chỗ và KHÔNG cấp lại cho ai trên mạng này. Cấp lại Chain ID ' +
      'là để ví của người từng dùng chain cũ lặng lẽ trỏ vào chain của người khác.',
    revokeWarn4: 'Đổi lại, một chỗ trong trần 15 L1 được trả về.',
    revokeTypeLabel: 'Gõ lại đúng tên chain để xác nhận',
    revokeNameMismatch: 'Chưa khớp tên chain.',
    revokeConfirm: 'Thu hồi vĩnh viễn',
    revokeCancel: 'Hủy',
    revoking: 'Đang thu hồi “{name}” — khoảng ba phút',
    revokeDone: 'Đã thu hồi “{name}”. Còn {left}/{total} chỗ.',
    revokeError: 'Không thu hồi được. {detail}',
    revokeUnknown: 'Chain vẫn còn trong danh bạ sau khi lượt chạy kết thúc.',

    revokedBadge: 'Đã thu hồi',
    revokedDesc: 'Giữ chỗ tên và Chain ID trên mạng này.',
  },

  compare: {
    title: 'A1 ↔ C1 — bảng so sánh',
    // 🔴 SỬA 2026-08-27 (Đ1-4). Bản cũ kết bằng "…chọn hướng mainnet bằng dữ liệu,
    // không bằng tranh luận" — rồi khối NGAY DƯỚI tự bác lại: điểm là đội tự chấm,
    // 8/10 tiêu chí là `kienTruc` (suy từ thiết kế, không phải đo), và **cả 2 tiêu
    // chí `song` cũng chưa có số C1**. Hứa "bằng dữ liệu" ở câu mở đầu rồi đính
    // chính ở khối kế là tự làm hỏng uy tín của chính bảng.
    // Câu mới nói đúng thứ bảng này LÀ: một bản ghi công khai các đánh đổi.
    desc:
      '9Chain chạy HAI testnet song song của cùng một sản phẩm, khác nhau ở engine: ' +
      'A1 engine Avalanche, C1 engine Cosmos. Bảng này ghi lại các đánh đổi giữa hai hướng, ' +
      'công khai để ai cũng phản bác được — phần C1 hiện chưa có số đo sống.',

    // 🔴 Câu này KHÔNG được bỏ: điểm dưới đây do đội tự chấm.
    selfScoreTitle: 'Điểm dưới đây là ĐỘI TỰ CHẤM, không phải đo độc lập',
    selfScoreDesc:
      'Cột "đo thế nào" nói rõ mỗi tiêu chí kiểm bằng cách gì. Tiêu chí nào chưa có ' +
      'phép đo có ngày thì đó là đánh giá kiến trúc, không phải số liệu. Trọng số do ' +
      'bạn đặt — điểm đổi theo.',

    colNo: '#',
    colCriterion: 'Tiêu chí',
    colKind: 'Loại',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Trọng số',
    kindArchitecture: 'kiến trúc',
    kindLiveData: 'số sống',

    totalScore: 'Tổng điểm theo trọng số của bạn',
    tied: 'Hoà nhau',
    leads: 'đang dẫn',

    liveDataTitle: 'Số liệu sống',
    a1Validators: 'A1 — validator kết nối',
    a1Chains: 'A1 — L1 đang sống',
    a1Blocks: 'A1 — block C-Chain',
    c1Unreachable: 'C1 — chưa nối được',
    c1UnreachableDesc:
      'Cần URL Cosmos REST của C1 (cổng 1317). Bảng vẫn dùng được: phần A1 là số ' +
      'sống, phần C1 là đánh giá kiến trúc như các tiêu chí còn lại.',
    measuring: 'đang đo…',
    cannotMeasure: 'chưa đo được',
    critDecentralisation: 'Phi tập trung (validator tối đa)',
    noteDecentralisation: 'Trần GIAO THỨC: Snowman ~nghìn node vs CometBFT ~150. A1 HÔM NAY: 9 node, một máy, một nhà cung cấp',
    critFinality: 'Finality',
    noteFinality: '~1–2s vs ~5–6s',
    critEvmMaturity: 'Độ chín EVM',
    noteEvmMaturity: 'coreth production vs Cosmos EVM pre-v1',
    critWalletCompat: 'Tương thích ví/DeFi retail',
    noteWalletCompat: 'MetaMask/EVM đầy đủ',
    critLaunchUx: 'UX đẻ chain',
    noteLaunchUx: 'cả hai có console; A1 đo được ~170s/lượt',
    critInterop: 'Interop rộng',
    noteInterop: 'Warp/ICM nội hệ (A1 đã chuyển được tài sản, M6.2) vs IBC rộng',
    critOpCost: 'Chi phí vận hành / chain',
    noteOpCost: 'node + plugin vs K8s operator',
    critBootstrap: 'Bootstrap network-effect',
    noteBootstrap: 'đảo riêng vs IBC cắm sẵn kinh tế Cosmos',
    critEconSecurity: 'Bảo mật kinh tế public',
    noteEconSecurity: 'PoS token-secured sẵn',
    critSwitchCost: 'Chi phí chuyển đổi (đội)',
    noteSwitchCost: 'A1 mới vs C1 đã chạy nhiều tháng',
  },

  faucet: {
    title: 'Nhận token thử',
    desc:
      'LOVE9 trên testnet A1 không có giá trị thật — nó chỉ để bạn trả phí gas khi thử. ' +
      'Nhập địa chỉ ví, chúng tôi gửi ngay.',
    addressLabel: 'Địa chỉ ví của bạn',
    addressFromWallet: 'Điền sẵn từ ví bạn đã nối. Sửa lại nếu muốn token vào một địa chỉ khác.',
    useWalletAddress: 'Dùng địa chỉ ví của tôi',
    addressPlaceholder: '0x… (40 ký tự hex)',
    requestCta: 'Gửi token cho tôi',
    sending: 'Đang gửi…',
    addressHelp: 'Dán địa chỉ ví bạn muốn nhận token. Bấm “Thêm mạng vào ví” ở trên nếu chưa có.',
    addNetwork: 'Thêm mạng vào ví',
    addNetworkDone: 'Đã thêm vào ví',
    addNetworkRejected: 'Bạn đã bấm từ chối trong ví. Bấm lại nếu muốn thêm mạng.',
    addNetworkError: 'Ví không thêm được mạng. Thêm tay bằng thông số bên cạnh — và gửi dòng dưới đây cho đội kỹ thuật:',
    noWallet: 'Không thấy ví trong trình duyệt. Cài MetaMask rồi tải lại trang.',
    quotaLabel: 'Hạn mức còn lại',
    quotaFormat: '{left}/{total} lượt trong {hours} giờ',
    quotaExhausted: 'Bạn đã dùng hết hạn mức. Thử lại sau {minutes} phút.',
    quotaUnreadable: 'Chưa đọc được hạn mức — bạn vẫn xin được, chỉ là không biết trước còn mấy lượt.',
    sentOk: 'Đã gửi {count} {symbol} tới {address}',
    viewTransaction: 'Xem giao dịch',
    settingsTitle: 'Thông số mạng',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Ký hiệu',
    settingsDecimals: 'Số thập phân',
    settingsExplorer: 'Explorer',
    // Người đọc TOKENOMICS thấy "9 chữ số" rồi mở ví thấy 18 sẽ kết luận tài liệu
    // sai — và họ không có cách nào tự biết là không. Cả hai đều đúng, ở hai chỗ
    // khác nhau. Xem `docs/TOKENOMICS.md` §0.
    decimalsHelp:
      'Ví hiện 18 chữ số vì C-Chain chạy EVM. Trên P/X-Chain, LOVE9 đếm bằng 9 chữ số. ' +
      'Cùng một đồng, hai thang đo — không phải hai loại token.',
    genericError: 'Không gửi được. {detail}',
  },

  /** Bộ chọn ngôn ngữ. Xem `components/LanguagePicker.tsx` cho lý do từng nhãn. */
  langPicker: {
    label: 'Ngôn ngữ',
    machineBadge: 'máy dịch',
    machineNote: 'Chỉ bản tiếng Việt có người soát. Các bản còn lại là máy dịch và có thể sai — bản tiếng Anh là nguồn chuẩn.',
    notAvailable: 'chưa có',
  },

  errors: {
    unreachable: 'Không kết nối được tới mạng',
    unreachableDesc: 'Có thể mạng đang bận hoặc đường truyền của bạn bị gián đoạn.',
    empty: 'Chưa có gì ở đây',
    addressEmpty: '{label} không được để trống',
    addressFormat: '{label} phải là 0x + 40 ký tự hex',
    addressChecksum: '{label} sai checksum EIP-55 — nhiều khả năng gõ hoặc dán nhầm một ký tự',
    addressZero: '{label} không được là địa chỉ 0 — không ai giữ khoá của nó',
    timeout: 'Quá {seconds}s không có trả lời',
    notJson: 'Đáp án không phải JSON (HTTP {status}) — nhiều khả năng đường dẫn bị giải sai',
    noWallet: 'Không thấy ví trong trình duyệt này.',
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
  notFound: {
    code: '404',
    title: 'Không có trang này',
    desc:
      'Đường dẫn bạn mở không tồn tại trên 9Chain Testnet A1. ' +
      'Có thể nó đã được đổi tên, hoặc URL bị thiếu vài ký tự lúc sao chép.',
    topPagesTitle: 'Ba đường dùng nhiều nhất:',
    navLabel: 'Đường đi tiếp',
    goHome: 'Về trang chủ',
    goFaucet: 'Nhận token thử',
    goLaunch: 'Đẻ chain của bạn',
    // Ghi chú cho người đọc mã, KHÔNG hiện ra: explorer nằm ở tên miền khác
    // (9Scan-A1) và Blockscout phục vụ `/tx/`, `/address/` ngay trên tên miền này —
    // nên nếu người dùng đang tìm một giao dịch, họ KHÔNG lạc, họ chỉ gõ sai băm.
    lookingForTx: 'Đang tìm một giao dịch hay một địa chỉ? Kiểm lại mã băm rồi thử lại.',
  },
};

export default vi;
