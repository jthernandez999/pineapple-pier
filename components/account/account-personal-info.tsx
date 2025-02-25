// account/account-personal-info.tsx
'use client';

import { useState } from 'react';
import { updateFirstName, updateLastName } from './actions';

type PersonalInfoProps = {
   customerData: any;
   customerAccessToken: string;
};

export function AccountPersonalInfo({ customerData, customerAccessToken }: PersonalInfoProps) {
   // Initialize state from customerData
   const [firstName, setFirstName] = useState(customerData?.firstName || '');
   const [lastName, setLastName] = useState(customerData?.lastName || '');
   const email = customerData?.emailAddress?.emailAddress || 'N/A';
   const phone = customerData?.phoneNumber?.phoneNumber || 'N/A';

   const [message, setMessage] = useState('');
   const [loadingField, setLoadingField] = useState<string | null>(null);

   // Editing state for fields that can be updated
   const [editingFirstName, setEditingFirstName] = useState(false);
   const [editingLastName, setEditingLastName] = useState(false);

   // Handler to save changes
   const handleSave = async (
      updateFunc: (value: string, token: string) => Promise<any>,
      value: string,
      field: string,
      setEditing: (flag: boolean) => void
   ) => {
      setLoadingField(field);
      try {
         await updateFunc(value, customerAccessToken);
         setMessage(`${field} updated successfully.`);
         setEditing(false);
      } catch (error: any) {
         setMessage(`Error updating ${field}: ${error.message}`);
      } finally {
         setLoadingField(null);
      }
   };

   return (
      <div className="space-y-6">
         <h3 className="text-2xl font-bold">Personal Information</h3>

         {/* First Name */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">First Name</span>
               {editingFirstName ? (
                  <button
                     className="text-blue-500"
                     onClick={() =>
                        handleSave(updateFirstName, firstName, 'First Name', setEditingFirstName)
                     }
                     disabled={loadingField === 'First Name'}
                  >
                     {loadingField === 'First Name' ? 'Saving...' : 'Save'}
                  </button>
               ) : (
                  <button className="text-blue-500" onClick={() => setEditingFirstName(true)}>
                     Edit
                  </button>
               )}
            </div>
            {editingFirstName ? (
               <input
                  type="text"
                  className="w-full border p-2"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
               />
            ) : (
               <p>{firstName || 'N/A'}</p>
            )}
         </div>

         {/* Last Name */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Last Name</span>
               {editingLastName ? (
                  <button
                     className="text-blue-500"
                     onClick={() =>
                        handleSave(updateLastName, lastName, 'Last Name', setEditingLastName)
                     }
                     disabled={loadingField === 'Last Name'}
                  >
                     {loadingField === 'Last Name' ? 'Saving...' : 'Save'}
                  </button>
               ) : (
                  <button className="text-blue-500" onClick={() => setEditingLastName(true)}>
                     Edit
                  </button>
               )}
            </div>
            {editingLastName ? (
               <input
                  type="text"
                  className="w-full border p-2"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
               />
            ) : (
               <p>{lastName || 'N/A'}</p>
            )}
         </div>

         {/* Email Address - Read-only */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Email Address</span>
               <span className="text-sm text-gray-500">Read-only</span>
            </div>
            <p>{email}</p>
         </div>

         {/* Phone Number - Read-only */}
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="font-medium">Phone Number</span>
               <span className="text-sm text-gray-500">Read-only</span>
            </div>
            <p>{phone}</p>
         </div>

         {message && <p className="text-sm text-green-600">{message}</p>}
         <p className="text-sm text-gray-500">Some edits may require identity verification.</p>
      </div>
   );
}
