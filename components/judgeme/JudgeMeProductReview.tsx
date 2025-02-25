'use client';

// components/judgeme/JudgeMePreviewBadge.tsx
import { useEffect } from 'react';

interface JudgeMePreviewBadgeProps {
   // External (Shopify) product ID as a number.
   externalId?: number;
   // Judge.me internal ID; if not available, pass -1.
   id?: number;
   // Optionally, the product handle.
   handle?: string;
}

export default function JudgeMePreviewBadge({ externalId, id, handle }: JudgeMePreviewBadgeProps) {
   useEffect(() => {
      // If Judge.me provides an initialization method, call it here.
      if (window.jdgm && typeof window.jdgm.init === 'function') {
         window.jdgm.init();
      }
   }, [externalId, id, handle]);

   return (
      <div
         className="jdgm-widget jdgm-preview-badge"
         // Provide the external id for Judge.me to use.
         data-external-id={externalId}
         // Provide the internal id; if not available, pass -1.
         data-id={id !== undefined ? id : -1}
         // Optionally provide the product handle.
         data-handle={handle}
      ></div>
   );
}
