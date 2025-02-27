'use client';
import clsx from 'clsx';
import { UserIcon } from 'components/auth/user-icon';
import Link from 'next/link';
import { useState } from 'react';
import { LoginShopify } from '../../components/auth/login-form'; // Your Shopify login component
import RegisterForm from '../../components/auth/RegisterForm';

export default function ProfileAuthModal() {
   // Modes: 'custom' for custom sign in, 'shopify' for Shopify sign in, 'signup' for registration.
   const [mode, setMode] = useState<'custom' | 'shopify' | 'signup'>('custom');
   const [isOpen, setIsOpen] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [rememberMe, setRememberMe] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const openModal = () => {
      setMode('custom'); // default to custom sign in when opening
      setIsOpen(true);
   };

   const closeModal = () => setIsOpen(false);

   // Custom sign in form (email & password)
   const CustomSignInForm = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [rememberMe, setRememberMe] = useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setLoading(true);
         setError(null);
         // Implement your custom sign in logic here.
         try {
            const res = await fetch('/api/shopify-login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email, password, rememberMe })
            });
            if (!res.ok) {
               throw new Error('Login failed');
            }
            const data = await res.json();
            console.log('Custom sign in success:', data);
            // After successful login, you might set cookies, update context, or redirect the user.
         } catch (error) {
            console.error('Custom sign in error:', error);
            setError('Login failed. Please check your credentials and try again.');
         } finally {
            setLoading(false);
         }
      };

      return (
         <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
               <label className="block text-sm font-medium text-gray-700">Email</label>
               <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Password</label>
               <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
               />
            </div>
            <div className="flex items-center justify-between">
               <label className="flex items-center text-sm text-gray-700">
                  <input
                     type="checkbox"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                     className="mr-2"
                  />
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
                  {mode === 'shopify' && <LoginShopify />}
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
