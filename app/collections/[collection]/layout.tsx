// app/collections/[collection]/layout.tsx
import React from 'react';
import Footer from '../../../components/layout/footer';

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <main>{children}</main>
         <Footer />
      </>
   );
}
