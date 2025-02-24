import { LoginShopify } from 'components/auth/login-form';
import { UserIcon } from 'components/auth/user-icon';
import { cookies } from 'next/headers';

export default async function Login() {
   // Retrieve authentication cookies
   const customerToken = (await cookies()).get('shop_customer_token')?.value;
   const refreshToken = (await cookies()).get('shop_refresh_token')?.value;

   // Simple check: if neither cookie exists, we treat the customer as not logged in.
   const isLoggedIn = Boolean(customerToken || refreshToken);
   console.log('LoggedIn', isLoggedIn);

   return isLoggedIn ? <UserIcon /> : <LoginShopify />;
}

// import { LoginMessage } from 'components/auth/login-message';
// export const runtime = 'edge'; //this needs to be here on thie page. I don't know why

// export default async function LoginPage() {
//    return (
//       <>
//          <div className="mx-auto max-w-screen-2xl px-4">
//             <div className="flex flex-col border border-neutral-200 bg-black p-8 text-white dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
//                <div className="h-full w-full">
//                   <LoginMessage />
//                </div>
//             </div>
//          </div>
//       </>
//    );
// }
