// components/account/LogoutButton.tsx
'use client';

import LoadingDots from 'components/loading-dots';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doLogout } from './actions'; // adjust path as needed

export default function LogoutButton() {
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');
   const router = useRouter();

   const handleLogout = async () => {
      setLoading(true);
      try {
         // This should trigger the server action that clears cookies and logs out
         await doLogout(null);
         // After successful logout, redirect to the homepage
         router.push('/');
      } catch (error: any) {
         setMessage('Error logging out. Please try again.');
      }
      setLoading(false);
   };

   return (
      <>
         <button
            onClick={handleLogout}
            className="block w-full rounded-md bg-gray-700 px-4 py-2 text-center text-sm text-white transition-opacity duration-200 hover:opacity-80"
            disabled={loading}
         >
            {loading ? (
               <>
                  <LoadingDots className="mb-3 bg-white" /> Logging out...
               </>
            ) : (
               'Log Out'
            )}
         </button>
         {message && <p className="mt-2 text-red-600">{message}</p>}
      </>
   );
}
