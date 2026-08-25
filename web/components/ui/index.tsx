'use client';

/**
 * Bộ component tự viết — KHÔNG shadcn/MUI/Radix/Ant.
 *
 * Mọi màu đi qua token (`bg-surface`, `text-ink`…), không hardcode hex ở đây. Mọi
 * thứ bấm được phải có vòng focus (luật nền ở `globals.css` lo phần đó) và nhãn cho
 * trình đọc màn hình.
 *
 * Gom vào MỘT file thay vì mỗi component một file: bộ này nhỏ và luôn được đọc cùng
 * nhau; tách ra thành 12 file 20 dòng làm việc "xem primitive nào đã có" tốn thêm
 * một vòng mở thư mục — mà đó chính là lúc người ta bỏ cuộc và viết style rời rạc.
 */
import { useEffect, useId, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { vi } from '@/lib/i18n/vi';

export function gop(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}

/* ───────────────────────────────────────────────────────────────── Button */

type KieuNut = 'chinh' | 'phu' | 'vien' | 'tron';
type CoNut = 'vua' | 'to';

const NUT_CHUNG =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors ' +
  'disabled:opacity-55 disabled:cursor-not-allowed select-none';

const NUT_KIEU: Record<KieuNut, string> = {
  // Vàng là màu CTA của thương hiệu; chữ trên nền vàng phải là navy, không phải trắng.
  chinh: 'bg-gold text-navy hover:bg-gold-hover shadow-cta',
  phu: 'bg-navy text-on-dark hover:bg-navy-hover',
  vien: 'border border-line-strong bg-surface text-ink hover:bg-surface-alt',
  tron: 'text-body hover:text-ink hover:bg-surface-alt',
};

const NUT_CO: Record<CoNut, string> = {
  vua: 'h-11 px-4 text-sm rounded-btn',
  to: 'h-13 px-6 text-base rounded-btn-lg',
};

export function Nut({
  kieu = 'chinh',
  co = 'vua',
  dangChay = false,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { kieu?: KieuNut; co?: CoNut; dangChay?: boolean }) {
  return (
    <button
      {...rest}
      // `aria-busy` chứ không chỉ đổi chữ: người dùng trình đọc màn hình cần biết
      // nút đang bận, mà chữ đổi thì họ chỉ nghe lại khi tự điều hướng tới nó.
      aria-busy={dangChay || undefined}
      disabled={rest.disabled || dangChay}
      className={gop(NUT_CHUNG, NUT_KIEU[kieu], NUT_CO[co], className)}
    >
      {dangChay && <VongXoay />}
      {children}
    </button>
  );
}

function VongXoay() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

/* ───────────────────────────────────────────────────────────────── Card */

export function The({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={gop('rounded-card border border-line bg-surface shadow-card', className)}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Field */

export function O({
  nhan,
  moTa,
  loi,
  goiY,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  nhan: string;
  moTa?: string;
  loi?: string;
  goiY?: ReactNode;
}) {
  const tuSinh = useId();
  const idThat = id ?? tuSinh;
  const idMoTa = `${idThat}-mota`;
  const idLoi = `${idThat}-loi`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idThat} className="text-sm font-semibold text-ink">
        {nhan}
      </label>
      {moTa && (
        <p id={idMoTa} className="text-sm text-muted">
          {moTa}
        </p>
      )}
      <input
        {...rest}
        id={idThat}
        // Nối CẢ hai id: trình đọc màn hình đọc mô tả rồi tới lỗi. Chỉ trỏ vào lỗi
        // là người dùng mất luôn phần hướng dẫn ngay khi họ cần nó nhất.
        aria-describedby={gop(moTa && idMoTa, loi && idLoi) || undefined}
        aria-invalid={loi ? true : undefined}
        className={gop(
          'h-12 w-full rounded-btn border bg-surface px-3 font-mono text-sm text-ink',
          'placeholder:text-muted placeholder:font-sans',
          loi ? 'border-danger' : 'border-line-strong',
          className,
        )}
      />
      {loi && (
        // `role="alert"` để lỗi được đọc lên ngay khi xuất hiện, không phải chờ
        // người dùng tự di chuyển tới.
        <p id={idLoi} role="alert" className="text-sm font-medium text-danger">
          {loi}
          {goiY && <span className="block font-normal text-muted">{goiY}</span>}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Badge */

type KieuNhan = 'trungTinh' | 'tot' | 'canhBao' | 'xau';
const NHAN_KIEU: Record<KieuNhan, string> = {
  trungTinh: 'bg-vision-bg text-vision-ink border-vision-line',
  tot: 'bg-success-bg text-success-ink border-success-line',
  canhBao: 'bg-gold-tint text-dev-ink border-dev-line',
  xau: 'bg-surface-alt text-danger border-line-strong',
};

export function Nhan({ kieu = 'trungTinh', children }: { kieu?: KieuNhan; children: ReactNode }) {
  return (
    <span
      className={gop(
        'inline-flex items-center gap-1 rounded-chip border px-2 py-0.5 text-xs font-semibold',
        NHAN_KIEU[kieu],
      )}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────── Skeleton */

export function Xuong({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={gop('block animate-pulse rounded-chip bg-bar', className)}
    />
  );
}

/* ─────────────────────────────────────────────────────── Empty / Error state */

export function TrongRong({ tieuDe, moTa, hanhDong }: { tieuDe: string; moTa?: string; hanhDong?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface-alt px-6 py-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">{tieuDe}</p>
      {moTa && <p className="max-w-prose text-sm text-body-2">{moTa}</p>}
      {hanhDong}
    </div>
  );
}

export function CoLoi({ tieuDe, moTa, thuLai }: { tieuDe?: string; moTa?: string; thuLai?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-card border border-line-strong bg-surface px-5 py-4"
    >
      <p className="font-semibold text-ink">{tieuDe ?? vi.loi.khongKetNoi}</p>
      <p className="text-sm text-body-2">{moTa ?? vi.loi.khongKetNoiMoTa}</p>
      {thuLai && (
        <Nut kieu="vien" onClick={thuLai}>
          {vi.chung.thuLai}
        </Nut>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Copyable */

export function ChepDuoc({ giaTri, nhan, className }: { giaTri: string; nhan?: string; className?: string }) {
  const [daChep, datDaChep] = useState(false);
  useEffect(() => {
    if (!daChep) return;
    const t = setTimeout(() => datDaChep(false), 1600);
    return () => clearTimeout(t);
  }, [daChep]);

  return (
    <button
      type="button"
      // Nhãn phải nói RÕ chép cái gì — "Sao chép" một mình thì trong danh sách 5 nút
      // giống hệt nhau, người dùng trình đọc màn hình không biết mình đang ở nút nào.
      aria-label={`${vi.chung.saoChep} ${nhan ?? giaTri}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(giaTri);
          datDaChep(true);
        } catch {
          /* Trình duyệt từ chối clipboard (thiếu quyền / không phải HTTPS): im lặng
             là đúng ở đây — người dùng vẫn bôi đen chép tay được, còn hiện lỗi đỏ
             cho một thao tác tiện ích thì ồn hơn giá trị nó mang lại. */
        }
      }}
      className={gop(
        'inline-flex max-w-full items-center gap-2 rounded-chip border border-line px-2 py-1',
        'font-mono text-xs text-body hover:bg-surface-alt',
        className,
      )}
    >
      <span className="truncate">{giaTri}</span>
      <span aria-hidden="true" className="shrink-0 text-muted">
        {daChep ? '✓' : '⧉'}
      </span>
      {/* Thông báo cho trình đọc màn hình — vùng live riêng, không phụ thuộc vào
          việc dấu ✓ có được đọc hay không. */}
      <span className="sr-only" role="status">
        {daChep ? vi.chung.daChep : ''}
      </span>
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────── Callout */

export function LuuY({ kieu = 'thuong', children }: { kieu?: 'thuong' | 'canhBao'; children: ReactNode }) {
  return (
    <div
      className={gop(
        'rounded-card border px-4 py-3 text-sm',
        kieu === 'canhBao'
          ? 'border-dev-line bg-gold-tint-2 text-dev-ink'
          : 'border-line bg-surface-alt text-body',
      )}
    >
      {children}
    </div>
  );
}
