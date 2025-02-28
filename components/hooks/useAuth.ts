// hooks/useAuth.ts
import useSWR from 'swr';

// Define a fetcher that retrieves the auth status from your API route.
const fetcher = async (url: string) => {
   const res = await fetch(url, { cache: 'no-store' });
   if (!res.ok) throw new Error('Failed to fetch auth status');
   return res.json();
};

export function useAuth() {
   const { data, error } = useSWR('/api/auth-status', fetcher, {
      revalidateOnFocus: true,
      refreshInterval: 10000 // adjust as needed
   });

   return {
      user: data?.loggedIn ? data.user : null,
      isLoading: !data && !error,
      error
   };
}
