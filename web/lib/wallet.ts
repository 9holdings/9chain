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
import { faucetGoc } from './chain';

export type ViTrinhDuyet = {
  request(a: { method: string; params?: unknown[] }): Promise<unknown>;
};

export function layVi(): ViTrinhDuyet | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: ViTrinhDuyet }).ethereum ?? null;
}

/** Gốc API console. Cùng tên miền với trang ⇒ đường tương đối là đủ và đúng. */
export function consoleGoc(): string {
  if (typeof window === 'undefined') return '/console';
  const h = window.location.hostname;
  // Dev trên máy: trang ở localhost:3901 còn console ở tunnel :8091.
  if (h === 'localhost' || h === '127.0.0.1') return 'http://127.0.0.1:8091';
  return `${window.location.protocol}//${h}/console`;
}

export type PhienVi = { diaChi: string; token: string };

export async function noiVi(): Promise<string> {
  const v = layVi();
  if (!v) throw new Error('KHONG_CO_VI');
  const ds = (await v.request({ method: 'eth_requestAccounts' })) as string[];
  if (!ds?.length) throw new Error('KHONG_CHON_VI');
  return ds[0];
}

export async function dangNhapSiwe(diaChi: string): Promise<PhienVi> {
  const v = layVi();
  if (!v) throw new Error('KHONG_CO_VI');

  const rn = await fetch(`${consoleGoc()}/api/siwe/nonce?address=${encodeURIComponent(diaChi)}`, {
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

  const rl = await fetch(`${consoleGoc()}/api/siwe/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nonce: jn.nonce, signature }),
  });
  const jl = await rl.json();
  if (!rl.ok) throw new Error(jl.error || `login HTTP ${rl.status}`);
  return { diaChi, token: jl.token };
}

export async function goiConsole<T = unknown>(
  duong: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch(`${consoleGoc()}${duong}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const t = await r.text();
  let j: unknown;
  try {
    j = JSON.parse(t);
  } catch {
    // 🔴 Câu lỗi này đáng giá: nếu đường dẫn console bị giải sai (thiếu dấu / cuối,
    // proxy sai) thì request rơi vào Blockscout ở gốc và ta nhận về HTML. Không nói
    // rõ thì lỗi hiện ra là "JSON parse error" — đọc như lỗi dữ liệu chứ không như
    // lỗi định tuyến, và người sửa đi tìm ở đúng chỗ không có gì.
    throw new Error(`đáp án không phải JSON (HTTP ${r.status}) — kiểm tra đường dẫn console`);
  }
  if (!r.ok) throw new Error((j as { error?: string }).error || `HTTP ${r.status}`);
  return j as T;
}

export type TienTrinh = {
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
export async function choTienTrinhXong(
  token: string,
  { moiMs = 2000, tranGiay = 900 }: { moiMs?: number; tranGiay?: number } = {},
): Promise<TienTrinh | null> {
  const hetLuc = Date.now() + tranGiay * 1000;
  let cuoi: TienTrinh | null = null;
  let daThayChay = false;
  while (Date.now() < hetLuc) {
    try {
      const t = await goiConsole<TienTrinh>('/api/progress', token);
      cuoi = t;
      if (t.running) daThayChay = true;
      // Chỉ kết luận "xong" SAU KHI đã thấy nó chạy: gọi quá sớm thì hàng đợi chưa
      // kịp nhận việc và `running` vẫn là false của lượt TRƯỚC — kết luận lúc đó
      // là đọc kết quả của một thao tác khác.
      if (daThayChay && !t.running) return t;
    } catch {
      /* Một nhịp đọc hỏng không phải lý do bỏ cuộc — server vẫn đang làm việc. */
    }
    await new Promise((r) => setTimeout(r, moiMs));
  }
  return cuoi;
}

/** Thêm một L1 vừa đẻ vào ví người dùng, đúng khuôn EIP-3085. */
export async function themL1VaoVi(p: {
  chainIdHex: string;
  name: string;
  rpc: string;
  kyHieu: string;
}): Promise<void> {
  const v = layVi();
  if (!v) throw new Error('KHONG_CO_VI');
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
export async function kichHoatChain(chainIdHex: string, tuDiaChi: string): Promise<string> {
  const v = layVi();
  if (!v) throw new Error('KHONG_CO_VI');
  await v.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  // 🔴 21.000 gas là HẰNG SỐ của EVM cho một lượt chuyển tiền thường ⇒ không cần
  // `eth_estimateGas`, nên không dính bẫy "ước lượng THIẾU cho giao dịch đầu tiên
  // của chain vừa đẻ" (D-025) — bẫy hỏng câm, receipt chỉ có `status: 0`.
  return (await v.request({
    method: 'eth_sendTransaction',
    params: [{ from: tuDiaChi, to: tuDiaChi, value: '0x0', gas: '0x5208' }],
  })) as string;
}

export { faucetGoc };
