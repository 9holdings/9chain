import type { Metadata } from 'next';
import { vi, dien } from '@/lib/i18n/vi';
import { LuuY } from '@/components/ui';
// Chain ID lấy từ NGUỒN SỰ THẬT của mã, không gõ tay vào từ điển: nếu ngày nào đó
// số này đổi thật thì câu chữ trên trang đổi theo, không có đường để hai chỗ lệch.
import { CHAIN } from '@/lib/chain';
import { trangMeta } from '@/lib/seo';

/**
 * Trang re-genesis — nói trước cái sắp mất.
 *
 * 🔴 HÔM NAY TRANG NÀY VIẾT Ở THÌ TƯƠNG LAI. Đúng ngày G nó phải được thay bằng bản
 * công bố ở thì quá khứ ("đã sinh lại"), kèm đường dẫn bản lưu và mã băm. Bản nháp
 * công bố đã viết sẵn — đừng viết lại từ đầu.
 *
 * 🔴 MỘT ĐIỀU TRANG NÀY CỐ Ý KHÔNG NÓI, vì chưa ai đo:
 *   • Sổ giữ chỗ tên + Chain ID có sống sót qua ngày G không (mục O3b). Nói "còn"
 *     rồi hoá ra mất là đẩy người dùng vào đúng cái bẫy ví-trỏ-nhầm-chain.
 * Khi câu đó có lời đáp thì bổ sung, đừng đoán trước.
 *
 * ✅ Câu thứ hai ĐÃ CÓ LỜI ĐÁP: **D-047 chốt GIỮ chainId `9000000009`.** Mục
 * "Ví của bạn sẽ không báo gì cả" bên dưới chính là phần trang phải gánh vì quyết
 * định đó — giữ số nghĩa là ví không còn dấu hiệu nào để tự nhận ra mạng đã đổi,
 * nên hai hệ quả (số dư 0, và tx đã ký chưa phát) phải được nói ra bằng chữ.
 * Đừng gỡ mục đó nếu chưa đọc D-047.
 */
// 🔴 TRANG NÀY LÀ TRANG CẦN THẺ CHIA SẺ RIÊNG NHẤT TRONG CẢ SITE (Đ1-5).
// Trước lượt vá: dán liên kết này vào một nhóm chat thì thứ hiện lên là `og:*` của
// trang chủ — lời mời *"đẻ chain của bạn mất khoảng ba phút"*, ngược hẳn điều trang
// muốn nói, đúng tuần cần nó nhất. `title` thì đã riêng từ lâu, nên mọi cổng đo
// `<title>` vẫn xanh suốt thời gian đó.
// `trangMeta` tự cắt dấu `[?]` — không gọi `.replace()` ở đây nữa.
export const metadata: Metadata = trangMeta({
  tieuDe: dien(vi.reGenesis.tieuDe, { ngay: vi.reGenesis.ngay }),
  moTa: vi.reGenesis.moTa,
  duong: '/re-genesis/',
});

function Muc({ tieuDe, children }: { tieuDe: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-extrabold text-ink md:text-2xl">{tieuDe}</h2>
      <div className="mt-3 flex flex-col gap-3 text-base text-body">{children}</div>
    </section>
  );
}

export default function TrangReGenesis() {
  const ngay = vi.reGenesis.ngay;

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {dien(vi.reGenesis.tieuDe, { ngay })}
        </h1>
        <p className="mt-3 text-base text-body">{vi.reGenesis.moTa}</p>
      </header>

      <Muc tieuDe={vi.reGenesis.viSaoTieuDe}>
        <p>{vi.reGenesis.viSao1}</p>
        <p>{vi.reGenesis.viSao2}</p>
        <p>{vi.reGenesis.viSao3}</p>
      </Muc>

      <Muc tieuDe={vi.reGenesis.matTieuDe}>
        <p>{vi.reGenesis.matMoTa}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{vi.reGenesis.mat1}</li>
          <li>{vi.reGenesis.mat2}</li>
          <li>{vi.reGenesis.mat3}</li>
          <li>{vi.reGenesis.mat4}</li>
        </ul>
      </Muc>

      <Muc tieuDe={vi.reGenesis.conTieuDe}>
        <p>{vi.reGenesis.conMoTa}</p>
      </Muc>

      <Muc tieuDe={vi.reGenesis.lamTieuDe}>
        <p className="font-semibold text-ink">{vi.reGenesis.lamTruoc}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{vi.reGenesis.lam1}</li>
        </ul>
        <p className="mt-2 font-semibold text-ink">{vi.reGenesis.lamSau}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{vi.reGenesis.lam2}</li>
          <li>{vi.reGenesis.lam3}</li>
          <li>{vi.reGenesis.lam4}</li>
        </ul>
      </Muc>

      {/* Đứng NGAY SAU "Bạn cần làm gì": mục trên nói việc phải làm, mục này nói
          cái sẽ thấy nếu không làm. Đảo thứ tự là bắt người đọc nhớ một cảnh báo
          trừu tượng trước khi biết nó dẫn tới thao tác nào. */}
      <Muc tieuDe={vi.reGenesis.imLangTieuDe}>
        <p>{dien(vi.reGenesis.imLangMoTa, { chainId: CHAIN.chainId })}</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>{vi.reGenesis.imLang1}</li>
          <li>{vi.reGenesis.imLang2}</li>
        </ul>
      </Muc>

      <Muc tieuDe={vi.reGenesis.lapTieuDe}>
        <p>{vi.reGenesis.lapMoTa}</p>
      </Muc>

      <div className="mt-10">
        <LuuY kieu="canhBao">
          <p className="font-semibold">{vi.reGenesis.ngayLuuY}</p>
          <p className="mt-1">{dien(vi.reGenesis.ngayLuuYMoTa, { ngay })}</p>
        </LuuY>
      </div>
    </div>
  );
}
