'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ProductImageZoomProps {
   lowResSrc: string; // Low resolution image for display
   highResSrc: string; // High resolution image for zoom
   alt: string;
   width: number;
   height: number;
   fill?: boolean;
   sizes: string;
   className?: string;
   priority?: boolean;
   unoptimized?: boolean;
}

export default function ProductImageZoom({
   lowResSrc,
   highResSrc,
   alt,
   width,
   height,
   fill = false,
   sizes,
   className,
   priority = false,
   unoptimized = false
}: ProductImageZoomProps) {
   return (
      <Zoom zoomMargin={0} zoomImg={{ src: highResSrc, alt: alt }}>
         <div className="relative w-full">
            <Image
               src={lowResSrc}
               alt={alt}
               width={width}
               height={height}
               layout="responsive"
               objectFit="cover"
               unoptimized={unoptimized}
               loading="lazy"
               sizes={sizes}
               className={className}
               priority={priority}
            />
         </div>
      </Zoom>
   );
}
