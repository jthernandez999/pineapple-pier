// account/account-address-info.tsx
'use client';

import { useState } from 'react';
import { updateAddress } from './actions';

type AddressInfoProps = {
   addressData: any; // Expected to include an "id" field
   customerAccessToken: string;
};

export function AccountAddressInfo({ addressData, customerAccessToken }: AddressInfoProps) {
   // Ensure that we have an address ID
   const addressId = addressData?.id;
   if (!addressId) {
      return <p>Error: No valid address ID available.</p>;
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
            // Use "phoneNumber" as the key instead of "phone"
            phoneNumber: phone
         };
         // Set defaultAddress to true if you want this address to be default
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
      <div className="space-y-6">
         <h3 className="text-2xl font-bold">Address Information</h3>

         {/* First Name */}
         <div className="space-y-2">
            <label className="font-medium">First Name</label>
            <input
               type="text"
               className="w-full border p-2"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
            />
         </div>

         {/* Last Name */}
         <div className="space-y-2">
            <label className="font-medium">Last Name</label>
            <input
               type="text"
               className="w-full border p-2"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
            />
         </div>

         {/* Address Line 1 */}
         <div className="space-y-2">
            <label className="font-medium">Address 1</label>
            <input
               type="text"
               className="w-full border p-2"
               value={address1}
               onChange={(e) => setAddress1(e.target.value)}
            />
         </div>

         {/* Address Line 2 */}
         <div className="space-y-2">
            <label className="font-medium">Address 2</label>
            <input
               type="text"
               className="w-full border p-2"
               value={address2}
               onChange={(e) => setAddress2(e.target.value)}
            />
         </div>

         {/* City */}
         <div className="space-y-2">
            <label className="font-medium">City</label>
            <input
               type="text"
               className="w-full border p-2"
               value={city}
               onChange={(e) => setCity(e.target.value)}
            />
         </div>

         {/* ZIP */}
         <div className="space-y-2">
            <label className="font-medium">ZIP</label>
            <input
               type="text"
               className="w-full border p-2"
               value={zip}
               onChange={(e) => setZip(e.target.value)}
            />
         </div>

         {/* Mobile Number */}
         <div className="space-y-2">
            <label className="font-medium">Mobile Number</label>
            <input
               type="text"
               className="w-full border p-2"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
            />
         </div>

         <button
            className="rounded bg-blue-500 px-4 py-2 text-white"
            onClick={handleSaveAddress}
            disabled={loading}
         >
            {loading ? 'Saving...' : 'Save Address'}
         </button>

         {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
   );
}
