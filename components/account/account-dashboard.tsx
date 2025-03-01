'use client';
import { ArrowRightIcon as LogOutIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import Link from 'next/link';
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
   // Desktop menu state remains
   const [activeMenu, setActiveMenu] = useState<string>('welcome');
   // For mobile, we'll use a separate state for the accordion (only one open at a time)
   const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
   const [message, setMessage] = useState('');

   const handleLogout = async () => {
      try {
         await doLogout(null);
      } catch (error: any) {
         setMessage('Error logging out. Please try again.');
      }
   };

   // Render content based on menu key.
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

   return (
      <div className="relative mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Mobile Navigation (Accordion) */}
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
                  {['welcome', 'orders', 'personal', 'address', 'manage'].map((menu) => (
                     <li key={menu} className="mb-2 border-b border-gray-200">
                        <button
                           onClick={() =>
                              setMobileActiveMenu((prev) => (prev === menu ? null : menu))
                           }
                           className="flex w-full items-center justify-between px-4 py-3 text-left text-black"
                        >
                           <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
                           <span>
                              {mobileActiveMenu === menu ? (
                                 // Minus icon when open
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
                                 // Plus icon when closed
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
                        {mobileActiveMenu === menu && (
                           <div className="px-4 py-3">{renderContentFor(menu)}</div>
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
                  {['welcome', 'orders', 'personal', 'address', 'manage'].map((menu) => (
                     <li key={menu} className="mb-1">
                        <button
                           onClick={() => setActiveMenu(menu)}
                           className={clsx(
                              'w-full rounded-md px-4 py-2 text-black transition hover:opacity-80',
                              activeMenu === menu ? 'underline opacity-80' : 'opacity-100'
                           )}
                        >
                           {menu.charAt(0).toUpperCase() + menu.slice(1)}
                        </button>
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
            {/* Desktop renders content based on activeMenu */}
            <div className="hidden md:block">{renderContentFor(activeMenu)}</div>
            {/* On mobile, content is rendered within each accordion section */}
         </main>
      </div>
   );
}
