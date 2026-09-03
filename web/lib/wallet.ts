'use client';

/**
 * Kết nối ví + đăng nhập bằng chữ ký (SIWE) với console.
 *
 * ═══ VÌ SAO ĐĂNG NHẬP BẰNG VÍ LÀ LỚP BẢO VỆ, KHÔNG PHẢI TIỆN ÍCH ═══
 * Đăng nhập bằng ví thì console **ÉP** `admin` = địa chỉ đã ký. Điều đó gỡ hẳn lớp
 * lỗi tệ nhất của dự án: genesis là **bất biến**, nên gõ nhầm một ký tự trong địa
 * chỉ chủ chain là chain ra đời **vĩnh viễn vô chủ** — không lỗi, không dấu hiệu,
 * không ai lấy lại được. Chữ ký thì không gõ nhầm được.
 *
 * ⇒ Giao diện phải hiện địa chỉ đó như một **sự thật**, không phải một ô nhập.
 *
 * ═══ SERVER GIỮ MESSAGE, CLIENT CHỈ KÝ ═══
 * `/api/siwe/nonce` trả về **cả message**; client ký đúng chuỗi đó rồi gửi lại
 * `{nonce, signature}`. Client KHÔNG tự dựng message: tự dựng là mở đường cho hai
 * bên hiểu khác nhau về thứ vừa được ký, và khi đó chữ ký chứng minh sai thứ.
 */
import { faucetOrigin } from './chain';
import type { FailureKind } from './net';

/**
 * Hạn giờ cho các lượt gọi console NGẮN (`/api/status`, `/api/progress`). (Đ1-8)
 *
 * 🔴 KHÔNG dùng cho `/api/create` / `/api/revoke` — xem chú thích ở `callConsole`.
 * Để rộng rãi (15s) có chủ ý: đây là các lượt đọc chạy XEN GIỮA một thao tác dài,
 * và mạng lúc đó đang bận thật. Hạn quá chặt sẽ biến một nhịp chậm bình thường
 * thành một lỗi giả ngay giữa lúc người dùng đang hồi hộp nhất.
 */
export const CONSOLE_TIMEOUT_S = 15;

export type BrowserWallet = {
  request(a: { method: string; params?: unknown[] }): Promise<unknown>;
};

export type WalletInfo = { uuid: string; name: string; rdns: string; icon?: string };
type ViDaKhai = { info: WalletInfo; provider: BrowserWallet };

/**
 * ═══ VÌ SAO KHÔNG DÙNG THẲNG `window.ethereum` ═══
 *
 * 🔴 ĐÃ TRẢ GIÁ 2026-08-26. Người dùng cài nhiều extension ví cùng lúc thì chúng
 * **tranh nhau ghi đè cùng một biến** `window.ethereum`, và kẻ thắng là kẻ nạp
 * sau — không ai chọn cả. Máy của David có ~10 ví, và kẻ thắng hôm đó là một ví
 * KHÔNG cài `wallet_addEthereumChain`.
 *
 * Triệu chứng đọc cực kỳ lệch hướng: ví trả về
 *     -32601 the method wallet_addEthereumChain does not exist/is not available
 * — đọc y như "MetaMask bỏ hàm này" hoặc "ta gọi sai tên hàm", trong khi sự thật
 * là **ta đang nói chuyện với nhầm ví**. (Cùng một cái bẫy -32601 mà dự án đã dính
 * một lần ở API Warp: mã lỗi nói về TÊN HÀM, còn nguyên nhân nằm ở NGƯỜI NGHE.)
 *
 * Và nó không chỉ hỏng cái nút thêm mạng: `getWallet()` là đường đăng nhập SIWE của
 * `/create-chain/` lẫn `/my-chains/`, nên "nhầm ví" nghĩa là ký bằng ví khác với
 * ví người dùng tưởng — mà `admin` của chain thì bị ÉP theo địa chỉ đã ký.
 *
 * ⇒ Dùng **EIP-6963**: ví tự khai danh tính qua sự kiện thay vì giành một biến
 * toàn cục. Ta gom hết rồi CHỌN, thay vì nhận bừa kẻ nạp sau cùng.
 *
 * Nghe suốt đời trang chứ không nghe một nhịp: ví nạp muộn (hoặc người dùng mở
 * khoá extension giữa chừng) vẫn khai, và khai lúc nào ta cũng nhận.
 */
const viDaKhai = new Map<string, ViDaKhai>();
let viChonTay: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (e: Event) => {
    const d = (e as CustomEvent<ViDaKhai>).detail;
    if (d?.info?.rdns && d.provider) viDaKhai.set(d.info.rdns, d);
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
}

/** Mọi ví đã tự khai. Rỗng nghĩa là không ví nào theo EIP-6963 (hoặc chưa kịp khai). */
export function listWallets(): WalletInfo[] {
  return [...viDaKhai.values()].map((v) => v.info);
}

/** Người dùng chọn ví theo `rdns`. Không kiểm tồn tại — `getWallet()` tự rơi về mặc định. */
export function pickWallet(rdns: string | null): void {
  viChonTay = rdns;
}

/** Tên ví đang thật sự được dùng, để giao diện nói rõ chứ không để người dùng đoán. */
export function activeWalletName(): string | null {
  const chon = viChonTay ? viDaKhai.get(viChonTay) : null;
  if (chon) return chon.info.name;
  const mm = [...viDaKhai.values()].find((v) => v.info.rdns === 'io.metamask');
  if (mm) return mm.info.name;
  const dau = [...viDaKhai.values()][0];
  return dau ? dau.info.name : null;
}

export function getWallet(): BrowserWallet | null {
  if (typeof window === 'undefined') return null;

  // 1. Người dùng đã chọn tay thì tôn trọng tuyệt đối.
  if (viChonTay) {
    const v = viDaKhai.get(viChonTay);
    if (v) return v.provider;
  }
  // 2. Ưu tiên MetaMask: nó là ví dự án hướng dẫn khắp nơi (nút "Thêm vào MetaMask",
  //    mọi ảnh chụp, mọi tài liệu), nên mặc định phải khớp với thứ ta đã dạy.
  const mm = [...viDaKhai.values()].find((v) => v.info.rdns === 'io.metamask');
  if (mm) return mm.provider;
  // 3. Bất kỳ ví nào đã khai theo chuẩn — vẫn hơn hẳn việc bốc bừa biến toàn cục.
  const dau = [...viDaKhai.values()][0];
  if (dau) return dau.provider;

  // 4. Đường lui cho ví CŨ chưa hỗ trợ EIP-6963. `window.ethereum.providers` là quy
  //    ước cũ của MetaMask khi có nhiều ví; tìm MetaMask trong đó trước khi chịu
  //    nhận bừa `window.ethereum`.
  const w = window as unknown as {
    ethereum?: BrowserWallet & { isMetaMask?: boolean; providers?: (BrowserWallet & { isMetaMask?: boolean })[] };
  };
  const list = w.ethereum?.providers;
  if (Array.isArray(list)) return list.find((p) => p.isMetaMask) ?? list[0] ?? null;
  return w.ethereum ?? null;
}

/** Gốc API console. Cùng tên miền với trang ⇒ đường tương đối là đủ và đúng. */
export function consoleOrigin(): string {
  if (typeof window === 'undefined') return '/console';
  const h = window.location.hostname;
  // Dev trên máy: trang ở localhost:3901 còn console ở tunnel :8091.
  if (h === 'localhost' || h === '127.0.0.1') return 'http://127.0.0.1:8091';
  return `${window.location.protocol}//${h}/console`;
}

export type WalletSession = { diaChi: string; token: string };

export async function connectWallet(): Promise<string> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  const list = (await v.request({ method: 'eth_requestAccounts' })) as string[];
  if (!list?.length) throw new Error('KHONG_CHON_VI');
  return list[0];
}

export async function siweSignIn(diaChi: string): Promise<WalletSession> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);

  const rn = await fetch(`${consoleOrigin()}/api/siwe/nonce?address=${encodeURIComponent(diaChi)}`, {
    cache: 'no-store',
  });
  const jn = await rn.json();
  if (!rn.ok) throw new Error(jn.error || `nonce HTTP ${rn.status}`);

  // `personal_sign` nhận (message, address) — ĐÚNG thứ tự đó. Đảo lại thì ví hoặc
  // báo lỗi khó hiểu, hoặc ký nhầm chuỗi và server từ chối một chữ ký hợp lệ.
  const signature = (await v.request({
    method: 'personal_sign',
    params: [jn.message, diaChi],
  })) as string;

  const rl = await fetch(`${consoleOrigin()}/api/siwe/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nonce: jn.nonce, signature }),
  });
  const jl = await rl.json();
  if (!rl.ok) throw new Error(jl.error || `login HTTP ${rl.status}`);
  return { diaChi, token: jl.token };
}

/**
 * Lỗi từ console, CÓ MANG mã HTTP (Đ1-6, 2026-08-27).
 *
 * ═══ VÌ SAO CẦN MÃ, KHÔNG CHỈ CẦN CÂU CHỮ ═══
 * Với hai đường dài (`/api/create`, `/api/revoke`) có **ba** kiểu hỏng trông y hệt
 * nhau ở tầng `catch`, nhưng đòi ba cách xử khác hẳn:
 *
 *   401/400/409…  server TỪ CHỐI THẬT, việc **chưa hề bắt đầu**  → dừng NGAY
 *   524 / 5xx     Cloudflare cắt ở ~100s, server **vẫn đang làm** → PHẢI chờ tiếp
 *   lỗi mạng      không biết gì cả                                → PHẢI chờ tiếp
 *
 * Trước lượt này cả ba đều thành `new Error(chuỗi)`, nên nơi gọi không phân biệt
 * được và phải chọn một cách xử cho cả ba. Nó chọn "chờ tiếp" — đúng cho hai ca
 * sau, nhưng với ca đầu thì màn hình đứng im tới **900 giây** sau một cú từ chối
 * mất **0,83 giây**.
 *
 * 🔴 `status = 0` nghĩa là KHÔNG CÓ phản hồi HTTP (đứt mạng, DNS, CORS). Đừng coi
 * `0` như 4xx — đó đúng là ca "không biết gì cả", và im lặng chờ mới là đúng.
 */
export class ConsoleError extends Error {
  readonly status: number;
  /**
   * Cùng hình dạng với `NetworkError` để `describeFailure()` đọc được cả hai.
   *
   * ⚠️ `message` là chữ CHO LẬP TRÌNH VIÊN. Nó bị ghép vào `{detail}` ở màn đẻ chain
   * và màn thu hồi, nên hồi nó còn là tiếng Việt thì người đọc ở cả 30 ngôn ngữ nhận
   * tiếng Việt đúng lúc console hết giờ. Chỗ render gọi `describeFailure(e, t.errors)`.
   */
  readonly kind: FailureKind;
  readonly timeoutSeconds: number;
  constructor(message: string, status: number, kind: FailureKind = 'http', timeoutSeconds = 0) {
    super(message);
    this.name = 'ConsoleError';
    this.status = status;
    this.kind = kind;
    this.timeoutSeconds = timeoutSeconds;
  }
  /** Server đã trả lời và trả lời là "không" ⇒ việc chưa bắt đầu, dừng được. */
  get laTuChoiThat(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

/**
 * @param hanGiay Hạn giờ, tính bằng **giây**. Bỏ trống = **KHÔNG hạn giờ**, và đó là
 *   mặc định CÓ CHỦ Ý (Đ1-8).
 *
 * 🔴 `/api/create` và `/api/revoke` TUYỆT ĐỐI KHÔNG ĐƯỢC TRUYỀN `hanGiay`.
 * Chúng mất ~170–300 giây thật; huỷ request giữa chừng thì **server vẫn đẻ chain
 * xong** trong khi người dùng thấy "lỗi" và đi bấm lại. Cloudflare đã cắt ở ~100s
 * (524) và mã này vốn được viết để SỐNG CHUNG với điều đó — xem `waitForProgress`.
 *
 * ⇒ Chiều mặc định chọn có chủ ý: **quên bật** hạn giờ thì cùng lắm chậm như hôm
 *   nay; **quên tắt** thì gãy một đường không sửa lại được. Chỉ bật ở lượt gọi đã
 *   biết chắc là ngắn (`/api/status`, `/api/progress`).
 */
export async function callConsole<T = unknown>(
  urlPath: string,
  token: string,
  body?: unknown,
  hanGiay?: number,
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${consoleOrigin()}${urlPath}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      ...(hanGiay ? { signal: AbortSignal.timeout(hanGiay * 1000) } : {}),
    });
  } catch (e) {
    // 🔴 `status: 0` LÀ PHẦN QUAN TRỌNG. Hết giờ / đứt mạng nghĩa là ta **không biết**
    // server đã làm gì — có thể nó đang làm xong. `laTuChoiThat` đọc `status >= 400`,
    // nên 0 giữ nó `false`, và màn hình sẽ **chờ tiếp** thay vì kết luận "bị từ chối".
    // Nhầm chiều này là kiểu hỏng đắt nhất: bỏ cuộc giữa một việc đang chạy đúng.
    const ten = (e as Error)?.name;
    const het = ten === 'TimeoutError' || ten === 'AbortError';
    throw new ConsoleError(
      het ? `no answer after ${hanGiay}s` : String((e as Error)?.message ?? e),
      0,
      het ? 'timeout' : 'offline',
      het ? (hanGiay ?? 0) : 0,
    );
  }
  const t = await r.text();
  let j: unknown;
  try {
    j = JSON.parse(t);
  } catch {
    // 🔴 Câu lỗi này đáng giá: nếu đường dẫn console bị giải sai (thiếu dấu / cuối,
    // proxy sai) thì request rơi vào Blockscout ở gốc và ta nhận về HTML. Không nói
    // rõ thì lỗi hiện ra là "JSON parse error" — đọc như lỗi dữ liệu chứ không như
    // lỗi định tuyến, và người sửa đi tìm ở đúng chỗ không có gì.
    throw new ConsoleError(
      `answer was not JSON (HTTP ${r.status}) — check the console path`,
      r.status,
      'notJson',
    );
  }
  if (!r.ok) throw new ConsoleError((j as { error?: string }).error || `HTTP ${r.status}`, r.status);
  return j as T;
}

export type Progress = {
  running: boolean;
  kind: string | null;
  name: string | null;
  steps: { code: string; label: string; status: 'pending' | 'running' | 'done' | 'failed'; ms?: number }[];
  error: string | null;
  etaSeconds: number;
};

/**
 * ═══ 🔴 ĐỪNG TIN CÁI POST DÀI — CLOUDFLARE CẮT NÓ Ở ~100 GIÂY ═══
 *
 * Đẻ và thu hồi chain đều mất **~170 giây**. Cloudflare (gói hiện dùng) đóng kết nối
 * proxy ở khoảng **100 giây** và trả **HTTP 524**. Nên qua tên miền công khai, lượt
 * POST **luôn luôn** hỏng — trong khi thao tác ở server vẫn **chạy tới cùng và
 * thành công**.
 *
 * Đo thật 2026-08-25: thu hồi `ViThuTest` từ giao diện → trình duyệt nhận 524 →
 * màn hình báo *"Không thu hồi được"*, trong khi `console-chains.json` đã ghi chain
 * đó vào `retired`. Giao diện **nói dối theo hướng tệ nhất**: nó mời người dùng thử
 * lại một việc đã xong, và với đẻ chain thì lần thử lại là một chain thừa ăn mất
 * một slot trong trần 15.
 *
 * ⇒ Kết quả của POST là **KHÔNG KẾT LUẬN ĐƯỢC**. Sự thật nằm ở hai chỗ khác:
 *   1. `/api/progress` — biết lượt chạy đã kết thúc chưa, và có lỗi không.
 *   2. `/api/status` — danh bạ sau đó nói chain có thật sự tồn tại / biến mất không.
 *
 * Hàm này lo phần (1). Phần (2) do từng màn tự kiểm, vì "thành công" của đẻ và của
 * thu hồi là hai mệnh đề ngược nhau.
 */
export async function waitForProgress(
  token: string,
  {
    moiMs = 2000,
    tranGiay = 420,
    tuChoiSom,
  }: {
    moiMs?: number;
    tranGiay?: number;
    /**
     * Trả `true` khi lượt POST đã bị server TỪ CHỐI THẬT (4xx) ⇒ việc chưa hề bắt
     * đầu ⇒ không có gì để chờ. Chỉ được nhìn tới khi **chưa** thấy `running` lần
     * nào: đã thấy chạy rồi thì server đang làm thật, và lúc đó một mã 4xx muộn
     * (token hết hạn giữa chừng chẳng hạn) KHÔNG có nghĩa là việc bị huỷ.
     */
    tuChoiSom?: () => boolean;
  } = {},
): Promise<Progress | null> {
  const hetLuc = Date.now() + tranGiay * 1000;
  let cuoi: Progress | null = null;
  let daThayChay = false;
  while (Date.now() < hetLuc) {
    try {
      const t = await callConsole<Progress>('/api/progress', token, undefined, CONSOLE_TIMEOUT_S);
      cuoi = t;
      if (t.running) daThayChay = true;
      // Chỉ kết luận "xong" SAU KHI đã thấy nó chạy: gọi quá sớm thì hàng đợi chưa
      // kịp nhận việc và `running` vẫn là false của lượt TRƯỚC — kết luận lúc đó
      // là đọc kết quả của một thao tác khác.
      if (daThayChay && !t.running) return t;
    } catch {
      /* Một nhịp đọc hỏng không phải lý do bỏ cuộc — server vẫn đang làm việc. */
    }
    // 🔴 ĐẶT SAU lượt đọc, KHÔNG đặt đầu vòng. Có một khoảng đua thật: POST bị từ
    // chối trong ~0,8s trong khi lượt đọc tiến trình đầu tiên có thể đã thấy
    // `running` của một việc HỢP LỆ mà người khác vừa khởi động. Đọc trước rồi mới
    // xét `tuChoiSom` là để `daThayChay` có cơ hội đúng.
    if (!daThayChay && tuChoiSom?.()) return cuoi;
    await new Promise((r) => setTimeout(r, moiMs));
  }
  return cuoi;
}

/** Thêm một L1 vừa đẻ vào ví người dùng, đúng khuôn EIP-3085. */
/**
 * Đọc một lỗi EIP-1193 ra chữ người đọc được — MỘT khuôn cho cả site.
 *
 * ═══ VÌ SAO HÀM NÀY TỒN TẠI ═══
 * Khuôn này vốn nằm trong `FaucetForm`, viết rất kỹ sau khi trả giá thật
 * `2026-08-26`. Ba nút khác (`Thêm chain vào ví`, `Kích hoạt chain` ở màn đẻ chain,
 * `Thêm vào ví` ở màn chain của tôi) thì `catch {}` TRẮNG — cùng một thao tác, cùng
 * một sản phẩm, hai chuẩn xử lý. Chỗ nào nuốt lỗi thì nút hỏng mà không một chữ nào
 * hiện ra, và người dùng bấm lại vô hạn.
 *
 * 🔴 `4001` = NGƯỜI DÙNG TỪ CHỐI. Đó là hành vi bình thường, KHÔNG phải sự cố ⇒
 * `tuChoi: true`, không có chữ đỏ nào. Gộp nó vào lỗi thật là dạy người dùng bỏ qua
 * cảnh báo.
 *
 * 🔴 `-32601` = ví ĐANG NGHE không có hàm này. Đọc như "sai tên hàm", thật ra là
 * "NHẦM VÍ" — nên câu trả lời phải nói RÕ ví nào đang nghe và còn ví nào khác đang
 * cài. Đã trả giá `2026-08-26`: máy có ~10 extension ví, kẻ thắng `window.ethereum`
 * là một ví không thêm được mạng EVM.
 *
 * Mọi mã khác: hiện NGUYÊN VĂN mã + thông điệp của ví. Đó là thứ duy nhất phân biệt
 * "tham số của ta sai" với "ví không chịu".
 */
/**
 * 🔴 TRẢ CỜ + CHI TIẾT KỸ THUẬT, KHÔNG TRẢ CÂU ĐÃ DỊCH (đổi 2026-09-03).
 * `noWallet` là một TÌNH HUỐNG, không phải một câu: chỗ render tra `t.errors.noWallet`.
 * `detail` thì ngược lại — nó là mã lỗi + thông điệp NGUYÊN VĂN của ví, thứ duy nhất
 * phân biệt "tham số của ta sai" với "ví không chịu", nên nó KHÔNG được dịch.
 */
/** Cờ nội bộ, KHÔNG bao giờ tới mắt người dùng — xem `WalletError.noWallet`. */
const NO_WALLET = 'NO_WALLET_IN_BROWSER';

export type WalletError = { rejected: boolean; noWallet: boolean; detail: string | null };

export function readWalletError(e: unknown): WalletError {
  const err = e as { code?: number; message?: string };
  if (err?.code === 4001) return { rejected: true, noWallet: false, detail: null };
  if ((e as Error)?.message === NO_WALLET) {
    return { rejected: false, noWallet: true, detail: null };
  }
  const active = activeWalletName();
  const others = listWallets()
    .map((x) => x.name)
    .filter((n) => n !== active);
  // Phần phụ này là DỮ LIỆU CHẨN ĐOÁN, cố ý không dịch: nó chép nguyên tên extension
  // và mã lỗi để người dùng dán thẳng cho đội. Dịch nó đi là làm mất thứ duy nhất
  // phân biệt "nhầm ví" với "ví từ chối" — xem chú thích `-32601` ở trên.
  const extra =
    err?.code === -32601
      ? ` — active wallet: ${active ?? 'unknown'}${others.length ? `; also installed: ${others.join(', ')}` : ''}`
      : '';
  return {
    rejected: false,
    noWallet: false,
    detail: `${err?.code ?? '?'} · ${err?.message ?? String(e)}${extra}`,
  };
}

export async function addL1ToWallet(p: {
  chainIdHex: string;
  name: string;
  rpc: string;
  kyHieu: string;
}): Promise<void> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  await v.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: p.chainIdHex,
        chainName: p.name,
        nativeCurrency: { name: p.kyHieu, symbol: p.kyHieu, decimals: 18 },
        rpcUrls: [p.rpc],
      },
    ],
  });
}

/** Gửi một giao dịch CHUYỂN TIỀN THƯỜNG để mở block 1 của chain vừa đẻ. */
export async function activateChain(chainIdHex: string, tuDiaChi: string): Promise<string> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  await v.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  // 🔴 21.000 gas là HẰNG SỐ của EVM cho một lượt chuyển tiền thường ⇒ không cần
  // `eth_estimateGas`, nên không dính bẫy "ước lượng THIẾU cho giao dịch đầu tiên
  // của chain vừa đẻ" (D-025) — bẫy hỏng câm, receipt chỉ có `status: 0`.
  return (await v.request({
    method: 'eth_sendTransaction',
    params: [{ from: tuDiaChi, to: tuDiaChi, value: '0x0', gas: '0x5208' }],
  })) as string;
}

export { faucetOrigin };
