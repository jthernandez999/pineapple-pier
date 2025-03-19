// components/judgeme/JudgeMePreviewBadge.tsx
'use client';

import { useEffect } from 'react';

interface JudgeMePreviewBadgeProps {
   // External (Shopify) product ID as a number.
   externalId?: number | string;
   // Judge.me internal ID; if not available, pass -1.
   id?: number | string;
   // Optionally, the product handle.
   handle?: string;
}

export default function JudgeMePreviewBadge({ externalId, id, handle }: JudgeMePreviewBadgeProps) {
   useEffect(() => {
      const timeout = setTimeout(() => {
         if (window.jdgm && typeof window.jdgm.init === 'function') {
            console.log('Re-initializing Judge.me widget');
            window.jdgm.init();
         }
      }, 500); // half a second delay to let your product id settle
      return () => clearTimeout(timeout);
   }, [externalId, id, handle]);

   return (
      <div
         className="jdgm-widget jdgm-preview-badge"
         data-external-id={externalId}
         data-id={id ?? -1}
         data-handle={handle}
      ></div>
   );
}
