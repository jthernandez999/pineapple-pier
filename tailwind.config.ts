import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
const flowbite = require('flowbite-react/tailwind');

const config: Config = {
   content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', flowbite.content()],

   theme: {
      extend: {
         fontFamily: {
            poppins: ['var(--font-poppins)'],
            sans: ['var(--font-geist-sans)'],
            serif: ['var(--font-geist-serif)'],
            mono: ['var(--font-geist-mono)'],
            helvetica: ['var(--font-helvetica)']
         },
         keyframes: {
            fadeIn: {
               from: { opacity: '0' },
               to: { opacity: '1' }
            },
            marquee: {
               '0%': { transform: 'translateX(0%)' },
               '100%': { transform: 'translateX(-100%)' }
            },
            blink: {
               '0%': { opacity: '0.2' },
               '20%': { opacity: '1' },
               '100%': { opacity: '0.2' }
            }
         },
         animation: {
            fadeIn: 'fadeIn .3s ease-in-out',
            carousel: 'marquee 60s linear infinite',
            blink: 'blink 1.4s both infinite'
         },
         ransitionTimingFunction: {
            custom: 'cubic-bezier(0.5, 0, 0, 1)'
         },
         transitionDuration: {
            '1200': '1200ms'
         }
      }
   },
   future: {
      hoverOnlyWhenSupported: true
   },
   plugins: [
      require('@tailwindcss/container-queries'),
      require('@tailwindcss/typography'),
      plugin(({ matchUtilities, theme }) => {
         matchUtilities(
            {
               'animation-delay': (value) => {
                  return {
                     'animation-delay': value
                  };
               }
            },
            {
               values: theme('transitionDelay')
            }
         );
      }),
      flowbite.plugin()
   ]
};

export default config;
