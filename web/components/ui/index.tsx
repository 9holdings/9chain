'use client';

/**
 * Our own component set — NO shadcn/MUI/Radix/Ant.
 *
 * Every colour goes through a token (`bg-surface`, `text-ink`…); no hex is hard-coded here.
 * Everything clickable gets a focus ring (the base rules in `globals.css` handle that) and a
 * label for screen readers.
 *
 * Gathered into ONE file rather than one file per component: the set is small and always read
 * together; splitting it into 12 files of 20 lines makes "which primitive already exists"
 * cost an extra trip through a directory — and that is precisely the moment somebody gives up
 * and writes loose one-off styles.
 */
import {
  useEffect,
  useId,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';
import { useT } from '@/lib/i18n';
// `cx` lives in `lib/cx.ts` (outside the client boundary) and is re-exported here for
// convenience — see the comment in that file for why it is not defined in place.
import { cx } from '@/lib/cx';
export { cx };

/* ───────────────────────────────────────────────────────────────── Button */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors ' +
  'disabled:opacity-55 disabled:cursor-not-allowed select-none';

// 🔴 THE KEYS HERE MUST MATCH THE `ButtonVariant` UNION ABOVE CHARACTER FOR CHARACTER, and
// that union is made of STRINGS. The `2026-09-03` identifier rename changed the key `phu` to
// `note` (it was also a prop name elsewhere) while `'phu'` in the union — a string — did not
// change. `tsc` caught it immediately, but take it as a reminder: a name that exists BOTH as
// an identifier and as a string must be changed in BOTH places in one pass, or not at all.
// The whole variant vocabulary (`primary`/`secondary`/`outline`/`ghost`, `md`/`lg`) changed in
// that same pass — see the 2026-09-03 commit: the union is made of STRINGS, so `tsc` checks
// each value, quite unlike the `{…}` placeholders that no type guards at all.
const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // Gold is the brand CTA colour; text on gold must be navy, never white.
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
      // `aria-busy`, not just changed text: a screen-reader user needs to know the button is
      // busy, and a text change only reaches them if they navigate back to it themselves.
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
        // Join BOTH ids: the screen reader reads the description and then the error. Pointing only
        // at the error takes the guidance away exactly when the user needs it most.
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
        // `role="alert"` so the error is announced the moment it appears, rather than waiting for
        // the user to navigate to it.
        <p id={idLoi} role="alert" className="text-sm font-medium text-danger">
          {failure}
          {hint && <span className="block font-normal text-muted">{hint}</span>}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Select */

/**
 * A labelled native `<select>`. Native on purpose: it is keyboard-complete, screen-reader-
 * complete and touch-complete for free, and the directory's three pickers (type, grouping,
 * sort) have no need a custom listbox would meet. Same border/height vocabulary as `Field`
 * and the chain-type picker in `CreateChainScreen`, so the four read as one set.
 */
export function Select({
  label,
  id,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const auto = useId();
  const idThat = id ?? auto;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={idThat} className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <select
        {...rest}
        id={idThat}
        className={cx('h-11 min-w-0 rounded-btn border border-line-strong bg-surface px-3 text-sm text-ink', className)}
      >
        {children}
      </select>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── Chip */

/**
 * A toggle chip for a filter group. `aria-pressed` carries the state — the colour alone
 * does not reach a screen reader, and a colour-blind reader cannot tell navy from grey.
 */
export function Chip({
  pressed,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={pressed}
      className={cx(
        'tap-target inline-flex h-9 items-center gap-1.5 rounded-chip border px-3 text-sm font-semibold transition-colors',
        pressed ? 'border-navy bg-navy text-on-dark' : 'border-line-strong bg-surface text-body hover:bg-surface-alt',
        className,
      )}
    >
      {children}
    </button>
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
 * The empty state — it must read as an INVITATION, not as a blank box.
 *
 * 🔴 FIXED 2026-08-27 (Đ1-4), in two places, both measured:
 *
 * 1. `bg-surface-alt` is **byte-identical to the page background** in BOTH themes
 *    (light `#f5f7fb` / dark `#0a1122`). Which means this block previously had no background
 *    at all — just a dashed outline floating in space. Changed to `bg-surface` (card) +
 *    `shadow-card` so it lifts like a real card. `border-dashed` stays, because the dashed
 *    edge is what says "content will appear here", as opposed to a solid card = "here is the
 *    content".
 *
 * 2. The heading was a `<p>`. Inside `ChainTable` it sits exactly where a section heading
 *    belongs, so a screen reader skipped past it when browsing by structure. Changed to
 *    `<h2>` — something `axe-core` CANNOT catch (it has no way to know a `<p>` *ought* to be
 *    a heading), so it belongs to the "a11y beyond axe" group of Đ1-9.
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
      // The label must say WHAT is being copied — "Copy" on its own leaves a screen-reader user
      // unable to tell which of five identical buttons they are on.
      aria-label={`${t.common.copy} ${label ?? value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          /* The browser refused the clipboard (missing permission / not HTTPS): staying silent
             is right here — the user can still select and copy by hand, and showing a red error
             for a convenience action is noisier than the value it carries. */
        }
      }}
      className={cx(
        // `tap-target`: this is a BUTTON that copies, and it was 26px tall — on a phone the
        // reader is aiming at a strip a third of a fingertip high, next to text they might
        // want to select instead. 44px on touch, unchanged on a desktop.
        'tap-target inline-flex max-w-full items-center gap-2 rounded-chip border border-line px-2 py-1',
        'font-mono text-xs text-body hover:bg-surface-alt',
        className,
      )}
    >
      <span className="truncate">{value}</span>
      <span aria-hidden="true" className="shrink-0 text-muted">
        {copied ? '✓' : '⧉'}
      </span>
      {/* Announcement for screen readers — its own live region, not dependent on whether
          the ✓ mark happens to be read out. */}
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
 * A list of STEPS for a long operation.
 *
 * 🔴 Why not a spinner: launching a chain takes **~170 seconds** and that is DELIBERATE
 * (5 nodes restart one at a time so the network never loses quorum). A 170-second spinner
 * reads as "it broke" — the user reloads and presses again, and that second press is a
 * surplus chain eating one of the 15 slots.
 *
 * `aria-live="polite"` so a screen-reader user hears the progress without being interrupted;
 * `role="list"` keeps the list semantics now that the bullets are gone.
 */
export function Steps({ steps, footnote }: { steps: Step[]; footnote?: string }) {
  const t = useT();
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
              {/* The status has to be in the TEXT, not only in the glyph and the colour:
                  the glyph is aria-hidden, and a colour-blind reader cannot read the colour. */}
              <span className="sr-only">
                {b.status === 'done'
                  ? t.common.stepDone
                  : b.status === 'running'
                    ? t.common.stepRunning
                    : b.status === 'failed'
                      ? t.common.stepFailed
                      : t.common.stepPending}
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
