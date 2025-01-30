// import CartModal from 'components/cart/modal';
// import LogoSquare from 'components/logo-square';
// import { getMenu } from 'lib/shopify';
// import { Menu } from 'lib/shopify/types';
// import Link from 'next/link';
// import { Suspense } from 'react';
// import MobileMenu from './mobile-menu';
// import Search, { SearchSkeleton } from './search';

//  const { SITE_NAME } = process.env;

// interface NavbarProps {
//   siteName: string;
// }
// export interface MenuItem {
//   title: string;
//   path: string;
//   items?: MenuItem[];
// }

// export async function Navbar() {
//   const menu: MenuItem[] = await getMenu('main-menu');
// console.log('MENU', menu);
//   return (
//     <nav className="bg-white shadow-lg">
//       <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
//         <div className="block flex-none md:hidden">
//           <MobileMenu menu={menu} />
//         </div>
//         <div className="flex items-center">
//           <Link href="/" className="flex items-center gap-2">
//             <LogoSquare />
//              <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
//                {SITE_NAME}
//              </div>
//           </Link>
//         </div>
//         <div className="hidden md:flex md:items-center">
//           {menu.length > 0 && (
//             <ul className="flex gap-8">
//               {menu.map((item: Menu) => (
//                 <MegaMenuComponent key={item.title} item={item} />
//               ))}
//             </ul>
            
//           )}
//         </div>
        
//         <div className="hidden justify-center md:flex md:w-1/3">
//        <Suspense fallback={<SearchSkeleton />}>
//          <Search />
//        </Suspense>
//      </div>
//         <div className="flex items-center">
//           {/* <Suspense fallback={<OpenCart />}> */}
//           <CartModal />
//           {/* </Suspense> */}
//         </div>
//       </div>
//     </nav>
//   );
// }

// interface MegaMenuComponentProps {
//   item: MenuItem;
// }

// const MegaMenuComponent: React.FC<MegaMenuComponentProps> = ({ item }) => {
//   const hasSubmenu = item.items && item.items.length > 0;
//   return (
//     <li className="group relative">
//       <Link
//         href={item.path}
//         className="text-base font-medium text-gray-700 transition hover:text-gray-900"
//       >
//         {item.title}
//       </Link>
//       {hasSubmenu && (
//         <div className="absolute inset-x-0 top-full z-50 hidden bg-white shadow-lg group-hover:flex">
//           <div className="mx-auto px-8 py-4 w-full max-w-screen-xl">
//             <ul className="flex justify-around space-x-8">
//               {item.items && item.items.map((subItem) => (
//                 <li key={subItem.title} className="text-center">
//                   <Link
//                     href={subItem.path}
//                     className="block py-2 text-lg font-semibold text-gray-700 hover:text-gray-900"
//                   >
//                     {subItem.title}
//                   </Link>
//                   {/* Optional: Add nested submenus if needed */}
//                   {subItem.items && (
//                     <ul>
//                       {subItem.items.map((nestedItem) => (
//                         <li key={nestedItem.title}>
//                           <Link
//                             href={nestedItem.path}
//                             className="block py-2 text-lg font-semibold text-gray-700 hover:text-gray-900"
//                           >
//                             {nestedItem.title}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </li>
//   );
// };



import CartModal from 'components/cart/modal';
import LogoSquare from 'components/logo-square';
import { getMenu } from 'lib/shopify';
import { Menu } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';

const { SITE_NAME } = process.env;

export async function Navbar() {
  // const menu = await getMenu('next-js-frontend-header-menu');
  const menu: Menu[] = await getMenu('main-menu');

console.log('MENU', menu)
  

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          <div className="hidden md:flex md:items-center">
          {menu.length ? (
          <ul className="hidden gap-6 text-sm md:flex md:items-center">
          {menu.map((item: Menu) => (
              <MegaMenuComponent key={item.title} item={item} />
          ))}
        </ul>
          )
          : null
        }
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
        </div>
      </div>
    </nav>
  );
}


interface MegaMenuComponentProps {
  item: Menu;
}

const MegaMenuComponent: React.FC<MegaMenuComponentProps> = ({ item }) => {
  const hasSubmenu = item.items && item.items.length > 0;
  return (
    <li className="group relative">
      <Link
        href={item.path}
        className="text-base font-medium text-gray-700 transition hover:text-gray-900"
      >
        {item.title}
      </Link>
      {hasSubmenu && (
        <div className="absolute inset-x-0 top-full z-50 hidden bg-white shadow-lg group-hover:flex">
          <div className="mx-auto px-8 py-4 w-full max-w-screen-xl">
            <ul className="flex justify-around space-x-8">
              {item.items && item.items.map((subItem) => (
                <li key={subItem.title} className="text-center">
                  <Link
                    href={subItem.path}
                    className="block py-2 text-lg font-semibold text-gray-700 hover:text-gray-900"
                  >
                    {subItem.title}
                  </Link>
                  {/* Optional: Add nested submenus if needed */}
                  {subItem.items && (
                    <ul>
                      {subItem.items.map((nestedItem) => (
                        <li key={nestedItem.title}>
                          <Link
                            href={nestedItem.path}
                            className="block py-2 text-lg font-semibold text-gray-700 hover:text-gray-900"
                          >
                            {nestedItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};
