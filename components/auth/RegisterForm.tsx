'use client';
import { useState } from 'react';

export default function RegisterForm() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         setError('Passwords do not match');
         return;
      }
      setError(null);
      setLoading(true);
      try {
         // Replace with your actual registration endpoint and logic
         const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
         });
         if (!res.ok) {
            const data = await res.json();
            setError(data.error || 'Registration failed');
         } else {
            // Registration successful – handle accordingly (e.g., redirect, show success message, etc.)
            console.log('Registered successfully!');
         }
      } catch (err) {
         setError('An unexpected error occurred');
      }
      setLoading(false);
   };

   return (
      <form className="space-y-4" onSubmit={handleRegister}>
         {error && <div className="text-sm text-red-500">{error}</div>}
         <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
               type="password"
               placeholder="Confirm Password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               required
               className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
         </div>
         <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
         >
            {loading ? 'Signing up...' : 'Sign Up'}
         </button>
      </form>
   );
}
