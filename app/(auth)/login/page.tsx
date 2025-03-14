import { LoginMessage } from 'components/auth/login-message';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function LoginPage() {
   const cookieStore = await cookies();
   const customerToken = cookieStore.get('shop_customer_token')?.value;
   const refreshToken = cookieStore.get('shop_refresh_token')?.value;
   const isLoggedIn = Boolean(customerToken || refreshToken);

   // console.log('LoggedIn:', isLoggedIn);

   // Optionally, if the user is already logged in, redirect them.
   if (isLoggedIn) {
      // Redirect to account page or display the profile icon, as needed.
      redirect('/account');
   }

   // Otherwise, show the login message.
   return (
      <div className="mx-auto max-w-screen-2xl px-4">
         <div className="flex flex-col border border-neutral-200 bg-black p-8 text-white dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
            <div className="h-full w-full">
               <LoginMessage />
            </div>
         </div>
      </div>
   );
}
