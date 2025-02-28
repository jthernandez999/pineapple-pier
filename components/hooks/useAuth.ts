// hooks/useAuth.ts
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export function useAuth() {
   const [user, setUser] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);

   useEffect(() => {
      try {
         const token = Cookies.get('shop_customer_token');
         console.log('Client: shop_customer_token:', token);

         if (!token) {
            console.log('Client: No token found');
            setIsLoading(false);
            return;
         }

         // Ensure token has a valid format
         if (!token.includes('.')) {
            throw new Error('Invalid token format');
         }

         const parts = token.split('.');
         if (parts.length < 2) {
            throw new Error('Token does not have enough parts');
         }

         // Use the non-null assertion operator since we checked the length
         const payloadBase64 = parts[1]!;
         const payloadJson = atob(payloadBase64);
         console.log('Client: Decoded payload JSON:', payloadJson);
         const payload = JSON.parse(payloadJson);
         console.log('Client: Parsed payload:', payload);

         // Update user state based on decoded payload
         setUser({
            id: payload.sub,
            shopId: payload.shopId
            // add other properties as needed
         });
         setIsLoading(false);
      } catch (err: any) {
         console.error('Client: Error in useAuth:', err);
         setError(err);
         setIsLoading(false);
      }
   }, []);

   return { user, isLoading, error };
}
