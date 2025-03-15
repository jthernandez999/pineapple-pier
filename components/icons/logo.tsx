'use client';
import Image, { ImageProps } from 'next/image';

export default function LogoIcon(props: ImageProps) {
   return (
      <Image
         {...props}
         src="/app/favicon.ico"
         width={500}
         height={500}
         alt={props.alt ?? 'Dear John Denim'}
      />
   );
}
