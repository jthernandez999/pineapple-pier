import { useEffect, useState } from 'react';

// Helper to get a cookie value from document.cookie.
function getCookieValue(name: string): string | null {
   if (typeof document === 'undefined') return null;
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
   return null;
}

export const useAuth = () => {
   const [user, setUser] = useState<any>(null);

   useEffect(() => {
      const token = getCookieValue('shop_customer_token');
      if (token) {
         // For demonstration, we return a simple object with the token.
         // Replace with your actual user object once you integrate with your auth system.
         setUser({ token });
      }
   }, []);

   return { user };
};
