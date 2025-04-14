// components/judgeme/JudgeMePreviewBadge.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function useJudgeMeScript() {
   const pathname = usePathname();
   useEffect(() => {
      // Check if Judge.me script is loaded.
      if (!window.jdgm || typeof window.jdgm.init !== 'function') {
         const script = document.createElement('script');
         script.src = 'https://cdn.judge.me/widget_preloader.js';
         script.async = true;
         script.onload = () => {
            // Optionally, call the init method once the script is loaded.
            window.jdgm?.init();
         };
         document.body.appendChild(script);
      } else {
         // If script is already loaded, reinitialize the widget.
         window.jdgm.init();
      }
   }, [pathname]);
}

export default useJudgeMeScript;
