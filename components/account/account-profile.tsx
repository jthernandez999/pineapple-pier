'use client';
import { ArrowRightIcon as LogOutIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { doLogout } from './actions';
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
         <button onClick={handleLogout} className="bg-black px-4 py-2 text-white hover:opacity-90">
            Log Out
         </button>
         {message && <p className="mt-2 text-red-600">{message}</p>}
      </div>
   );
}
