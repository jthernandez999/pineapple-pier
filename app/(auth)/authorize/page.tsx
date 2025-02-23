import { cookies } from 'next/headers';
export const runtime = 'edge';

export default async function AuthorizationPage() {
   const cookieStore = cookies();
   console.log('All cookies:', (await cookieStore).getAll());
   const accessCookie = (await cookieStore).get('shop_access');
   if (!accessCookie || accessCookie.value !== 'allowed') {
      console.error('ERROR: No access cookie or access not allowed');
      throw new Error('No access allowed');
   }
   return (
      <div className="mx-auto max-w-screen-2xl px-4">
         <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
            <div className="h-full w-full">Welcome to your account!</div>
         </div>
      </div>
   );
}
// ..
