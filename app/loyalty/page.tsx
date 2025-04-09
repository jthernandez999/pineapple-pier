// app/loyalty/page.tsx

export default function LoyaltyPage() {
   return (
      <main className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
         {/* Ensure the token is available */}

         <div className="mx-auto w-full max-w-6xl py-10">
            <h1 className="mb-5 text-2xl font-semibold">Rewards Program</h1>
            <div data-lion-integrated-page></div>
         </div>
      </main>
   );
}
