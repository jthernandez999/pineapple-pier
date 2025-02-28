// hooks/useAuth.ts
import { useEffect, useState } from 'react';

export function useAuth() {
   const [user, setUser] = useState<null | { [key: string]: any }>(null);

   useEffect(() => {
      async function fetchAuthStatus() {
         try {
            const res = await fetch('/api/auth-status');
            const data = await res.json();
            if (data.loggedIn) {
               // Set user data as needed; here we're just using a non-null object.
               setUser(data.user || { loggedIn: true });
            } else {
               setUser(null);
            }
         } catch (error) {
            console.error('Failed to fetch auth status:', error);
            setUser(null);
         }
      }
      fetchAuthStatus();
   }, []);

   return { user };
}
