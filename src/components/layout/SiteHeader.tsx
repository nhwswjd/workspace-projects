import { getSiteSetting } from '@/lib/db';
import { Header } from './Header';

export async function SiteHeader() {
  const siteName = await getSiteSetting('brand_name');
  return <Header siteName={siteName || 'ATELIER'} />;
}
