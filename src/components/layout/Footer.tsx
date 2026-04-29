import { brandInfo } from '@/lib/products';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white/80 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h3 className="font-display text-2xl md:text-3xl tracking-widest mb-6">
              {brandInfo.name}
            </h3>
            <p className="font-display italic text-lg text-white/60 mb-6">
              {brandInfo.tagline}
            </p>
            <p className="text-sm text-white/50 leading-relaxed max-w-md">
              {brandInfo.description}
            </p>
          </div>

          <div className="md:text-right">
            <h4 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
              联系我们
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-white/70">{brandInfo.contact.email}</p>
              <p className="text-white/70">{brandInfo.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-xs text-white/30 text-center">
            &copy; {new Date().getFullYear()} {brandInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
