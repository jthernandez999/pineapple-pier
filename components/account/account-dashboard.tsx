'use client';
import { ArrowRightIcon as LogOutIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AccountAddressInfo } from './account-address-info';
import { AccountOrdersHistory } from './account-orders-history';
import { AccountPersonalInfo } from './account-personal-info';
import { AccountProfile } from './account-profile';
import { doLogout } from './actions';

type AccountDashboardProps = {
   customerData: any;
   orders: any;
   customerAccessToken: string;
};

function SubmitButton(props: any) {
   const { pending } = useFormStatus();
   const buttonClasses =
      'relative flex w-full items-center justify-center p-4 bg-black tracking-wide text-white';
   return (
      <>
         <button
            onClick={(e: React.FormEvent<HTMLButtonElement>) => {
               if (pending) e.preventDefault();
            }}
            aria-label="Log Out"
            aria-disabled={pending}
            className={clsx(buttonClasses, {
               'hover:opacity-90': true,
               'cursor-not-allowed opacity-60 hover:opacity-60': pending
            })}
         >
            <div className="absolute left-0 ml-4">
               {pending ? (
                  <LoadingDots className="mb-3 bg-white" />
               ) : (
                  <LogOutIcon className="h-5" />
               )}
            </div>
            {pending ? 'Logging out...' : 'Log Out'}
         </button>
         {props?.message && <div className="my-5">{props?.message}</div>}
      </>
   );
}
export default function AccountDashboard({
   customerData,
   orders,
   customerAccessToken
}: AccountDashboardProps) {
   // Set the default active menu to "welcome" so a welcome message is shown by default.
   const [activeMenu, setActiveMenu] = useState<string>('welcome');
   // Control sidebar visibility on mobile.
   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
   const [message, setMessage] = useState('');

   const handleLogout = async () => {
      try {
         // Calling the logout server action.
         await doLogout(null);
      } catch (error: any) {
         setMessage('Error logging out. Please try again.');
      }
   };
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
      <div className="relative mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Mobile Header with Hamburger */}
         <div className="mb-4 flex items-center justify-between md:hidden">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Account / Home</h2>
            <button
               onClick={() => setIsSidebarOpen(true)}
               className="rounded-md bg-black px-3 py-1 text-white transition-opacity duration-200 hover:opacity-80"
               aria-label="Open Menu"
            >
               {/* Simple hamburger icon */}
               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M4 8h16M4 16h16"
                  />
               </svg>
            </button>
         </div>

         {/* Sidebar Menu */}
         <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white p-4 transition-transform dark:bg-gray-800 md:relative md:w-1/4 md:translate-x-0 md:pr-8 ${
               isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
         >
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                     Account / Home
                  </h2>
                  <p className="mt-1 text-gray-600">
                     Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}
                  </p>
               </div>
               <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-md text-sm text-black transition-opacity duration-200 hover:opacity-80 md:hidden"
                  aria-label="Close Menu"
               >
                  &times;
               </button>
            </div>
            <nav className="mt-4">
               <ul>
                  {['welcome', 'orders', 'manage', 'personal', 'address'].map((menu) => (
                     <li key={menu} className="mb-1">
                        <button
                           onClick={() => {
                              setActiveMenu(menu);
                              setIsSidebarOpen(false);
                           }}
                           className={`w-full rounded-md px-4 py-2 text-black transition-opacity duration-200 hover:opacity-80 ${
                              activeMenu === menu ? 'underline opacity-80' : 'opacity-100'
                           }`}
                        >
                           {menu.charAt(0).toUpperCase() + menu.slice(1)}
                        </button>
                     </li>
                  ))}
               </ul>
            </nav>
            {/* Log Out Button */}
            <div className="mt-8">
               <div>
                  <h3 className="mb-4 text-2xl font-bold">Manage Account</h3>
                  <button
                     onClick={handleLogout}
                     className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
                  >
                     Log Out
                  </button>
                  {message && <p className="mt-2 text-red-600">{message}</p>}
               </div>
            </div>
         </aside>

         {/* Mobile Overlay */}
         {isSidebarOpen && (
            <div
               className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
               onClick={() => setIsSidebarOpen(false)}
            ></div>
         )}

         {/* Main Content */}
         <main className="w-full md:w-3/4 md:border-l md:border-neutral-200 md:pl-8 dark:md:border-neutral-800">
            {renderContent()}
         </main>
      </div>
   );
}
