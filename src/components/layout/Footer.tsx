import { brandInfo } from '@/lib/products';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white/80 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h3 className="font-display text-xl md:text-2xl tracking-widest mb-4">
              {brandInfo.name}
            </h3>
            <p className="font-display italic text-sm text-white/50">
              {brandInfo.tagline}
            </p>
          </div>

          <div className="md:text-right">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              联系我们
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-white/70">{brandInfo.contact.email}</p>
              <p className="text-white/70">{brandInfo.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs text-white/30 text-center">
            &copy; {new Date().getFullYear()} {brandInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
