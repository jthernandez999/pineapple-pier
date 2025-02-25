// account/account-address-info.tsx
'use client';

import { useState } from 'react';
import { updateAddress } from './actions';

type AddressInfoProps = {
   addressData: any; // Expected to include an "id" field
   customerAccessToken: string;
};

export function AccountAddressInfo({ addressData, customerAccessToken }: AddressInfoProps) {
   // Ensure that we have a valid address ID
   const addressId = addressData?.id;
   if (!addressId) {
      return <p className="text-center text-red-500">Error: No valid address ID available.</p>;
   }

   // Initialize state from addressData
   const [firstName, setFirstName] = useState(addressData?.firstName || '');
   const [lastName, setLastName] = useState(addressData?.lastName || '');
   const [address1, setAddress1] = useState(addressData?.address1 || '');
   const [address2, setAddress2] = useState(addressData?.address2 || '');
   const [city, setCity] = useState(addressData?.city || '');
   const [zip, setZip] = useState(addressData?.zip || '');
   const [phone, setPhone] = useState(addressData?.phone?.phoneNumber || '');
   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSaveAddress = async () => {
      setLoading(true);
      try {
         const addressInput = {
            firstName,
            lastName,
            address1,
            address2,
            city,
            zip,
            // Use "phoneNumber" as the key per API requirements
            phoneNumber: phone
         };
         // For this example, we're setting the updated address as default.
         const defaultAddress = true;
         await updateAddress(addressInput, addressId, defaultAddress, customerAccessToken);
         setMessage('Address updated successfully.');
      } catch (error: any) {
         setMessage(`Error updating address: ${error.message}`);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
         <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Address Information
         </h3>
         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <div className="flex flex-col">
               <label className="font-medium text-gray-700 dark:text-gray-300">First Name</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
               />
            </div>
            {/* Last Name */}
            <div className="flex flex-col">
               <label className="font-medium text-gray-700 dark:text-gray-300">Last Name</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
               />
            </div>
            {/* Address Line 1 */}
            <div className="flex flex-col md:col-span-2">
               <label className="font-medium text-gray-700 dark:text-gray-300">Address 1</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
               />
            </div>
            {/* Address Line 2 */}
            <div className="flex flex-col md:col-span-2">
               <label className="font-medium text-gray-700 dark:text-gray-300">Address 2</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
               />
            </div>
            {/* City */}
            <div className="flex flex-col">
               <label className="font-medium text-gray-700 dark:text-gray-300">City</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
               />
            </div>
            {/* ZIP */}
            <div className="flex flex-col">
               <label className="font-medium text-gray-700 dark:text-gray-300">ZIP</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
               />
            </div>
            {/* Mobile Number */}
            <div className="flex flex-col md:col-span-2">
               <label className="font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
               <input
                  type="text"
                  className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
               />
            </div>
         </div>
         <button
            className="w-full rounded-md bg-blue-500 py-2 text-white transition-colors duration-200 hover:bg-blue-600"
            onClick={handleSaveAddress}
            disabled={loading}
         >
            {loading ? 'Saving...' : 'Save Address'}
         </button>
         {message && <p className="text-center text-sm text-green-600">{message}</p>}
      </div>
   );
}
