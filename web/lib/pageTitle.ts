'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useT } from './i18n';
import type { Dict } from './i18n/en';
import { interpolate } from './i18n/interpolate';
import { composeTitle, composeHomeTitle } from './seo';

/**
 * `<title>` đi theo ngôn ngữ người đọc chọn.
 *
 * ═══ LỖI ĐANG VÁ — ĐO ĐƯỢC TRONG BẢN SOÁT ĐA NGÔN NGỮ 2026-09-03 ═══
 * `metadata` của Next sinh lúc BUILD, và với `output: 'export'` mỗi trang chỉ có MỘT
 * bản HTML. Nên `<title>` luôn là tiếng Anh cho cả 30 ngôn ngữ. Bằng chứng bắt được
 * tại chỗ: `/re-genesis/` hiển thị **toàn bộ nội dung tiếng Ả Rập** trong khi tab
 * trình duyệt vẫn ghi *"A1 is being rebuilt on 2026-09-01"*.
 *
 * Cái giá không nằm ở thẩm mỹ: tiêu đề tab là thứ người dùng dùng để **tìm lại** một
 * trang giữa hai mươi tab đang mở, và nó là chữ đi vào **bookmark** cùng lịch sử
 * duyệt. Người đọc tiếng Ả Rập đánh dấu trang này sẽ có một dấu trang họ không đọc
 * được.
 *
 * ═══ 🔴 THỨ NÀY KHÔNG VÁ ĐƯỢC, VÀ ĐỪNG TƯỞNG NÓ VÁ ĐƯỢC ═══
 * Thẻ chia sẻ (`og:title`, `twitter:title`) VẪN tiếng Anh cho mọi người, mãi mãi,
 * chừng nào còn xuất tĩnh: bò quét của Telegram/Zalo/X/Facebook **không chạy JS**,
 * nên chúng chỉ thấy HTML lúc build. Hook này đổi `document.title` sau khi hydrate —
 * hữu ích cho CON NGƯỜI đang mở tab, vô hình với máy quét.
 * ⇒ Muốn thẻ chia sẻ theo ngôn ngữ thì phải có URL riêng cho từng ngôn ngữ
 *   (`/vi/faucet/`…). Đó là quyết định kiến trúc, đắt hơn nhiều, chưa làm. Xem
 *   chú thích trong `lib/seo.ts`.
 *
 * ═══ VÌ SAO MỘT CHỖ THEO ĐƯỜNG DẪN, KHÔNG PHẢI TÁM LỜI GỌI Ở TÁM TRANG ═══
 * Cách hiển nhiên là cho mỗi component nội dung tự đặt tiêu đề của nó. Tám chỗ thì
 * chỗ thứ chín — trang thêm vào tháng sau — sẽ bị quên, và triệu chứng là *tab mang
 * tiêu đề của trang khác*: một lỗi câm, không ai báo. Bảng dưới đây gom cả tám vào
 * một chỗ, và `scripts/check-title-map.mjs` đối chiếu nó với các trang THẬT trong
 * `out/` trước mỗi lượt build — thêm trang mà quên bảng là đỏ ngay.
 */

/**
 * Đường dẫn → tiêu đề TRẦN (chưa nối tên sản phẩm), lấy từ từ điển đang dùng.
 *
 * `null` = dùng khuôn TRANG CHỦ (tên sản phẩm đứng trước). Khoá phải TRÙNG với
 * `tieuDe:` mà `page.tsx` tương ứng truyền cho `pageMeta()` — nếu không, tiêu đề sẽ
 * **nhảy** một nhịp khi hydrate xong: HTML mang một câu, JS thay bằng câu khác.
 */
export const TITLE_BY_PATH: Record<string, (t: Dict) => string | null> = {
  '/': () => null,
  '/faucet/': (t) => t.faucet.title,
  '/create-chain/': (t) => t.launch.title,
  '/my-chains/': (t) => t.myChains.title,
  '/compare/': (t) => t.compare.title,
  '/chains/': (t) => t.nav.directory,
  '/live/': (t) => t.loadTest.title,
  '/re-genesis/': (t) => interpolate(t.rebuild.title, { date: t.rebuild.date }),
};

/** Tiêu đề cho mọi đường KHÔNG có trong bảng — tức trang 404. */
const NOT_FOUND_TITLE = (t: Dict) => t.notFound.title;

/**
 * Đặt `document.title` theo ngôn ngữ đang chọn. Gọi ĐÚNG MỘT LẦN, trong layout.
 *
 * ⚠️ KHÔNG có nhánh dọn dẹp trả tiêu đề cũ về: điều hướng trong site làm hook chạy
 * lại với đường mới, còn rời khỏi site thì tab đó không còn là của ta nữa. Một
 * `return () => { document.title = cu }` ở đây sẽ chạy TRƯỚC lượt đặt mới và làm
 * tiêu đề nháy hai lần.
 */
export function useLocalisedTitle(): void {
  const t = useT();
  const urlPath = usePathname();

  useEffect(() => {
    // `usePathname()` có thể trả đường KHÔNG có gạch chéo cuối tuỳ cách vào trang,
    // trong khi bảng khai theo `trailingSlash: true` của `next.config.ts`. Chuẩn hoá
    // một lần ở đây, thay vì khai hai khoá cho mỗi trang.
    const d = urlPath === '/' ? '/' : urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
    const lay = TITLE_BY_PATH[d] ?? NOT_FOUND_TITLE;
    const tran = lay(t);
    const muon =
      tran === null
        ? composeHomeTitle(t.common.productName, t.common.tagline)
        : composeTitle(tran, t.common.productName);

    document.title = muon;

    /**
     * 🔴 CANH LẠI `<title>`, VÌ MỘT LẦN GHI KHÔNG ĐỦ — ĐO ĐƯỢC TRÊN MẠNG THẬT
     * `2026-09-03`.
     *
     * Bản đầu chỉ có dòng `document.title = muon` ở trên. Nó chạy đúng khi người
     * dùng đổi ngôn ngữ QUA BỘ CHỌN (đo: tiêu đề lật sang `L1 目录` rồi `Danh bạ L1`),
     * nhưng ở **lượt tải đầu** — khi ngôn ngữ tới từ `localStorage` — tiêu đề đứng
     * nguyên tiếng Anh trong khi `<html lang>` và cả trang đã sang tiếng Việt.
     *
     * Phép đo phân biệt hai ca đó là thứ chỉ ra nguyên nhân: khác biệt duy nhất giữa
     * "tải đầu" và "đổi qua bộ chọn" là **hydrate**. Next dựng `<title>` từ
     * `metadata` phía server, và lượt đối chiếu cây sau hydrate ghi lại giá trị đó
     * SAU khi effect này đã ghi — nên bản dịch bị đè, im lặng.
     *
     * ⚠️ CÓ THỂ VÁ BẰNG `setTimeout(0)` — VÀ ĐÓ LÀ THỨ KHÔNG NÊN LÀM. Nó chỉ dịch
     * chỗ mình vào cuối một hàng đợi mà mình không kiểm soát; lần Next đổi nhịp là
     * lỗi quay lại, và quay lại IM LẶNG. `MutationObserver` không đua với ai: hễ có
     * ai đổi `<title>` khác giá trị ta muốn thì đặt lại. Điều kiện `!==` giữ cho nó
     * không tự gọi lại chính mình.
     *
     * An toàn ở đây vì mọi điều hướng trong site là TẢI LẠI TOÀN TRANG —
     * `check-static-export.mjs` bắt buộc mọi đường đi bằng thẻ `<a>` — nên không có
     * lượt đổi route phía client nào để observer này phải tranh chấp.
     */
    const the = document.querySelector('title');
    if (!the) return;
    const canh = new MutationObserver(() => {
      if (document.title !== muon) document.title = muon;
    });
    canh.observe(the, { childList: true, characterData: true, subtree: true });
    return () => canh.disconnect();
  }, [t, urlPath]);
}
