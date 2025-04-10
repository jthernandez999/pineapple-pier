export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <div className="w-full">
            <div className="mx-auto w-full px-4 py-20 md:mx-8">{children}</div>
         </div>
         {/* <Footer /> */}
      </>
   );
}
