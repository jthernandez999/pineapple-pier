'use client';

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
   // Set the default active menu to "welcome" so a welcome message is shown by default.
   const [activeMenu, setActiveMenu] = useState<string>('welcome');

   const renderContent = () => {
      switch (activeMenu) {
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

   return (
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Sidebar Menu */}
         <aside className="mb-8 w-full md:mb-0 md:w-1/4 md:pr-8">
            <div className="mb-4 flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                     Account / Home
                  </h2>
                  <p className="mt-1 text-gray-600">
                     Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}
                  </p>
               </div>
               <button
                  onClick={() => (window.location.href = '/logout')}
                  className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white transition-opacity duration-200 hover:opacity-80"
               >
                  Log Out
               </button>
            </div>
            <nav>
               <ul className="flex flex-wrap md:block">
                  {['welcome', 'orders', 'manage', 'personal', 'address'].map((menu) => (
                     <li key={menu} className="w-1/2 md:w-full">
                        <button
                           className={`mb-1 block w-full rounded-md px-4 py-2 text-black transition-opacity duration-200 hover:opacity-80 ${
                              activeMenu === menu ? 'opacity-80' : 'underline opacity-100'
                           }`}
                           onClick={() => setActiveMenu(menu)}
                        >
                           {menu.charAt(0).toUpperCase() + menu.slice(1)}
                        </button>
                     </li>
                  ))}
               </ul>
            </nav>
         </aside>
         {/* Main Content */}
         <main className="w-full md:w-3/4 md:border-l md:border-neutral-200 md:pl-8 dark:md:border-neutral-800">
            {renderContent()}
         </main>
      </div>
   );
}
