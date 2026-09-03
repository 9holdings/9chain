import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { DauTrang } from '@/components/PageHeader';
import { trangMeta } from '@/lib/seo';
import { FaucetForm } from './FaucetForm';

export const metadata: Metadata = trangMeta({
  tieuDe: EN.faucet.title,
  moTa: EN.faucet.desc,
  duong: '/faucet/',
});

export default function TrangFaucet() {
  return (
    <div className="khung py-10 md:py-14">
      <DauTrang nhom="faucet" />
      <FaucetForm />
    </div>
  );
}
