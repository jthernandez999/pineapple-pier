// ProductImageZoomNoSSR.tsx
import dynamic from 'next/dynamic';
export default dynamic(() => import('./ProductImageZoom'), {
   ssr: false
});
