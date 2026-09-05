import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { FaucetForm } from './FaucetForm';

export const metadata: Metadata = pageMeta({
  title: EN.faucet.title,
  desc: EN.faucet.desc,
  urlPath: '/faucet/',
});

export default function TrangFaucet() {
  return (
    <div className="khung py-10 md:py-14">
      {/* The `<h1>` header is rendered INSIDE the screen since 2026-09-05 — see `components/PageHeader.tsx`. */}
      <FaucetForm />
    </div>
  );
}
