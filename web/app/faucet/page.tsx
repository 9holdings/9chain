import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
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
      <PageHeader group="faucet" />
      <FaucetForm />
    </div>
  );
}
