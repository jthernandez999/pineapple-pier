'use client';
import { UserIcon as User2Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function UserButton(props: any) {
   const buttonClasses =
      'relative flex w-full items-center justify-center p-0 tracking-wide text-black hover:opacity-90';

   return (
      <Link href="/account" className={buttonClasses} aria-label="My Profile">
         <User2Icon className="h-4 w-4 md:h-5 md:w-5" />
      </Link>
   );
}

export function UserIcon() {
   return <UserButton />;
}

// 'use client';
// import { UserIcon as User2Icon } from '@heroicons/react/24/outline';
// import clsx from 'clsx';

// function UserButton(props: any) {
//    const buttonClasses =
//       'relative flex w-full items-center justify-center p-0 tracking-wide text-black';
//    //const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

//    return (
//       <>
//          <button
//             aria-label="My Profile"
//             className={clsx(buttonClasses, {
//                'hover:opacity-90': true
//             })}
//          >
//             {/*Purposesly a href here and NOT Link component b/c of router caching*/}
//             <a href="/account">
//                <User2Icon className="h-4 w-4 md:h-5 md:w-5" />
//                {/* <span>Profile</span> */}
//             </a>
//          </button>
//       </>
//    );
// }

// export function UserIcon() {
//    return <UserButton />;
// }
