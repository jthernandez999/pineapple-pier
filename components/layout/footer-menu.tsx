'use client';

import clsx from 'clsx';
import { Menu } from 'lib/shopify/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function FooterMenuItem({ item }: { item: Menu }) {
   const pathname = usePathname();
   const [active, setActive] = useState(pathname === item.path);

   useEffect(() => {
      setActive(pathname === item.path);
   }, [pathname, item.path]);

   return (
      <li className="text-center">
         <Link
            href={item.path}
            className={clsx(
               'block p-2 text-xs uppercase transition-colors duration-300',
               active ? 'text-black' : 'text-black hover:text-gray-400'
            )}
         >
            {item.title}
         </Link>
      </li>
   );
}

export default function FooterMenu({ menu }: { menu: Menu[] }) {
   if (!menu.length) return null;

   return (
      <nav>
         <ul
            className={clsx(
               'grid grid-cols-1 justify-items-center gap-6 font-poppins font-light uppercase',
               'md:grid-cols-3 md:justify-items-start'
            )}
         >
            {menu.map((item: Menu) => (
               <FooterMenuItem key={item.title} item={item} />
            ))}
         </ul>
      </nav>
   );
}
