'use client';

import { useEffect, useState } from 'react';
import { rpcGoc, rpcCChain } from './chain';

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
export type SoLieu = {
  validatorTong: number;
  validatorKetNoi: number;
  soL1: number;
  chieuCaoBlock: number;
};

export type TrangThaiSoLieu =
  | { pha: 'dangTai' }
  | { pha: 'xong'; so: SoLieu }
  | { pha: 'hong'; viSao: string };

async function jsonRpc(url: string, method: string, params: unknown[] = []) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message ?? 'lỗi RPC');
  return j.result;
}

export function useSoLieu(): { tt: TrangThaiSoLieu; napLai: () => void } {
  const [tt, datTt] = useState<TrangThaiSoLieu>({ pha: 'dangTai' });
  const [lan, datLan] = useState(0);

  useEffect(() => {
    let huy = false;
    (async () => {
      datTt({ pha: 'dangTai' });
      try {
        // Ba nguồn độc lập, gọi song song. `Promise.all` chứ không `allSettled`:
        // một trang chủ hiện 2/3 con số đúng và 1 con số sai lệch còn khó đọc hơn
        // là nói thẳng "chưa lấy được".
        const [vld, chieuCao, danhBa] = await Promise.all([
          jsonRpc(`${rpcGoc()}/ext/bc/P`, 'platform.getCurrentValidators'),
          jsonRpc(rpcCChain(), 'eth_blockNumber'),
          fetch('/chains/data/console-chains.json', { cache: 'no-store' }).then((r) => {
            if (!r.ok) throw new Error(`danh bạ HTTP ${r.status}`);
            return r.json();
          }),
        ]);
        if (huy) return;
        const ds: { connected?: boolean }[] = vld?.validators ?? [];
        datTt({
          pha: 'xong',
          so: {
            validatorTong: ds.length,
            validatorKetNoi: ds.filter((v) => v.connected).length,
            soL1: Array.isArray(danhBa?.chains) ? danhBa.chains.length : 0,
            chieuCaoBlock: Number(chieuCao),
          },
        });
      } catch (e) {
        if (!huy) datTt({ pha: 'hong', viSao: String((e as Error).message ?? e) });
      }
    })();
    return () => {
      huy = true;
    };
  }, [lan]);

  return { tt, napLai: () => datLan((n) => n + 1) };
}
