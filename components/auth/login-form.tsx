'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { buildShopifyAuthUrl } from '../../lib/shopify/customer/auth-utils';

export function LoginShopify() {
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      try {
         // Build the Shopify OAuth URL with PKCE and proper parameters.
         const authUrl = await buildShopifyAuthUrl();
         // Redirect the browser to Shopify's login page.
         window.location.href = authUrl;
      } catch (error) {
         console.error('Error building auth URL:', error);
         setErrorMessage('Failed to initiate login. Please try again.');
         setLoading(false);
      }
   }

   return (
      <form onSubmit={handleSubmit}>
         {errorMessage && <div className="my-5 text-red-600">{errorMessage}</div>}
         <button
            type="submit"
            aria-label="Log in"
            disabled={loading}
            className={clsx(
               'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white',
               {
                  'cursor-not-allowed opacity-60': loading,
                  'hover:opacity-90': !loading
               }
            )}
         >
            {loading ? 'Logging In...' : 'Log In'}
         </button>
      </form>
   );
}

// 'use client';
// import clsx from 'clsx';
// import { useFormState, useFormStatus } from 'react-dom';
// import { doLogin } from './actions';

// function SubmitButton(props: any) {
//    const { pending } = useFormStatus();
//    const buttonClasses =
//       'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
//    //const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

//    return (
//       <>
//          {props?.message && <div className="my-5">{props?.message}</div>}
//          <button
//             onClick={(e: React.FormEvent<HTMLButtonElement>) => {
//                if (pending) e.preventDefault();
//             }}
//             aria-label="Log in"
//             aria-disabled={pending}
//             className={clsx(buttonClasses, {
//                'hover:opacity-90': true,
//                'cursor-not-allowed opacity-60 hover:opacity-60': pending
//             })}
//          >
//             {pending ? (
//                <>
//                   <span>Logging In...</span>
//                </>
//             ) : (
//                <>
//                   <span>Log-In</span>
//                </>
//             )}
//          </button>
//       </>
//    );
// }

// export function LoginShopify() {
//    const [message, formAction] = useFormState(doLogin, null);

//    return (
//       <form action={formAction}>
//          <SubmitButton message={message} />
//          <p aria-live="polite" className="sr-only" role="status">
//             {message}
//          </p>
//       </form>
//    );
// }
