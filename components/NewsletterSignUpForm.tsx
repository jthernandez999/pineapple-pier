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

         // If there's an error from the API, show it.
         if (data.error) {
            setStatus('error');
            setMessage(data.error.message);
            return;
         }
         // If subscriber exists, display the success message.
         if (data.subscriber) {
            setStatus('success');
            setMessage(
               `We have sent an email to ${email}, please click the link included to verify your email address.`
            );
            setEmail('');
            return;
         }
         // Fallback if neither error nor subscriber is returned.
         setStatus('error');
         setMessage('Subscription failed.');
      } catch (error: any) {
         setStatus('error');
         setMessage(error.message || 'Something went wrong');
      }
   };

   return (
      <form
         onSubmit={handleSubmit}
         className="black mx-auto w-full max-w-full items-start bg-white p-6 pb-2 md:max-w-xl md:pl-0 lg:pl-0 lg:pt-0"
      >
         <h2 className="text-md items-start pb-2 font-semibold text-gray-800 md:text-start">
            Join Our Newsletter
         </h2>
         <p className="pb-4 text-start text-sm text-gray-600 md:text-start">
            Subscribe to receive updates and exclusive offers
         </p>
         <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="my-2 w-full border border-gray-300 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
         />
         <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-black py-4 text-sm text-white transition-colors hover:bg-gray-800"
         >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
         </button>
         {message && (
            <p
               className={`text-center text-sm ${
                  status === 'error' ? 'text-red-500' : 'text-green-600'
               }`}
            >
               {message}
            </p>
         )}
      </form>
   );
};

export default NewsletterSignUpForm;
