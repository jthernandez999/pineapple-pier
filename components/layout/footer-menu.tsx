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
               'block p-2 text-lg underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300 md:text-sm',
               {
                  'text-black dark:text-neutral-300': active
               }
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
         {/* Use a grid with even columns and centered items */}
         <ul className="grid grid-cols-1 justify-items-start gap-4 font-semibold uppercase md:grid-cols-3 lg:grid-cols-3">
            {menu.map((item: Menu) => (
               <FooterMenuItem key={item.title} item={item} />
            ))}
         </ul>
      </nav>
   );
}
