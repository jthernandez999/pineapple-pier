'use client';

type FabricFacts = {
   headline: string;
   blurb: string;
   bullets: string[];
};

const FABRIC_DATA: Record<string, FabricFacts> = {
   modal: {
      headline: 'PERFORMANCE WITHOUT COMPROMISE',
      blurb: 'Designed for superior performance and maximum comfort—Modal offers a silky hand feel while efficiently wicking moisture to keep you fresh.',
      bullets: [
         '50% more absorbent than cotton',
         'Resistant to shrinkage and fading',
         'Lightweight with the look of silk',
         'Exceptionally soft and smooth'
      ]
   },
   wool: {
      headline: 'PERFORMANCE WITHOUT COMPROMISE',
      blurb: 'Super‑soft, ultra‑fine Merino wool wicks sweat, regulates temperature, and stays funk‑free so you remain comfortable in any climate.',
      bullets: [
         'Moisture‑wicking',
         'Naturally breathable',
         'Temperature regulating',
         'Odor resistant',
         'Buttery‑soft natural fiber',
         'Gynecologist approved'
      ]
   },
   hemp: {
      headline: 'SUSTAINABLY STRONG',
      blurb: 'Hemp delivers unmatched durability with a smaller environmental footprint, offering natural UV protection and breathable comfort.',
      bullets: [
         'Exceptionally durable',
         'Naturally UV protective',
         'Breathable and moisture‑wicking',
         'Biodegradable & eco‑friendly'
      ]
   },
   tencel: {
      headline: 'EARTH‑FRIENDLY LUXURY',
      blurb: 'Tencel Lyocell pairs silky drape with 50% greater moisture absorption than cotton, all produced in a closed‑loop, eco‑responsible process.',
      bullets: [
         'Ultra‑smooth & breathable',
         'Moisture‑wicking & anti‑bacterial',
         'Wrinkle‑resistant',
         '100% biodegradable'
      ]
   }
   // add more fabrics as needed
};

export default function FabricInfo({ tags }: { tags: string[] }) {
   // find the first tag present in FABRIC_DATA (case‑insensitive)
   const matchedKey = tags.find((t) =>
      Object.prototype.hasOwnProperty.call(FABRIC_DATA, t.toLowerCase())
   );

   if (!matchedKey) return null; // nothing to show

   const facts = FABRIC_DATA[matchedKey.toLowerCase()];

   if (!facts) return null; // extra safety

   const { headline, blurb, bullets } = facts;

   return (
      <section className="my-12 flex flex-col items-center bg-white p-8 px-4 text-center">
         <h3 className="mb-3 text-xl font-semibold uppercase tracking-wide">{headline}</h3>

         <p className="mb-6 max-w-xl text-base text-gray-700 dark:text-gray-300">{blurb}</p>

         <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bullets.map((b: string) => (
               <li
                  key={b}
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium"
               >
                  <svg
                     className="h-4 w-4 flex-shrink-0 stroke-current text-emerald-600 dark:text-emerald-400"
                     viewBox="0 0 24 24"
                     fill="none"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {b}
               </li>
            ))}
         </ul>
      </section>
   );
}
