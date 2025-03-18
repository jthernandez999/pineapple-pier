import Footer from 'components/layout/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <div className="w-full">
            <div className="mx-8 w-full py-20">{children}</div>
         </div>
         <Footer />
      </>
   );
}
