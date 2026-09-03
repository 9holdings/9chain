'use client';

/**
 * Lưới an toàn cho mọi lượt gọi mạng NGẮN của site. (Đ1-8)
 *
 * ═══ 🔴 RÀNG BUỘC SỐ MỘT, ĐỌC TRƯỚC KHI DÙNG Ở ĐÂU KHÁC ═══
 * **KHÔNG ĐƯỢC đặt hạn giờ cho `/api/create` và `/api/revoke`.**
 * Hai thao tác đó mất ~170–300 giây thật (node khởi động lại LẦN LƯỢT để mạng không
 * mất quorum). Một `AbortSignal.timeout` ở đó sẽ **huỷ request của trình duyệt trong
 * khi server vẫn đang đẻ chain** — người dùng thấy "lỗi", chain vẫn ra đời, và họ đi
 * bấm lại. Đó là kiểu hỏng đắt nhất màn này có thể có.
 * ⇒ Vì vậy `fetchJson` **mặc định KHÔNG có hạn giờ**. Hạn giờ là thứ phải **bật ra**,
 *   không phải thứ phải nhớ tắt đi. Chọn chiều đó có chủ ý: lỡ quên bật thì cùng lắm
 *   chậm như hôm nay; lỡ quên tắt thì gãy một đường không sửa lại được.
 *
 * ═══ VÌ SAO KHÔNG CHỈ LÀ `try/catch` ═══
 * Ba kiểu hỏng dưới đây trông y hệt nhau nếu chỉ bắt `catch`:
 *   • **hết giờ**      — mạng chậm/treo. Thử lại thường ăn.
 *   • **HTTP 4xx/5xx** — server ĐÃ trả lời và trả lời là "không". Thử lại vô ích.
 *   • **không phải JSON** — thường là **định tuyến sai**: request rơi xuống
 *     Blockscout ở gốc `/` và ta nhận về HTML. Đây là lỗi hạ tầng, không phải lỗi dữ
 *     liệu, và nếu không nói rõ thì người sửa đi tìm ở đúng chỗ không có gì.
 * Trộn cả ba thành một câu "không tải được" là vứt đi thông tin đắt nhất mà lượt
 * hỏng vừa sinh ra.
 *
 * ⚠️ `r.ok` PHẢI được kiểm. `fetch` **không** ném lỗi khi HTTP 404/500 — nó chỉ ném
 * khi mạng đứt. Bỏ qua `r.ok` là để một trang lỗi đi tiếp vào `JSON.parse` và hỏng ở
 * một chỗ chẳng liên quan gì.
 */

/** Hạn mặc định cho một lượt ĐỌC ngắn (số liệu, danh bạ, hạn mức faucet). */
export const READ_TIMEOUT_MS = 12_000;

export type FailureKind = 'hetGio' | 'http' | 'khongPhaiJson' | 'dutMang';

export class NetworkError extends Error {
  readonly loai: FailureKind;
  readonly status: number;
  constructor(loai: FailureKind, message: string, status = 0) {
    super(message);
    this.name = 'NetworkError';
    this.loai = loai;
    this.status = status;
  }
  /** Server đã trả lời và trả lời là "không" ⇒ thử lại vô ích. */
  get thuLaiVoIch(): boolean {
    return this.loai === 'http' && this.status >= 400 && this.status < 500;
  }
}

/**
 * Đọc JSON từ một URL, có phân loại lỗi.
 *
 * @param hanGiay  Hạn giờ tính bằng **giây**. Bỏ trống = **KHÔNG hạn giờ** (xem
 *                 ràng buộc số một ở đầu tệp). Truyền `READ_TIMEOUT_MS / 1000` cho các
 *                 lượt đọc ngắn.
 */
export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit = {},
  hanGiay?: number,
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, {
      cache: 'no-store',
      ...init,
      // `AbortSignal.timeout` CHỈ khi được yêu cầu tường minh.
      ...(hanGiay ? { signal: AbortSignal.timeout(hanGiay * 1000) } : {}),
    });
  } catch (e) {
    // `AbortSignal.timeout` ném `TimeoutError`; đứt mạng ném `TypeError`.
    const ten = (e as Error)?.name;
    if (ten === 'TimeoutError' || ten === 'AbortError') {
      throw new NetworkError('hetGio', `quá ${hanGiay}s không có trả lời`);
    }
    throw new NetworkError('dutMang', (e as Error)?.message ?? 'không gọi được');
  }

  const t = await r.text();
  let j: unknown;
  try {
    j = JSON.parse(t);
  } catch {
    // Nói rõ đây là nghi vấn ĐỊNH TUYẾN, kèm mã HTTP để phân biệt với lỗi thật.
    throw new NetworkError(
      'khongPhaiJson',
      `đáp án không phải JSON (HTTP ${r.status}) — nhiều khả năng đường dẫn bị giải sai`,
      r.status,
    );
  }
  if (!r.ok) {
    const loi = (j as { error?: string })?.error;
    throw new NetworkError('http', loi || `HTTP ${r.status}`, r.status);
  }
  return j as T;
}
