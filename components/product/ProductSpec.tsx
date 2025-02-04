'use client';

import { Product } from 'lib/shopify/types';
import { useProduct } from '../../components/product/product-context'; // Assuming the context file is here

export function ProductSpec({ product }: { product: Product }) {
  const { state } = useProduct(); // Get the selected variant state

  // Find the "Spec" option in product options
  const productSpec = product.options.find((option) => option.name.toLowerCase() === 'spec');

  // Get the currently selected variant
  const selectedVariant = product.variants.find((variant) =>
    Object.entries(state).every(([key, value]) =>
      variant.selectedOptions.some((option) => option.name === key && option.value === value)
    )
  );
  console.log('Selected Variant:', selectedVariant);
  // Ensure we have a valid spec and variant
  if (!productSpec || !selectedVariant) {
    return (
      <div className="mb-6">
        <h2>Hello</h2>
        <p>No specifications available for this variant.</p>
      </div>
    );
  }

  // Get the spec for the selected variant
  const variantIndex = product.variants.findIndex((v) => v.id === selectedVariant.id);
  const selectedSpec = productSpec.values[variantIndex] || '';

  return (
    <div className="mb-6">
      <div>
        <h2 className="text-lg font-semibold">Specifications</h2>

        {selectedSpec ? (
          selectedSpec.split(',').map((entry, entryIndex) => {
            const [key, value] = entry.split(':').map((s) => s.trim());
            return (
              <p key={entryIndex}>
                <strong>{key}:</strong> {value}
              </p>
            );
          })
        ) : (
          <p>No specifications available for this variant.</p>
        )}
      </div>
    </div>
  );
}
