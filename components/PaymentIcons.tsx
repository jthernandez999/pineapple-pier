import Image from 'next/image';
import React from 'react';

export interface paymentIcons {
   name: string;
   icon: string;
}

const paymentIcons = [
   {
      name: 'American Express',
      icon: '/assets/amex.svg'
   },
   {
      name: 'Apple Pay',
      icon: '/assets/applepay.svg'
   },
   {
      name: 'Discover',
      icon: '/assets/discover.svg'
   },
   {
      name: 'Google Pay',
      icon: '/assets/googlepay.svg'
   },

   {
      name: 'MasterCard',
      icon: '/assets/mastercard.svg'
   },

   {
      name: 'PayPal',
      icon: '/assets/paypal.svg'
   },

   {
      name: 'Shopify Pay',
      icon: '/assets/shopifypay.svg'
   },
   {
      name: 'Visa',
      icon: '/assets/visa.svg'
   }
];

const PaymentIcons: React.FC<paymentIcons> = () => {
   return (
      <div className="mx-auto flex w-full max-w-xs flex-row flex-wrap items-center justify-center space-x-4 pb-4 md:max-w-2xl">
         {paymentIcons.map((payment) => (
            <Image
               key={payment.name}
               src={payment.icon}
               alt={payment.name}
               unoptimized
               width={40}
               height={40}
            />
         ))}
      </div>
   );
};

export default PaymentIcons;
