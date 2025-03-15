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
               'lg:text:lg md:text-md block p-2 text-sm text-black underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300',
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
         <ul className="md:just grid grid-cols-1 justify-items-center gap-6 font-light uppercase md:grid-cols-3 md:justify-items-start lg:grid-cols-3 lg:justify-items-start">
            {menu.map((item: Menu) => (
               <FooterMenuItem key={item.title} item={item} />
            ))}
         </ul>
      </nav>
   );
}
