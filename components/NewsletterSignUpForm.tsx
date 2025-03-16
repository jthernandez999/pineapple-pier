// components/NewsletterSignUpForm.tsx
'use client';

import { FormEvent, useState } from 'react';

const NewsletterSignUpForm: React.FC = () => {
   const [email, setEmail] = useState<string>('');
   const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
   const [message, setMessage] = useState<string>('');

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus('loading');
      setMessage('');

      try {
         const res = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
         });
         const data = await res.json();
         if (!res.ok || !data.success) {
            throw new Error(data.error || 'Subscription failed');
         }
         setStatus('success');
         setMessage('Thank you for subscribing!');
         setEmail('');
      } catch (error: any) {
         setStatus('error');
         setMessage(error.message || 'Something went wrong');
      }
   };

   return (
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 bg-white p-6 shadow-md">
         <h2 className="text-center text-2xl font-semibold text-gray-800">Join Our Newsletter</h2>
         <p className="text-center text-gray-600">
            Subscribe to receive updates and exclusive offers
         </p>
         <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
         />
         <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-black py-3 text-white transition-colors hover:bg-gray-800"
         >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
         </button>
         {message && (
            <p
               className={`text-center text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}
            >
               {message}
            </p>
         )}
      </form>
   );
};

export default NewsletterSignUpForm;
