'use client';

import { useT } from '@/lib/i18n';

/**
 * Đầu trang (`<h1>` + câu dẫn) cho bốn màn có cùng hình dạng.
 * (Đa ngôn ngữ, 2026-08-27)
 *
 * ═══ VÌ SAO PHẢI TÁCH RA THÀNH COMPONENT CLIENT ═══
 * `page.tsx` là **server component** — nó phải thế, vì `export const metadata` chỉ
 * hợp lệ ở server component. Nhưng server component chạy lúc BUILD, khi chưa có
 * trình duyệt và chưa có ngôn ngữ nào "đang chọn". Chữ nào cần đổi theo ngôn ngữ thì
 * buộc phải nằm dưới một biên client.
 *
 * ⇒ Ranh giới của cả site: **`metadata` ở server (tiếng Anh, cố định lúc build) ·
 * chữ hiển thị ở client (đổi theo lựa chọn của người đọc).**
 *
 * 🔴 PROP LÀ MỘT CHUỖI, KHÔNG PHẢI MỘT HÀM. Server component không truyền hàm sang
 * client được (không tuần tự hoá được). Nên chỗ này nhận **tên nhóm khoá** rồi tự
 * tra, thay vì nhận sẵn hai chuỗi đã dịch — nhận chuỗi đã dịch thì server phải biết
 * ngôn ngữ, mà nó không biết.
 *
 * Bốn nhóm dưới đây đều có đúng cặp `tieuDe` + `moTa`. Kiểu `NhomCoDauTrang` khoá
 * việc đó lại: thêm một nhóm thiếu một trong hai khoá là `tsc` đỏ ngay tại đây.
 */
type NhomCoDauTrang = 'faucet' | 'deChain' | 'chainCuaToi' | 'bang';

export function DauTrang({ nhom, rong }: { nhom: NhomCoDauTrang; rong?: 'hep' | 'vua' }) {
  const t = useT();
  const g = t[nhom];
  return (
    <header className={rong === 'vua' ? 'max-w-3xl' : 'max-w-2xl'}>
      <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{g.tieuDe}</h1>
      <p className="mt-3 text-base text-body">{g.moTa}</p>
    </header>
  );
}
