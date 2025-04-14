'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { AccountOrdersHistory } from './account-orders-history';
import { doLogout } from './actions';

type AccountDashboardProps = {
   customerData: any;
   orders: any;
   customerAccessToken: string;
};

interface InternalMenuItem {
   key: string;
   label: string;
   type: 'internal';
}

interface ExternalMenuItem {
   key: string;
   label: string;
   type: 'external';
   href: string;
}

type MenuItem = InternalMenuItem | ExternalMenuItem;

export default function AccountDashboard({
   customerData,
   orders,
   customerAccessToken
}: AccountDashboardProps) {
   const [activeMenu, setActiveMenu] = useState<string>('welcome');
   const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
   const [message, setMessage] = useState('');

   const handleLogout = async () => {
      try {
         await doLogout(null);
      } catch (error: any) {
         setMessage('Error logging out. Please try again.');
      }
   };

   const menuItems: MenuItem[] = [
      { key: 'welcome', label: 'Welcome', type: 'internal' },
      { key: 'orders', label: 'Orders', type: 'internal' },
      // { key: 'personal', label: 'Personal', type: 'internal' },
      {
         key: 'loyalty',
         label: 'Loyalty Points',
         type: 'external',
         // href: 'https://shopify.com/10242207/account/pages/42026b1f-3325-417d-853a-8da8af55312b'
         href: 'https://www.dearjohndenim.co/pages/rewards'
      }
   ];

   const renderContentFor = (menu: string) => {
      switch (menu) {
         case 'orders':
            return orders ? <AccountOrdersHistory orders={orders} /> : <p>No orders found.</p>;
         // case 'personal':
         //    return (
         //       <AccountPersonalInfo
         //          customerData={customerData}
         //          customerAccessToken={customerAccessToken}
         //       />
         //    );
         case 'welcome':
         default:
            return (
               <div>
                  <h3 className="mb-4 text-2xl font-bold">
                     Welcome, {customerData?.firstName || 'Customer'}!
                  </h3>
                  <p className="text-gray-600">
                     Select an option from the menu to view your orders, manage your account, or
                     update your address.
                  </p>
               </div>
            );
      }
   };

   // A helper to render the loyalty label with the Beta badge.
   const renderLabelWithBeta = (label: string) => (
      <>
         {label}
         <span className="ml-2 inline-block rounded bg-gray-200 px-1 text-xs font-bold text-gray-500">
            Updated
         </span>
      </>
   );

   return (
      <div className="relative mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Mobile Navigation (Accordion) */}
         <aside className="mb-6 md:hidden">
            <div className="mb-4">
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Account / Home
               </h2>
               <p className="mt-1 text-gray-600">
                  Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}
               </p>
            </div>
            <nav>
               <ul>
                  {menuItems.map((menu) => (
                     <li key={menu.key} className="mb-2 border-b border-gray-200">
                        {menu.type === 'internal' ? (
                           <>
                              <button
                                 onClick={() =>
                                    setMobileActiveMenu((prev) =>
                                       prev === menu.key ? null : menu.key
                                    )
                                 }
                                 className="flex w-full items-center justify-between px-4 py-3 text-left text-black"
                              >
                                 <span>
                                    {menu.key === 'loyalty'
                                       ? renderLabelWithBeta(menu.label)
                                       : menu.label}
                                 </span>
                                 <span>
                                    {mobileActiveMenu === menu.key ? (
                                       <svg className="h-6 w-6" viewBox="0 0 24 24">
                                          <line
                                             x1="5"
                                             y1="12"
                                             x2="19"
                                             y2="12"
                                             stroke="currentColor"
                                             strokeWidth=".75"
                                             strokeLinecap="round"
                                          />
                                       </svg>
                                    ) : (
                                       <svg className="h-6 w-6" viewBox="0 0 24 24">
                                          <line
                                             x1="12"
                                             y1="5"
                                             x2="12"
                                             y2="19"
                                             stroke="currentColor"
                                             strokeWidth=".75"
                                             strokeLinecap="round"
                                          />
                                          <line
                                             x1="5"
                                             y1="12"
                                             x2="19"
                                             y2="12"
                                             stroke="currentColor"
                                             strokeWidth=".75"
                                             strokeLinecap="round"
                                          />
                                       </svg>
                                    )}
                                 </span>
                              </button>
                              {mobileActiveMenu === menu.key && (
                                 <div className="px-4 py-3">{renderContentFor(menu.key)}</div>
                              )}
                           </>
                        ) : (
                           <Link href={menu.href} passHref>
                              <p
                                 className="block w-full rounded-md px-4 py-2 text-black transition hover:opacity-80"
                                 rel="noopener noreferrer"
                              >
                                 {menu.key === 'loyalty'
                                    ? renderLabelWithBeta(menu.label)
                                    : menu.label}
                              </p>
                           </Link>
                        )}
                     </li>
                  ))}
                  <li className="mb-2">
                     <Link href="https://dearjohndenimhq.returnscenter.com/" passHref>
                        <p
                           className="block w-full rounded-md px-4 py-2 text-black transition hover:opacity-80"
                           rel="noopener noreferrer"
                        >
                           Start a Return
                        </p>
                     </Link>
                  </li>
                  <li className="mt-6">
                     <button
                        onClick={handleLogout}
                        className="block w-full rounded-md bg-gray-700 px-4 py-3 text-center text-sm text-white transition hover:opacity-80"
                     >
                        Log Out
                     </button>
                     {message && <p className="mt-2 text-red-600">{message}</p>}
                  </li>
               </ul>
            </nav>
         </aside>

         {/* Desktop Sidebar */}
         <aside className="hidden md:block md:w-1/4 md:pr-8">
            <div className="mb-4">
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Account / Home
               </h2>
               <p className="mt-1 text-gray-600">
                  Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}
               </p>
            </div>
            <nav>
               <ul>
                  {menuItems.map((menu) => (
                     <li key={menu.key} className="mb-1">
                        {menu.type === 'internal' ? (
                           <button
                              onClick={() => setActiveMenu(menu.key)}
                              className={clsx(
                                 'flex w-full items-center justify-center px-4 py-3 text-center text-black transition hover:opacity-80',
                                 activeMenu === menu.key ? 'underline opacity-80' : 'opacity-100'
                              )}
                           >
                              <span>
                                 {menu.key === 'loyalty'
                                    ? renderLabelWithBeta(menu.label)
                                    : menu.label}
                              </span>
                           </button>
                        ) : (
                           <Link href={menu.href} passHref>
                              <p
                                 className={clsx(
                                    'w-full rounded-md px-4 py-2 text-black transition hover:opacity-80',
                                    menu.key === 'loyalty' && 'mx-auto text-center'
                                 )}
                                 rel="noopener noreferrer"
                              >
                                 {menu.key === 'loyalty'
                                    ? renderLabelWithBeta(menu.label)
                                    : menu.label}
                              </p>
                           </Link>
                        )}
                     </li>
                  ))}
               </ul>
               <div className="mb-4">
                  <Link href="https://dearjohndenimhq.returnscenter.com/" passHref>
                     <p
                        className="mx-auto flex w-full justify-center px-4 py-2 text-black transition hover:opacity-80"
                        rel="noopener noreferrer"
                     >
                        Start a Return
                     </p>
                  </Link>
               </div>
               <div className="mt-8">
                  <button
                     onClick={handleLogout}
                     className="mx-auto w-full bg-black px-4 py-2 text-white hover:opacity-90"
                  >
                     Log Out
                  </button>
                  {message && <p className="mt-2 text-red-600">{message}</p>}
               </div>
            </nav>
         </aside>

         {/* Main Content */}
         <main className="w-full md:w-3/4 md:border-l md:border-neutral-200 md:pl-8 dark:md:border-neutral-800">
            <div className="hidden md:block">{renderContentFor(activeMenu)}</div>
         </main>
      </div>
   );
}
