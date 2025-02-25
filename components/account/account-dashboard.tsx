// components/account/account-dashboard.tsx
'use client';

import { useState } from 'react';
import { AccountOrdersHistory } from './account-orders-history';
import { AccountProfile } from './account-profile';

type AccountDashboardProps = {
   customerData: any;
   orders: any;
};

type MenuItem = {
   id: string;
   label: string;
};

const menuItems: MenuItem[] = [
   { id: 'purchase', label: 'Purchase History' },
   { id: 'manage', label: 'Manage Account' },
   { id: 'personal', label: 'Personal Info' },
   { id: 'cards', label: 'Saved Cards' },
   { id: 'shipping', label: 'Shipping Addresses' },
   { id: 'password', label: 'Change Password' },
   { id: 'security', label: 'Account Security' },
   { id: 'communication', label: 'Communication Preferences' },
   { id: 'customer', label: 'Customer Service' }
];

export default function AccountDashboard({ customerData, orders }: AccountDashboardProps) {
   // Default view is Purchase History.
   const [activeMenu, setActiveMenu] = useState<string>('purchase');

   const renderContent = () => {
      switch (activeMenu) {
         case 'purchase':
            return orders ? <AccountOrdersHistory orders={orders} /> : <p>No orders found.</p>;
         case 'manage':
            return <AccountProfile />;
         default:
            return (
               <div>
                  <p>Content for "{activeMenu}" coming soon.</p>
               </div>
            );
      }
   };

   return (
      <div className="mx-auto flex max-w-screen-2xl px-4 py-8">
         {/* Sidebar Menu */}
         <aside className="w-1/4 pr-8">
            <div className="mb-8">
               <h2 className="text-xl font-bold">Account / Home</h2>
               <p className="mt-2">Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}</p>
            </div>
            <nav>
               <ul>
                  {menuItems.map((item) => (
                     <li key={item.id}>
                        <button
                           className={`mb-1 block w-full rounded-md px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              activeMenu === item.id ? 'bg-gray-300 dark:bg-gray-600' : ''
                           }`}
                           onClick={() => setActiveMenu(item.id)}
                        >
                           {item.label}
                        </button>
                     </li>
                  ))}
               </ul>
            </nav>
         </aside>

         {/* Main Content */}
         <main className="w-3/4 border-l border-neutral-200 pl-8 dark:border-neutral-800">
            {renderContent()}
         </main>
      </div>
   );
}
