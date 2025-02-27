'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountAddressInfo } from './account-address-info';
import { AccountOrdersHistory } from './account-orders-history';
import { AccountPersonalInfo } from './account-personal-info';
import { AccountProfile } from './account-profile';

type AccountDashboardProps = {
   customerData: any;
   orders: any;
   customerAccessToken: string;
};

export default function AccountDashboard({
   customerData,
   orders,
   customerAccessToken
}: AccountDashboardProps) {
   // The activeMenu state holds the currently open menu.
   // Only one section is open at a time.
   const [activeMenu, setActiveMenu] = useState<string>('welcome');

   // Helper to render content for a given section.
   const renderContentFor = (menu: string) => {
      switch (menu) {
         case 'orders':
            return orders ? <AccountOrdersHistory orders={orders} /> : <p>No orders found.</p>;
         case 'manage':
            return <AccountProfile />;
         case 'personal':
            return (
               <AccountPersonalInfo
                  customerData={customerData}
                  customerAccessToken={customerAccessToken}
               />
            );
         case 'address':
            return (
               <AccountAddressInfo
                  addressData={customerData?.defaultAddress}
                  customerAccessToken={customerAccessToken}
               />
            );
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

   // Define the available menu options.
   const menus = ['welcome', 'orders', 'manage', 'personal', 'address'];

   const router = useRouter();

   // Desktop Sidebar (remains unchanged)
   const DesktopSidebar = () => {
      return (
         <div className="hidden md:block md:w-1/4">
            <div className="mb-4">
               <h3 className="text-xl font-bold text-gray-800">Menu</h3>
               <nav className="mt-4">
                  <ul>
                     {menus.map((menu) => (
                        <li key={menu} className="mb-1">
                           <button
                              onClick={() => setActiveMenu(menu)}
                              className={`w-full rounded-md px-4 py-2 text-left text-base font-medium text-black transition-opacity duration-200 hover:opacity-80 ${
                                 activeMenu === menu ? 'underline opacity-80' : 'opacity-100'
                              }`}
                           >
                              {menu.charAt(0).toUpperCase() + menu.slice(1)}
                           </button>
                        </li>
                     ))}
                  </ul>
               </nav>
               {/* Logout Button */}
               <div className="mt-8">
                  <Link href="/logout">
                     <p className="block w-full bg-gray-700 px-4 py-2 text-center text-sm text-white transition-opacity duration-200 hover:opacity-80">
                        Log Out
                     </p>
                  </Link>
               </div>
            </div>
         </div>
      );
   };

   // Mobile Accordion Navigation at the bottom.
   const MobileAccordion = () => {
      return (
         <div className="block md:hidden">
            <div className="mt-8 border-t border-gray-300">
               {menus.map((menu) => (
                  <div key={menu} className="border-b border-gray-300">
                     <button
                        onClick={() => setActiveMenu((prev) => (prev === menu ? '' : menu))}
                        className="flex w-full items-center justify-between px-4 py-3 text-base font-medium text-black"
                     >
                        <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
                        {activeMenu === menu ? (
                           <MinusIcon className="h-5 w-5" />
                        ) : (
                           <PlusIcon className="h-5 w-5" />
                        )}
                     </button>
                     {activeMenu === menu && (
                        <div className="px-4 py-2">{renderContentFor(menu)}</div>
                     )}
                  </div>
               ))}
               {/* Logout button remains outside accordion content */}
               <div className="border-t border-gray-300">
                  <button
                     onClick={() => router.push('/logout')}
                     className="w-full px-4 py-3 text-base font-medium text-black"
                  >
                     Log Out
                  </button>
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Desktop Sidebar */}
         <DesktopSidebar />

         {/* Main Content - visible on desktop; hidden on mobile */}
         <main className="hidden w-full md:block md:w-3/4 md:border-l md:border-neutral-200 md:pl-8 dark:md:border-neutral-800">
            {renderContentFor(activeMenu)}
         </main>

         {/* Mobile Accordion Navigation */}
         <MobileAccordion />
      </div>
   );
}
