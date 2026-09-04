'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Note } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { getWallet, isMobileBrowser, metamaskDeepLink } from '@/lib/wallet';

/**
 * ═══ WHY THIS EXISTS (2026-09-04) ═══
 * On a phone, Safari and Chrome have no `window.ethereum` — there is no such thing as a wallet
 * extension there. Every "no wallet" sentence on the site said "install MetaMask and reload the
 * page", which a phone user can follow to the letter and still end up exactly where they started.
 * The working path on a phone is the other way round: open THIS page inside the MetaMask app,
 * whose built-in browser injects the wallet. MetaMask publishes a deep link for precisely that.
 *
 * `useMobileNoWallet()` is the situation; `<OpenInWallet />` is the answer. Both are computed in
 * an effect, never during render: the HTML is a static export, and a server-rendered `false`
 * that becomes `true` on the client is a hydration mismatch React will refuse to patch quietly.
 */
export function useMobileNoWallet(): boolean {
  const [yes, setYes] = useState(false);
  useEffect(() => {
    // 🔴 ASKED AGAIN ON EVERY ANNOUNCEMENT, not once at mount (2026-09-04). EIP-6963 wallets
    // announce themselves whenever they are ready, which can be after this effect has run — and
    // the first version concluded "no wallet on this phone" from that one early look. Seen on a
    // real page: a wallet arrived 2s late, and the banner telling the reader to go and open the
    // page inside MetaMask stayed on screen INSIDE MetaMask, above a form that was already
    // talking to that very wallet. The gap is small; it is also exactly the gap a slow phone
    // widens. Re-reading is free.
    const doc = () => setYes(isMobileBrowser() && !getWallet());
    doc();
    window.addEventListener('eip6963:announceProvider', doc);
    return () => window.removeEventListener('eip6963:announceProvider', doc);
  }, []);
  return yes;
}

/** `fallback` is what the desktop reader sees in the same spot (e.g. "install MetaMask…"). */
export function OpenInWallet({ fallback = null }: { fallback?: ReactNode }) {
  const t = useT();
  const show = useMobileNoWallet();
  if (!show) return fallback;
  return (
    <Note tone="warn">
      <p>{t.common.noWalletMobile}</p>
      <a
        // 🔴 A real `<a>`, not a `<Button onClick={() => location.assign(...)}>`: the deep link
        // has to be a top-level navigation the OS can hand to the MetaMask app. iOS ignores
        // universal links triggered from script; it honours a user tap on an anchor.
        href={metamaskDeepLink()}
        rel="noopener"
        className="mt-3 inline-flex h-11 items-center justify-center rounded-btn border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-alt"
      >
        {t.common.openInMetaMask}
      </a>
    </Note>
  );
}
