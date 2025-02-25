// account/account-personal-info.tsx
'use client';

import { useState } from 'react';
import {
   updateBirthday,
   updateEmail,
   updateFirstName,
   updateLastName,
   updatePhone
} from './actions';

// Ensure you pass the customerAccessToken from a higher-level component or context.
type PersonalInfoProps = {
   customerData: any;
};

export function AccountPersonalInfo({ customerData }: PersonalInfoProps) {
   // Assume customerData contains the necessary fields; adjust keys as needed.
   const [firstName, setFirstName] = useState(customerData?.firstName || '');
   const [lastName, setLastName] = useState(customerData?.lastName || '');
   const [email, setEmail] = useState(customerData?.emailAddress?.emailAddress || '');
   const [phone, setPhone] = useState(customerData?.phone || '');
   const [birthday, setBirthday] = useState(customerData?.birthday || '');
   const [message, setMessage] = useState('');

   // For demonstration, we assume you have the customerAccessToken stored in customerData
   const customerAccessToken = customerData?.accessToken || '';

   const handleUpdate = async (
      updateFunc: (value: string, token: string) => Promise<any>,
      value: string,
      field: string
   ) => {
      try {
         const res = await updateFunc(value, customerAccessToken);
         setMessage(`${field} updated successfully.`);
      } catch (error: any) {
         setMessage(`Error updating ${field}: ${error.message}`);
      }
   };

   return (
      <div className="space-y-6">
         <h3 className="text-2xl font-bold">Personal Information</h3>

         {/* First Name */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">First Name</span>
               <button
                  className="text-blue-500"
                  onClick={() => handleUpdate(updateFirstName, firstName, 'First Name')}
               >
                  Edit
               </button>
            </div>
            <input
               type="text"
               className="w-full border p-2"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
            />
         </div>

         {/* Last Name */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Last Name</span>
               <button
                  className="text-blue-500"
                  onClick={() => handleUpdate(updateLastName, lastName, 'Last Name')}
               >
                  Edit
               </button>
            </div>
            <input
               type="text"
               className="w-full border p-2"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
            />
         </div>

         {/* Email Address */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Email Address</span>
               <button
                  className="text-blue-500"
                  onClick={() => handleUpdate(updateEmail, email, 'Email Address')}
               >
                  Edit
               </button>
            </div>
            <input
               type="email"
               className="w-full border p-2"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
         </div>

         {/* Mobile Number */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Mobile Number</span>
               <button
                  className="text-blue-500"
                  onClick={() => handleUpdate(updatePhone, phone, 'Mobile Number')}
               >
                  Edit
               </button>
            </div>
            <input
               type="text"
               className="w-full border p-2"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
            />
         </div>

         {/* Birthday */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Birthday (MM/DD)</span>
               <button
                  className="text-blue-500"
                  onClick={() => handleUpdate(updateBirthday, birthday, 'Birthday')}
               >
                  Edit
               </button>
            </div>
            <input
               type="text"
               className="w-full border p-2"
               value={birthday}
               onChange={(e) => setBirthday(e.target.value)}
            />
         </div>

         {message && <p className="text-sm text-green-600">{message}</p>}
         <p className="text-sm text-gray-500">Some edits may require identity verification.</p>
      </div>
   );
}
