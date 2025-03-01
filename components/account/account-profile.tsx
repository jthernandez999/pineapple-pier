'use client';
import { useState } from 'react';
import { doLogout } from './actions';
import LogoutButton from './LogoutButton';

export function AccountProfile() {
   const [message, setMessage] = useState('');

   const handleLogout = async () => {
      try {
         // Calling the logout server action.
         await doLogout(null);
      } catch (error: any) {
         setMessage('Error logging out. Please try again.');
      }
   };

   return (
      <div>
         <h3 className="mb-4 text-2xl font-bold">Manage Account</h3>
         <LogoutButton />
         {message && <p className="mt-2 text-red-600">{message}</p>}
      </div>
   );
}
