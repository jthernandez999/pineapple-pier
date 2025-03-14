import { LoginShopify } from 'components/auth/login-form';
import { UserIcon } from 'components/auth/user-icon';
import { cookies } from 'next/headers';

export default async function Login() {
   // Notice the cookie name change here to match your refresh token logic.
   const customerToken = (await cookies()).get('shop_access_token')?.value;
   const refreshToken = (await cookies()).get('shop_refresh_token')?.value;
   let isLoggedIn;

   // Checking for the presence of these cookies isn't bulletproof,
   // but hey, it's good enough until your account page does the real validation.
   if (!customerToken && !refreshToken) {
      isLoggedIn = false;
   } else {
      isLoggedIn = true;
   }
   // console.log('LoggedIn', isLoggedIn);
   return isLoggedIn ? <UserIcon /> : <LoginShopify />;
}
