import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
import { pageMeta } from '@/lib/seo';
import { FaucetForm } from './FaucetForm';

export const metadata: Metadata = pageMeta({
  tieuDe: EN.faucet.title,
  moTa: EN.faucet.desc,
  duong: '/faucet/',
});

export default function TrangFaucet() {
  return (
    <div className="khung py-10 md:py-14">
      <PageHeader nhom="faucet" />
      <FaucetForm />
    </div>
  );
}
