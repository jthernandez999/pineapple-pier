'use client';
import clsx from 'clsx';
import { UserIcon } from 'components/auth/user-icon';
import Link from 'next/link';
import { useState } from 'react';

export default function ProfileAuthModal() {
   const [isOpen, setIsOpen] = useState(false);
   // isLogin: true shows Sign In form, false shows Sign Up form.
   const [isLogin, setIsLogin] = useState(true);

   const openModal = () => {
      setIsLogin(true); // default to Sign In
      setIsOpen(true);
   };

   const closeModal = () => setIsOpen(false);

   return (
      <>
         {/* Profile icon trigger */}
         <div
            onClick={(e) => {
               e.preventDefault();
               openModal();
            }}
            className="cursor-pointer"
         >
            <UserIcon />
         </div>

         {/* Modal */}
         {isOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
               onClick={closeModal}
            >
               {/* Modal content (clicking inside does not close the modal) */}
               <div
                  className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
               >
                  {/* Close button */}
                  <button
                     className={clsx('absolute right-2 top-2 text-gray-600 hover:text-gray-800')}
                     onClick={closeModal}
                     aria-label="Close"
                  >
                     ✕
                  </button>

                  {isLogin ? (
                     <>
                        <h2 className="mb-6 text-center text-2xl font-bold">Sign In</h2>
                        <form className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">
                                 Email
                              </label>
                              <input
                                 type="email"
                                 placeholder="Email"
                                 className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                                 required
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">
                                 Password
                              </label>
                              <input
                                 type="password"
                                 placeholder="Password"
                                 className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                                 required
                              />
                           </div>
                           <div className="flex items-center justify-between">
                              <label className="flex items-center text-sm text-gray-700">
                                 <input type="checkbox" className="mr-2" />
                                 Remember Me
                              </label>
                              <Link
                                 href="/auth/forgot-password"
                                 className="text-sm text-blue-500 underline"
                              >
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
                        <p className="mt-4 text-center text-sm text-gray-600">
                           Don't have an account yet?{' '}
                           <button
                              type="button"
                              onClick={() => setIsLogin(false)}
                              className="text-blue-500 underline"
                           >
                              Sign Up
                           </button>
                        </p>
                     </>
                  ) : (
                     <>
                        <h2 className="mb-6 text-center text-2xl font-bold">Sign Up</h2>
                        <form className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">
                                 Email
                              </label>
                              <input
                                 type="email"
                                 placeholder="Email"
                                 className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                                 required
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">
                                 Password
                              </label>
                              <input
                                 type="password"
                                 placeholder="Password"
                                 className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                                 required
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">
                                 Confirm Password
                              </label>
                              <input
                                 type="password"
                                 placeholder="Confirm Password"
                                 className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                                 required
                              />
                           </div>
                           <button
                              type="submit"
                              className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
                           >
                              Sign Up
                           </button>
                        </form>
                        <p className="mt-4 text-center text-sm text-gray-600">
                           Already have an account?{' '}
                           <button
                              type="button"
                              onClick={() => setIsLogin(true)}
                              className="text-blue-500 underline"
                           >
                              Sign In
                           </button>
                        </p>
                     </>
                  )}
               </div>
            </div>
         )}
      </>
   );
}
