'use client';

import { LuuY } from '@/components/ui';
import { CHAIN } from '@/lib/chain';
import { dien, useT } from '@/lib/i18n';

/**
 * Thân trang re-genesis — tách khỏi `page.tsx` (server component, giữ `metadata`).
 * Lý do đầy đủ: `components/PageHeader.tsx`.
 *
 * 🔴 Mọi chú thích về VÌ SAO từng câu được viết như vậy nằm ở khối `reGenesis` trong
 * `lib/i18n/dicts/vi.ts` và `lib/i18n/en.ts`. Đọc ở đó trước khi sửa chữ.
 */
function Muc({ tieuDe, children }: { tieuDe: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-extrabold text-ink md:text-2xl">{tieuDe}</h2>
      <div className="mt-3 flex flex-col gap-3 text-base text-body">{children}</div>
    </section>
  );
}

export function NoiDungReGenesis() {
  const t = useT();
  const ngay = t.rebuild.date;

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {dien(t.rebuild.title, { ngay })}
        </h1>
        <p className="mt-3 text-base text-body">{t.rebuild.desc}</p>
      </header>

      {/* 🔴 ĐỨNG TRƯỚC MỌI THỨ, KỂ CẢ "vì sao" (D-081, 2026-08-27).
          Mạng công khai ĐÃ sinh lại một lượt HÔM NAY, trước ngày G. Cảnh báo về
          01/09 bên dưới vẫn đúng và vẫn cần — sẽ còn một lượt nữa — nhưng người có
          token trước hôm nay quay lại sẽ thấy số dư 0 và trang chỉ nói chuyện tương
          lai. Họ sẽ kết luận ví mình hỏng.
          ⚠️ Đường cơ sở sáng nay chứng minh KHÔNG chain người dùng nào mất. Faucet
          thì KHÔNG có sổ bền (chỉ `Map` trong bộ nhớ) nên KHÔNG chứng minh được là
          không ai mất token — vì thế câu chữ nói "nếu bạn có token trước đó", không
          nói "không ai mất gì". */}
      <div className="mt-6">
        <LuuY kieu="canhBao">
          <p className="font-semibold">{t.rebuild.alreadyTitle}</p>
          <p className="mt-1">{t.rebuild.alreadyDesc}</p>
        </LuuY>
      </div>

      <Muc tieuDe={t.rebuild.whyTitle}>
        <p>{t.rebuild.why1}</p>
        <p>{t.rebuild.why2}</p>
        <p>{t.rebuild.why3}</p>
      </Muc>

      <Muc tieuDe={t.rebuild.lostTitle}>
        <p>{t.rebuild.lostDesc}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.lost1}</li>
          <li>{t.rebuild.lost2}</li>
          <li>{t.rebuild.lost3}</li>
          <li>{t.rebuild.lost4}</li>
        </ul>
      </Muc>

      <Muc tieuDe={t.rebuild.keptTitle}>
        <p>{t.rebuild.keptDesc}</p>
      </Muc>

      <Muc tieuDe={t.rebuild.toDoTitle}>
        <p className="font-semibold text-ink">{t.rebuild.toDoBefore}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.toDo1}</li>
        </ul>
        <p className="mt-2 font-semibold text-ink">{t.rebuild.toDoAfter}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.toDo2}</li>
          <li>{t.rebuild.toDo3}</li>
          <li>{t.rebuild.toDo4}</li>
        </ul>
        {/* 🔴 ĐƯỜNG ĐI, KHÔNG PHẢI NÚT GỌI VÍ (Đ1-13, 2026-08-27).
            Đo `27/08`: trang này nhắc chữ "faucet" **13 lần** mà thân trang có
            **0 `href`** — hai liên kết `/faucet/` duy nhất trong HTML đều là của
            thanh điều hướng. Trang bảo người ta đi làm một việc rồi không chỉ đường.
            ⚠️ CỐ Ý chỉ thêm thẻ `<a>`, KHÔNG chép nút "Thêm mạng vào ví" sang đây.
            Luật cũ ở `vi.ts` đúng và giữ nguyên: trang này là trang ĐỌC, mọi thao
            tác gọi ví phải nằm ở màn có ngữ cảnh xử lý lỗi của nó. */}
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <a href="/faucet/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.faucet}
          </a>
          <a href="/create-chain/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.launch}
          </a>
          <a href="/my-chains/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.myChains}
          </a>
        </p>
      </Muc>

      {/* Đứng NGAY SAU "Bạn cần làm gì": mục trên nói việc phải làm, mục này nói
          cái sẽ thấy nếu không làm. Đảo thứ tự là bắt người đọc nhớ một cảnh báo
          trừu tượng trước khi biết nó dẫn tới thao tác nào. */}
      <Muc tieuDe={t.rebuild.silentTitle}>
        <p>{dien(t.rebuild.silentDesc, { chainId: CHAIN.chainId })}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.silent1}</li>
          <li>{t.rebuild.silent2}</li>
        </ul>
      </Muc>

      <Muc tieuDe={t.rebuild.repeatTitle}>
        <p>{t.rebuild.repeatDesc}</p>
      </Muc>

      <div className="mt-10">
        <LuuY kieu="canhBao">
          <p className="font-semibold">{t.rebuild.dateNote}</p>
          <p className="mt-1">{dien(t.rebuild.dateNoteDesc, { ngay })}</p>
        </LuuY>
      </div>
    </div>
  );
}
