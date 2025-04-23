// components/layout/navbar/ClientDesktopMenu.tsx
'use client';

import { Menu } from 'lib/shopify/types';
import dynamic from 'next/dynamic';

const MegaMenuClient = dynamic(() => import('../../components/navigation/MegaMenuDropdown'), {
   ssr: false
});

export default function ClientDesktopMenu({ menu }: { menu: Menu[] }) {
   return (
      <ul className="flex gap-12">
         {menu.map((item) => (
            <MegaMenuClient key={item.title} item={item} />
         ))}
      </ul>
   );
}
