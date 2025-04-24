'use client';

import { ModeToggle } from '@/components/shared/theme-switcher';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

import Link from 'next/link';

function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <h4 className="font scroll-m-20 text-2xl tracking-tight">
              მთავარი გვერდი
            </h4>
          </Link>
        </div>

        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
