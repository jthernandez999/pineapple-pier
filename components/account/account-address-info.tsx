// account/account-address-info.tsx
'use client';

import { useState } from 'react';
import { updateAddress } from './actions';

type AddressInfoProps = {
   addressData: any; // Expected to include an "id" field
   customerAccessToken: string;
};

export function AccountAddressInfo({ addressData, customerAccessToken }: AddressInfoProps) {
   // Ensure we have a valid address ID
   const addressId = addressData?.id;
   if (!addressId) {
      return <p className="text-center text-red-500">Error: No valid address ID available.</p>;
   }

   // Read-only display values from addressData
   const displayFirstName = addressData?.firstName || '';
   const displayLastName = addressData?.lastName || '';
   const displayAddress1 = addressData?.address1 || '';
   const displayAddress2 = addressData?.address2 || '';
   const displayCity = addressData?.city || '';
   const displayZip = addressData?.zip || '';
   const displayPhone = addressData?.phone?.phoneNumber || '';

   // Editable state fields (initialized with current values)
   const [firstName, setFirstName] = useState(displayFirstName);
   const [lastName, setLastName] = useState(displayLastName);
   const [address1, setAddress1] = useState(displayAddress1);
   const [address2, setAddress2] = useState(displayAddress2);
   const [city, setCity] = useState(displayCity);
   const [zip, setZip] = useState(displayZip);
   const [phone, setPhone] = useState(displayPhone);

   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const [editing, setEditing] = useState(false);

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
         const defaultAddress = true;
         await updateAddress(addressInput, addressId, defaultAddress, customerAccessToken);
         setMessage('Address updated successfully.');
         setEditing(false);
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

         {!editing ? (
            // Display Mode
            <div className="space-y-4">
               <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Name</p>
                  <p>
                     {displayFirstName} {displayLastName}
                  </p>
               </div>
               <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Address</p>
                  <p>{displayAddress1}</p>
                  {displayAddress2 && <p>{displayAddress2}</p>}
               </div>
               <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">City / ZIP</p>
                  <p>
                     {displayCity}, {displayZip}
                  </p>
               </div>
               <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Mobile Number</p>
                  <p>{displayPhone}</p>
               </div>
               <button
                  className="w-full rounded-md bg-blue-500 py-2 text-white transition-colors duration-200 hover:bg-blue-600"
                  onClick={() => {
                     setEditing(true);
                     setMessage('');
                  }}
               >
                  Edit Address
               </button>
            </div>
         ) : (
            // Edit Mode
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* First Name */}
                  <div className="flex flex-col">
                     <label className="font-medium text-gray-700 dark:text-gray-300">
                        First Name
                     </label>
                     <input
                        type="text"
                        className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                     />
                  </div>
                  {/* Last Name */}
                  <div className="flex flex-col">
                     <label className="font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                     </label>
                     <input
                        type="text"
                        className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                     />
                  </div>
                  {/* Address Line 1 */}
                  <div className="flex flex-col md:col-span-2">
                     <label className="font-medium text-gray-700 dark:text-gray-300">
                        Address 1
                     </label>
                     <input
                        type="text"
                        className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                     />
                  </div>
                  {/* Address Line 2 */}
                  <div className="flex flex-col md:col-span-2">
                     <label className="font-medium text-gray-700 dark:text-gray-300">
                        Address 2
                     </label>
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
                     <label className="font-medium text-gray-700 dark:text-gray-300">
                        Mobile Number
                     </label>
                     <input
                        type="text"
                        className="mt-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                     />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button
                     className="hover:bg-black-opacity-80 w-full rounded-md bg-black py-2 text-white transition-colors duration-200"
                     onClick={handleSaveAddress}
                     disabled={loading}
                  >
                     {loading ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                     className="w-full rounded-md border border-gray-300 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
                     onClick={() => {
                        setEditing(false);
                        setMessage('');
                        // Optionally, reset fields to original display values
                        setFirstName(displayFirstName);
                        setLastName(displayLastName);
                        setAddress1(displayAddress1);
                        setAddress2(displayAddress2);
                        setCity(displayCity);
                        setZip(displayZip);
                        setPhone(displayPhone);
                     }}
                     disabled={loading}
                  >
                     Cancel
                  </button>
               </div>
               {message && <p className="text-center text-sm text-green-600">{message}</p>}
            </div>
         )}
      </div>
   );
}
