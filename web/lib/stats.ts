'use client';

import { useEffect, useState } from 'react';
import { rpcGoc, rpcCChain } from './chain';
import { docJson, HAN_DOC_MS, LoiMang } from './mang';

/**
 * Số liệu sống của mạng, cho trang chủ.
 *
 * ═══ ĐỌC MỘT LẦN LÚC MOUNT, KHÔNG POLL ═══
 * Trang chủ không phải bảng điều khiển. Poll mỗi vài giây trên một trang mà người
 * ta ở lại 20 giây là tự gánh một dòng request đều đặn từ mọi khách ghé qua, đổi
 * lấy một con số nhích. Muốn số nhúc nhích liên tục thì đó là việc của explorer.
 *
 * (Kèm một lý do thực dụng: `refetchInterval` kiểu nào cũng **không chạy** khi
 * `document.visibilityState === 'hidden'` — đúng trạng thái của mọi khung xem tự
 * động. Nghiệm thu polling bằng công cụ dễ ra âm tính giả; đọc-một-lần thì nghiệm
 * thu bằng tải lại trang, không mơ hồ.)
 *
 * ═══ BA TRẠNG THÁI, KHÔNG PHẢI HAI ═══
 * `dangTai` · `xong` · `hong`. Một con số TRỐNG ở trang chủ đọc như **mạng chết** —
 * đó là điều tệ nhất một trang testnet có thể nói về chính nó, và nó nói bằng cách
 * không nói gì.
 */
/**
 * 🔴 MỖI Ô CÓ THỂ VẮNG RIÊNG — `null` là "chưa đo được ô NÀY", không phải 0. (Đ1-8)
 *
 * Trước `2026-08-28` ba nguồn gọi bằng `Promise.all`, nên **một nguồn chết là mất
 * cả ba con số**. Ca cụ thể đã thấy: `console-chains.json` là tệp tĩnh do console
 * ghi ra; nó vắng mặt trong đúng cửa sổ mạng vừa sinh lại — tức **đúng lúc trang cần
 * nhất để nói "9/9 validator còn sống"**, thì nó lại không nói được gì cả.
 *
 * ⚠️ Chú thích cũ ở đây bảo vệ `Promise.all` bằng lý do *"hiện 2/3 con số đúng và
 * 1 con số SAI LỆCH còn khó đọc hơn"*. Lý do đó vẫn đúng — và bản này **không vi
 * phạm nó**: ô hỏng không hiện số cũ, không hiện 0, mà hiện thẳng "không đo được".
 * Điều bị cấm là **một con số sai**, không phải **một ô khai là vắng**.
 */
export type SoLieu = {
  validatorTong: number | null;
  validatorKetNoi: number | null;
  soL1: number | null;
  chieuCaoBlock: number | null;
};

export type TrangThaiSoLieu =
  | { pha: 'dangTai' }
  | { pha: 'xong'; so: SoLieu }
  | { pha: 'hong'; viSao: string };

async function jsonRpc(url: string, method: string, params: unknown[] = [], hanGiay = HAN_DOC_MS / 1000) {
  // Hạn giờ ở đây là AN TOÀN và bắt buộc: đây là các lượt ĐỌC ngắn của trang chủ.
  // (Ràng buộc "không hạn giờ" chỉ áp cho `/api/create` và `/api/revoke` — xem
  // `lib/mang.ts`. Không đường nào trong tệp này chạm tới chúng.)
  const j = await docJson<{ result?: unknown; error?: { message?: string } }>(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    },
    hanGiay,
  );
  if (j.error) throw new LoiMang('http', j.error.message ?? 'lỗi RPC', 200);
  return j.result;
}

export function useSoLieu(): { tt: TrangThaiSoLieu; napLai: () => void } {
  const [tt, datTt] = useState<TrangThaiSoLieu>({ pha: 'dangTai' });
  const [lan, datLan] = useState(0);

  useEffect(() => {
    let huy = false;
    (async () => {
      datTt({ pha: 'dangTai' });
      // 🔴 `allSettled`, KHÔNG `all` (Đ1-8). Ba nguồn độc lập nhau về mặt sự thật —
      // số validator không phụ thuộc vào việc danh bạ L1 có đọc được hay không — nên
      // buộc chúng sống chết cùng nhau là tự tạo ra một điểm hỏng chung không có
      // thật. Xem chú thích ở `SoLieu` cho vì sao điều này KHÔNG mâu thuẫn với luật
      // cũ "đừng hiện một con số sai lệch".
      const [rVld, rCao, rDanhBa] = await Promise.allSettled([
        jsonRpc(`${rpcGoc()}/ext/bc/P`, 'platform.getCurrentValidators') as Promise<{
          validators?: { connected?: boolean }[];
        }>,
        jsonRpc(rpcCChain(), 'eth_blockNumber') as Promise<string>,
        docJson<{ chains?: unknown[] }>('/chains/data/console-chains.json', {}, HAN_DOC_MS / 1000),
      ]);
      if (huy) return;

      const ds = rVld.status === 'fulfilled' ? rVld.value?.validators ?? [] : null;
      const cao = rCao.status === 'fulfilled' ? Number(rCao.value) : null;
      const soL1 =
        rDanhBa.status === 'fulfilled' && Array.isArray(rDanhBa.value?.chains)
          ? rDanhBa.value.chains.length
          : null;

      // Cả ba cùng hỏng ⇒ đây là "mạng không với tới được", không phải "một ô vắng".
      // Phân biệt hai ca đó là việc của giao diện: một dòng chữ nhạt vs ba ô gạch
      // ngang. Gộp chúng lại là nói với người đọc rằng mạng chết trong khi có thể
      // chỉ là một tệp tĩnh chưa kịp ghi.
      if (ds === null && cao === null && soL1 === null) {
        const dau = [rVld, rCao, rDanhBa].find((r) => r.status === 'rejected');
        const l = dau && dau.status === 'rejected' ? (dau.reason as LoiMang | Error) : null;
        datTt({ pha: 'hong', viSao: l?.message ?? 'không gọi được mạng' });
        return;
      }

      datTt({
        pha: 'xong',
        so: {
          validatorTong: ds === null ? null : ds.length,
          validatorKetNoi: ds === null ? null : ds.filter((v) => v.connected).length,
          soL1,
          chieuCaoBlock: cao,
        },
      });
    })();
    return () => {
      huy = true;
    };
  }, [lan]);

  return { tt, napLai: () => datLan((n) => n + 1) };
}
