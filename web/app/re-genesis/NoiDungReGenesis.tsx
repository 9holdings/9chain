'use client';

import { LuuY } from '@/components/ui';
import { CHAIN } from '@/lib/chain';
import { dien, useT } from '@/lib/i18n';

/**
 * Thân trang re-genesis — tách khỏi `page.tsx` (server component, giữ `metadata`).
 * Lý do đầy đủ: `components/DauTrang.tsx`.
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
  const ngay = t.reGenesis.ngay;

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {dien(t.reGenesis.tieuDe, { ngay })}
        </h1>
        <p className="mt-3 text-base text-body">{t.reGenesis.moTa}</p>
      </header>

      <Muc tieuDe={t.reGenesis.viSaoTieuDe}>
        <p>{t.reGenesis.viSao1}</p>
        <p>{t.reGenesis.viSao2}</p>
        <p>{t.reGenesis.viSao3}</p>
      </Muc>

      <Muc tieuDe={t.reGenesis.matTieuDe}>
        <p>{t.reGenesis.matMoTa}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{t.reGenesis.mat1}</li>
          <li>{t.reGenesis.mat2}</li>
          <li>{t.reGenesis.mat3}</li>
          <li>{t.reGenesis.mat4}</li>
        </ul>
      </Muc>

      <Muc tieuDe={t.reGenesis.conTieuDe}>
        <p>{t.reGenesis.conMoTa}</p>
      </Muc>

      <Muc tieuDe={t.reGenesis.lamTieuDe}>
        <p className="font-semibold text-ink">{t.reGenesis.lamTruoc}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{t.reGenesis.lam1}</li>
        </ul>
        <p className="mt-2 font-semibold text-ink">{t.reGenesis.lamSau}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{t.reGenesis.lam2}</li>
          <li>{t.reGenesis.lam3}</li>
          <li>{t.reGenesis.lam4}</li>
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
            {t.dieuHuong.faucet}
          </a>
          <a href="/create-chain/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.dieuHuong.console}
          </a>
          <a href="/my-chains/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.dieuHuong.chainCuaToi}
          </a>
        </p>
      </Muc>

      {/* Đứng NGAY SAU "Bạn cần làm gì": mục trên nói việc phải làm, mục này nói
          cái sẽ thấy nếu không làm. Đảo thứ tự là bắt người đọc nhớ một cảnh báo
          trừu tượng trước khi biết nó dẫn tới thao tác nào. */}
      <Muc tieuDe={t.reGenesis.imLangTieuDe}>
        <p>{dien(t.reGenesis.imLangMoTa, { chainId: CHAIN.chainId })}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{t.reGenesis.imLang1}</li>
          <li>{t.reGenesis.imLang2}</li>
        </ul>
      </Muc>

      <Muc tieuDe={t.reGenesis.lapTieuDe}>
        <p>{t.reGenesis.lapMoTa}</p>
      </Muc>

      <div className="mt-10">
        <LuuY kieu="canhBao">
          <p className="font-semibold">{t.reGenesis.ngayLuuY}</p>
          <p className="mt-1">{dien(t.reGenesis.ngayLuuYMoTa, { ngay })}</p>
        </LuuY>
      </div>
    </div>
  );
}
