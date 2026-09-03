'use client';

import { useEffect, useRef, useState } from 'react';
import { coTuDien, useNgonNgu, useT } from '@/lib/i18n';
import { NGON_NGU } from '@/lib/i18n/ngonNgu';

/**
 * Bộ chọn ngôn ngữ — 30 ngôn ngữ, tiếng Anh mặc định, tiếng Việt ở vị trí thứ 9.
 *
 * ═══ HAI ĐIỀU BỘ CHỌN NÀY NÓI RA THAY VÌ GIẤU ═══
 *
 * 1. 🔴 **MỨC ĐỘ SOÁT.** 29/30 bản là máy dịch. Site này nói với người lạ rằng tài
 *    sản của họ sẽ bị xoá vĩnh viễn — một câu dịch sai ở `/re-genesis/` không phải
 *    lỗi chính tả, mà là một người không hiểu mình sắp mất tiền. Bày 30 mục trông
 *    ngang nhau là để người đọc tự suy ra một điều không đúng; đó đúng lớp lỗi dự án
 *    đã gỡ khỏi trang chủ ngày `27/08` ("9 validator" đứng một mình).
 *    ⇒ Bản chưa có người soát mang nhãn, và nhãn đó cũng vào `aria-label`.
 *
 * 2. 🔴 **NGÔN NGỮ CHƯA CÓ TỪ ĐIỂN.** Trong lúc 28 bản còn đang dựng, chúng bị
 *    **vô hiệu hoá** chứ không chọn được rồi lặng lẽ rơi về tiếng Anh. Rơi im lặng
 *    là kiểu hỏng tệ nhất ở đây: người dùng chọn tiếng của mình, nhận tiếng Anh, và
 *    không có gì nói cho họ biết vì sao.
 *
 * ⚠️ KHÔNG dùng ảnh cờ — hai lý do, cái nào cũng đủ (chép nguyên từ 9Scan-A1):
 *    (a) cờ là QUỐC GIA chứ không phải ngôn ngữ; tiếng Ả Rập có 20+ nước, tiếng Anh
 *        không thuộc nước nào — gắn một lá cờ là chọn phe.
 *    (b) ảnh cờ từng gọi thẳng CDN bên thứ ba từ trình duyệt người dùng: 30 request
 *        lộ IP của họ cho một bên không liên quan gì tới dự án.
 *
 * Dùng `<details>`/`<summary>` thay cho menu tự viết: nó mở/đóng được bằng bàn phím
 * mà không cần một dòng JS nào, và không đẻ thêm bẫy tiêu điểm.
 */
export function ChonNgonNgu() {
  const t = useT();
  const { ma, ngonNgu, dangNap, datNgonNgu } = useNgonNgu();
  const [mo, datMo] = useState(false);
  const boc = useRef<HTMLDetailsElement>(null);

  // Bấm ra ngoài thì đóng. Esc do `<details>` lo sẵn.
  useEffect(() => {
    if (!mo) return;
    const ngoai = (e: MouseEvent) => {
      if (boc.current && !boc.current.contains(e.target as Node)) datMo(false);
    };
    document.addEventListener('mousedown', ngoai);
    return () => document.removeEventListener('mousedown', ngoai);
  }, [mo]);

  return (
    <details
      ref={boc}
      open={mo}
      onToggle={(e) => datMo((e.currentTarget as HTMLDetailsElement).open)}
      className="relative"
    >
      <summary
        className="tap-target flex cursor-pointer list-none items-center gap-1.5 rounded-btn border border-line-dark px-2.5 py-1.5 text-sm text-on-dark-2 transition-colors hover:border-gold hover:text-gold"
        aria-label={`${t.chonNgonNgu.nhan}: ${ngonNgu.tenAnh}`}
      >
        <span aria-hidden="true" className="font-mono text-xs font-bold uppercase">
          {ma}
        </span>
        <span className="hidden sm:inline">{ngonNgu.ten}</span>
        {dangNap && <span className="sr-only">{t.chung.dangTai}</span>}
      </summary>

      <div className="absolute end-0 z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-card border border-line bg-surface p-1.5 shadow-card">
        <ul>
          {NGON_NGU.map((n) => {
            const co = coTuDien(n.ma);
            const dangChon = n.ma === ma;
            return (
              <li key={n.ma}>
                <button
                  type="button"
                  disabled={!co}
                  onClick={() => {
                    datNgonNgu(n.ma);
                    datMo(false);
                  }}
                  aria-current={dangChon ? 'true' : undefined}
                  // Nhãn đầy đủ cho trình đọc màn hình: tên bản địa không giúp được
                  // người đang dùng giọng đọc của một thứ tiếng khác.
                  aria-label={
                    `${n.tenAnh}` +
                    (n.soat === 'may' ? ` — ${t.chonNgonNgu.mayDich}` : '') +
                    (co ? '' : ` — ${t.chonNgonNgu.chuaCo}`)
                  }
                  className={
                    'flex w-full items-center justify-between gap-2 rounded-btn px-3 py-2 text-start text-sm ' +
                    (dangChon ? 'bg-gold-tint font-semibold text-ink ' : 'text-body ') +
                    (co ? 'hover:bg-surface-alt' : 'cursor-not-allowed opacity-45')
                  }
                >
                  <span className="flex min-w-0 flex-col">
                    {/* `lang` trên chính mục: trình đọc màn hình đổi giọng đúng chỗ,
                        nếu không nó đọc "Tiếng Việt" bằng ngữ âm tiếng Anh. */}
                    <span lang={n.ma} dir={n.chieu} className="truncate">
                      {n.ten}
                    </span>
                    <span className="truncate text-xs text-muted">{n.tenAnh}</span>
                  </span>
                  {/* 🔴 NHÃN "máy dịch" TỪNG ĐỨNG Ở ĐÂY, GỠ `2026-09-03` — David chốt.
                      29/30 dòng đều mang nhãn, nên nó không còn phân biệt được gì
                      bằng mắt: thứ hiếm là dòng KHÔNG có nhãn, và mắt người đọc một
                      danh sách 30 mục thì bỏ qua thứ lặp lại ở mọi dòng. Nó chỉ làm
                      danh sách rối.
                      Lời khai KHÔNG mất, nó đổi chỗ: `aria-label` của chính nút này
                      vẫn nói ra, và câu giải thích đầy đủ ở chân danh sách bên dưới
                      vẫn đứng nguyên. Xem chú thích §1 đầu tệp — điều phải giữ là
                      "người đọc biết được bản này chưa ai soát", không phải "phải có
                      một cái chip trên mỗi dòng". */}
                  {!co ? (
                    <span className="shrink-0 text-xs text-muted">{t.chonNgonNgu.chuaCo}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-3 py-2 text-xs text-muted">{t.chonNgonNgu.mayDichGiaiThich}</p>
      </div>
    </details>
  );
}
