// components/auth/ProfileAuthModal.tsx
'use client';

import clsx from 'clsx';
import RegisterForm from 'components/auth/RegisterForm';
import { UserIcon } from 'components/auth/user-icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const CustomSignInForm = () => (
   <form action="/api/shopify-login" method="POST" className="space-y-4">
      <div>
         <label className="block text-sm font-medium text-black">Email</label>
         <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="mt-1 block w-full border border-black p-2 focus:border-black focus:ring-black"
         />
      </div>
      <div>
         <label className="block text-sm font-medium text-black">Password</label>
         <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="mt-1 block w-full border border-black p-2 focus:border-black focus:ring-black"
         />
      </div>
      <div className="flex items-center justify-between">
         <label className="flex items-center text-sm text-black">
            <input name="rememberMe" type="checkbox" className="mr-2" />
            Remember Me
         </label>
         <Link href="/auth/forgot-password" className="text-sm text-black underline">
            Forgot Password?
         </Link>
      </div>
      <button
         type="submit"
         className="w-full border border-black bg-black py-2 text-white transition hover:bg-black"
      >
         Sign In
      </button>
   </form>
);

const ShopifySignInForm = () => (
   <form action="/api/shopify-login" method="POST" className="space-y-4">
      <button
         type="submit"
         className="w-full bg-purple-600 py-2 text-white transition hover:bg-purple-500"
      >
         Sign In with Shopify
      </button>
   </form>
);

export default function ProfileAuthModal() {
   const { user, isLoading } = useAuth();
   const router = useRouter();
   const [mode, setMode] = useState<'custom' | 'shopify' | 'signup'>('custom');
   const [isOpen, setIsOpen] = useState(false);

   const openModal = () => {
      setMode('shopify');
      setIsOpen(true);
   };

   const closeModal = () => setIsOpen(false);

   const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      // Wait until loading is finished.
      if (isLoading) return;
      if (user) {
         // User is logged in: redirect to account dashboard.
         router.push('/account');
      } else {
         openModal();
      }
   };

   return (
      <>
         {/* Profile icon trigger */}
         <div onClick={handleIconClick} className="cursor-pointer">
            {user ? (
               <div className="flex items-center gap-2">
                  {/* <UserIcon /> */}
                  <span>Account</span>
               </div>
            ) : (
               <UserIcon />
            )}
         </div>

         {/* Render modal only when not logged in and modal is open */}
         {!user && isOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
               onClick={closeModal}
            >
               <div
                  className="relative w-full max-w-md border border-black bg-white p-8 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={closeModal}
                     className={clsx('absolute right-2 top-2 text-black hover:text-gray-700')}
                     aria-label="Close modal"
                  >
                     ✕
                  </button>
                  <h2 className="mb-6 text-center text-2xl font-bold text-black">
                     {mode === 'custom'
                        ? 'Sign In'
                        : mode === 'shopify'
                          ? 'Sign In with Shopify'
                          : 'Sign Up'}
                  </h2>
                  {mode === 'custom' && <CustomSignInForm />}
                  {mode === 'shopify' && <ShopifySignInForm />}
                  {mode === 'signup' && <RegisterForm />}
                  <div className="mt-6 text-center text-sm text-black">
                     {mode === 'custom' && (
                        <>
                           <p>
                              <button
                                 type="button"
                                 onClick={() => setMode('shopify')}
                                 className="text-black underline"
                              >
                                 Or sign in with Shopify
                              </button>
                           </p>
                           <p className="mt-2">
                              Don't have an account yet?{' '}
                              <button
                                 type="button"
                                 onClick={() => setMode('signup')}
                                 className="text-black underline"
                              >
                                 Sign Up
                              </button>
                           </p>
                        </>
                     )}
                     {mode === 'shopify' && (
                        <p>
                           Want to use your email?{' '}
                           <button
                              type="button"
                              onClick={() => setMode('custom')}
                              className="text-black underline"
                           >
                              Back to Custom Sign In
                           </button>
                        </p>
                     )}
                     {mode === 'signup' && (
                        <p>
                           Already have an account?{' '}
                           <button
                              type="button"
                              onClick={() => setMode('custom')}
                              className="text-black underline"
                           >
                              Sign In
                           </button>
                        </p>
                     )}
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
