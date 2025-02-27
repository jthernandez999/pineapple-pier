'use client';
import clsx from 'clsx';
import RegisterForm from 'components/auth/RegisterForm';
import { UserIcon } from 'components/auth/user-icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Dummy hook for authentication status. Replace with your real auth hook.
const useAuth = () => {
   // For demonstration, change this to a user object to simulate a logged-in user.
   const [user] = useState(null);
   return { user };
};

//
// Custom sign in form using a standard HTML form submission.
//
const CustomSignInForm = () => {
   return (
      <form action="/api/shopify-login" method="POST" className="space-y-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
               name="email"
               type="email"
               placeholder="Email"
               required
               className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
               name="password"
               type="password"
               placeholder="Password"
               required
               className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
         </div>
         <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
               <input name="rememberMe" type="checkbox" className="mr-2" />
               Remember Me
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-500 underline">
               Forgot Password?
            </Link>
         </div>
         <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
         >
            Sign In
         </button>
      </form>
   );
};

//
// Shopify sign in form.
//
const ShopifySignInForm = () => {
   return (
      <form action="/api/shopify-login" method="POST" className="space-y-4">
         <button
            type="submit"
            className="w-full rounded-md bg-purple-600 py-2 text-white hover:bg-purple-700"
         >
            Sign In with Shopify
         </button>
      </form>
   );
};

export default function ProfileAuthModal() {
   const { user } = useAuth();
   const router = useRouter();
   const [mode, setMode] = useState<'custom' | 'shopify' | 'signup'>('custom');
   const [isOpen, setIsOpen] = useState(false);

   const openModal = () => {
      setMode('custom'); // default to custom sign in when opening
      setIsOpen(true);
   };

   const closeModal = () => setIsOpen(false);

   const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (user) {
         // If already logged in, redirect to the account page.
         router.push('/account');
      } else {
         // Otherwise, open the login modal.
         openModal();
      }
   };

   return (
      <>
         {/* Profile icon trigger */}
         <div onClick={handleIconClick} className="cursor-pointer">
            <UserIcon />
         </div>

         {/* Modal overlay */}
         {isOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
               onClick={closeModal}
            >
               {/* Modal content */}
               <div
                  className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
               >
                  {/* Close button */}
                  <button
                     onClick={closeModal}
                     className={clsx('absolute right-2 top-2 text-gray-600 hover:text-gray-800')}
                     aria-label="Close modal"
                  >
                     ✕
                  </button>

                  {/* Header */}
                  <h2 className="mb-6 text-center text-2xl font-bold">
                     {mode === 'custom'
                        ? 'Sign In'
                        : mode === 'shopify'
                          ? 'Sign In with Shopify'
                          : 'Sign Up'}
                  </h2>

                  {/* Render form based on mode */}
                  {mode === 'custom' && <CustomSignInForm />}
                  {mode === 'shopify' && <ShopifySignInForm />}
                  {mode === 'signup' && <RegisterForm />}

                  {/* Footer with toggles */}
                  <div className="mt-6 text-center text-sm text-gray-600">
                     {mode === 'custom' && (
                        <>
                           <p>
                              <button
                                 type="button"
                                 onClick={() => setMode('shopify')}
                                 className="text-blue-500 underline"
                              >
                                 Or sign in with Shopify
                              </button>
                           </p>
                           <p className="mt-2">
                              Don't have an account yet?{' '}
                              <button
                                 type="button"
                                 onClick={() => setMode('signup')}
                                 className="text-blue-500 underline"
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
                              className="text-blue-500 underline"
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
                              className="text-blue-500 underline"
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
