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
import { useT } from '@/lib/i18n';
// `cx` sống ở `lib/cx.ts` (ngoài ranh giới client) và được xuất lại ở đây cho
// tiện — xem chú thích trong file đó về vì sao không định nghĩa tại chỗ.
import { cx } from '@/lib/cx';
export { cx };

/* ───────────────────────────────────────────────────────────────── Button */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors ' +
  'disabled:opacity-55 disabled:cursor-not-allowed select-none';

// 🔴 KHOÁ Ở ĐÂY PHẢI TRÙNG TỪNG CHỮ với union `ButtonVariant` bên trên, và union đó là
// CHUỖI. Đợt đổi tên định danh `2026-09-03` sửa khoá `phu` thành `note` (nó cũng là
// tên một prop ở chỗ khác) trong khi `'phu'` trong union — một chuỗi — thì không đổi.
// `tsc` bắt ngay, nhưng đây là lời nhắc: tên nào tồn tại ĐỒNG THỜI dưới dạng định
// danh và dưới dạng chuỗi thì phải đổi CẢ HAI trong một lượt, hoặc không đổi gì.
// Cả bộ từ vựng biến thể (`primary`/`secondary`/`outline`/`ghost`, `md`/`lg`) đã đổi cùng lượt này —
// xem commit 2026-09-03: union là CHUỖI nên `tsc` đối chiếu từng giá trị, khác hẳn
// chỗ giữ chỗ `{…}` mà không kiểu nào canh.
const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // Vàng là màu CTA của thương hiệu; chữ trên nền vàng phải là navy, không phải trắng.
  primary: 'bg-gold text-navy hover:bg-gold-hover shadow-cta',
  secondary: 'bg-navy text-on-dark hover:bg-navy-hover',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-alt',
  ghost: 'text-body hover:text-ink hover:bg-surface-alt',
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm rounded-btn',
  lg: 'h-13 px-6 text-base rounded-btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isRunning = false,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; isRunning?: boolean }) {
  return (
    <button
      {...rest}
      // `aria-busy` chứ không chỉ đổi chữ: người dùng trình đọc màn hình cần biết
      // nút đang bận, mà chữ đổi thì họ chỉ nghe lại khi tự điều hướng tới nó.
      aria-busy={isRunning || undefined}
      disabled={rest.disabled || isRunning}
      className={cx(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], className)}
    >
      {isRunning && <VongXoay />}
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

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cx('rounded-card border border-line bg-surface shadow-card', className)}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Field */

export function Field({
  label,
  desc,
  failure,
  hint,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  desc?: string;
  failure?: string;
  hint?: ReactNode;
}) {
  const tuSinh = useId();
  const idThat = id ?? tuSinh;
  const idMoTa = `${idThat}-mota`;
  const idLoi = `${idThat}-loi`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idThat} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {desc && (
        <p id={idMoTa} className="text-sm text-muted">
          {desc}
        </p>
      )}
      <input
        {...rest}
        id={idThat}
        // Nối CẢ hai id: trình đọc màn hình đọc mô tả rồi tới lỗi. Chỉ trỏ vào lỗi
        // là người dùng mất luôn phần hướng dẫn ngay khi họ cần nó nhất.
        aria-describedby={cx(desc && idMoTa, failure && idLoi) || undefined}
        aria-invalid={failure ? true : undefined}
        className={cx(
          'h-12 w-full rounded-btn border bg-surface px-3 font-mono text-sm text-ink',
          'placeholder:text-muted placeholder:font-sans',
          failure ? 'border-danger' : 'border-line-strong',
          className,
        )}
      />
      {failure && (
        // `role="alert"` để lỗi được đọc lên ngay khi xuất hiện, không phải chờ
        // người dùng tự di chuyển tới.
        <p id={idLoi} role="alert" className="text-sm font-medium text-danger">
          {failure}
          {hint && <span className="block font-normal text-muted">{hint}</span>}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Badge */

type BadgeTone = 'neutral' | 'good' | 'warn' | 'bad';
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-vision-bg text-vision-ink border-vision-line',
  good: 'bg-success-bg text-success-ink border-success-line',
  warn: 'bg-gold-tint text-dev-ink border-dev-line',
  bad: 'bg-surface-alt text-danger border-line-strong',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-chip border px-2 py-0.5 text-xs font-semibold',
        BADGE_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────── Skeleton */

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx('block animate-pulse rounded-chip bg-bar', className)}
    />
  );
}

/* ─────────────────────────────────────────────────────── Empty / Error state */

/**
 * Trạng thái rỗng — phải đọc như một LỜI MỜI, không như một ô trống.
 *
 * 🔴 SỬA 2026-08-27 (Đ1-4), hai chỗ, cả hai đều đo được:
 *
 * 1. `bg-surface-alt` **trùng byte với nền trang** ở CẢ HAI chủ đề
 *    (sáng `#f5f7fb` / tối `#0a1122`). Nghĩa là khối này trước đây không có nền —
 *    chỉ có một đường gạch đứt lơ lửng. Đổi sang `bg-surface` (thẻ) + `shadow-card`
 *    để nó nổi lên như một thẻ thật. Giữ `border-dashed` vì nét đứt là thứ nói
 *    "chỗ này sẽ có nội dung", khác với thẻ đặc = "nội dung đây rồi".
 *
 * 2. Tiêu đề là `<p>`. Trong `ChainTable` nó đứng đúng chỗ một tiêu đề mục phải
 *    đứng, nên trình đọc màn hình nhảy qua nó khi duyệt theo cấu trúc. Đổi thành
 *    `<h2>` — đây là thứ `axe-core` KHÔNG bắt được (nó không biết một `<p>` *đáng
 *    lẽ* phải là heading), nên nó nằm trong nhóm "a11y ngoài tầm axe" của Đ1-9.
 */
export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {desc && <p className="max-w-prose text-sm text-body-2">{desc}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, desc, onRetry }: { title?: string; desc?: string; onRetry?: () => void }) {
  const t = useT();
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-card border border-line-strong bg-surface px-5 py-4"
    >
      <p className="font-semibold text-ink">{title ?? t.errors.unreachable}</p>
      <p className="text-sm text-body-2">{desc ?? t.errors.unreachableDesc}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Copyable */

export function Copyable({ value, label, className }: { value: string; label?: string; className?: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      // Nhãn phải nói RÕ chép cái gì — "Sao chép" một mình thì trong danh sách 5 nút
      // giống hệt nhau, người dùng trình đọc màn hình không biết mình đang ở nút nào.
      aria-label={`${t.common.copy} ${label ?? value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          /* Trình duyệt từ chối clipboard (thiếu quyền / không phải HTTPS): im lặng
             là đúng ở đây — người dùng vẫn bôi đen chép tay được, còn hiện lỗi đỏ
             cho một thao tác tiện ích thì ồn hơn giá trị nó mang lại. */
        }
      }}
      className={cx(
        'inline-flex max-w-full items-center gap-2 rounded-chip border border-line px-2 py-1',
        'font-mono text-xs text-body hover:bg-surface-alt',
        className,
      )}
    >
      <span className="truncate">{value}</span>
      <span aria-hidden="true" className="shrink-0 text-muted">
        {copied ? '✓' : '⧉'}
      </span>
      {/* Thông báo cho trình đọc màn hình — vùng live riêng, không phụ thuộc vào
          việc dấu ✓ có được đọc hay không. */}
      <span className="sr-only" role="status">
        {copied ? t.common.copied : ''}
      </span>
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────── Callout */

export function Note({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-card border px-4 py-3 text-sm',
        tone === 'warn'
          ? 'border-dev-line bg-gold-tint-2 text-dev-ink'
          : 'border-line bg-surface-alt text-body',
      )}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── Steps (Buoc) */

export type StepStatus = 'pending' | 'running' | 'done' | 'failed';
export type Step = { code: string; label: string; status: StepStatus; ms?: number };

const STEP_GLYPH: Record<StepStatus, string> = { pending: '○', running: '◐', done: '✓', failed: '✕' };
const STEP_COLOUR: Record<StepStatus, string> = {
  pending: 'text-muted',
  running: 'text-gold-ink-strong',
  done: 'text-success-ink',
  failed: 'text-danger',
};

/**
 * Danh sách BƯỚC cho thao tác dài.
 *
 * 🔴 Vì sao không phải spinner: một lượt đẻ chain mất **~170 giây** và đó là CHỦ Ý
 * (5 node restart lần lượt để mạng không mất quorum). Một vòng xoay 170 giây đọc là
 * "hỏng rồi" — người dùng tải lại trang và bấm lại, và lần bấm thứ hai là một chain
 * thừa ăn mất một slot trong trần 15.
 *
 * `aria-live="polite"` để người dùng trình đọc màn hình nghe được tiến trình mà
 * không bị cắt ngang; `role="list"` giữ ngữ nghĩa danh sách khi đã bỏ dấu chấm.
 */
export function Steps({ steps, footnote }: { steps: Step[]; footnote?: string }) {
  return (
    <div aria-live="polite">
      <ol role="list" className="flex flex-col gap-2">
        {steps.map((b) => (
          <li key={b.code} className="flex items-baseline gap-3 text-sm">
            <span aria-hidden="true" className={cx('w-4 shrink-0 font-mono', STEP_COLOUR[b.status])}>
              {STEP_GLYPH[b.status]}
            </span>
            <span className={cx('flex-1', b.status === 'pending' ? 'text-muted' : 'text-body')}>
              {b.label}
              {/* Trạng thái phải nằm trong CHỮ, không chỉ trong ký hiệu và màu:
                  ký hiệu bị aria-hidden, còn màu thì người mù màu không đọc được. */}
              <span className="sr-only">
                {b.status === 'done' ? ' — xong' : b.status === 'running' ? ' — đang chạy' : b.status === 'failed' ? ' — hỏng' : ' — chờ'}
              </span>
            </span>
            {b.ms ? <span className="font-mono text-xs text-muted">{(b.ms / 1000).toFixed(1)}s</span> : null}
          </li>
        ))}
      </ol>
      {footnote && <p className="mt-3 text-sm text-muted">{footnote}</p>}
    </div>
  );
}
