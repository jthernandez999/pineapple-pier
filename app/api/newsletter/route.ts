// app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import invariant from 'tiny-invariant';

/** Subscriber type used for our newsletter. */
type Subscriber = {
   id: string;
   email: string;
   emailMarketingConsent: {
      consentUpdatedAt: string;
      marketingOptInLevel: string;
      marketingState: string;
   };
};

type CustomerMutationSuccess = {
   customer: Subscriber;
   error: null;
};

type CustomerMutationError = {
   customer: null;
   error: { field: string | null; message: string };
};

type CustomerMutation = CustomerMutationSuccess | CustomerMutationError;

/** GraphQL fragment for customer fields.
 * For the Storefront API, we inline the fields directly in the mutation.
 */
const CUSTOMER_FRAGMENT = `
fragment CustomerFragment on Customer {
  id
  email
}
`;

/**
 * Helper: Performs a Shopify Storefront GraphQL API call.
 */
async function shopifyStorefrontFetch(query: string, variables: Record<string, any>): Promise<any> {
   const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT;
   const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
   if (!endpoint || !accessToken) {
      throw new Error('Required environment variables are not defined');
   }
   // If endpoint already starts with http, use it; otherwise, prepend https://
   const url = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
   console.log('Using storefront endpoint:', url);

   const response = await fetch(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Storefront-Access-Token': accessToken
      },
      body: JSON.stringify({ query, variables })
   });
   return response.json();
}

/**
 * Searches for a customer by email.
 * Note: The Storefront API does not allow querying customers by email.
 * So we simply return null.
 */
async function getCustomerConsent({
   email
}: {
   email: string;
}): Promise<{ customer: Subscriber | null; error: null }> {
   return { customer: null, error: null };
}

/**
 * Updates a customer's email marketing consent.
 * Note: This is not supported via the Storefront API.
 */
async function updateCustomerMarketingConsent({
   customerId
}: {
   customerId: string;
}): Promise<CustomerMutation> {
   return {
      error: {
         field: null,
         message: 'Updating customer marketing consent is not supported via the Storefront API.'
      },
      customer: null
   };
}

/**
 * Creates a new subscriber using the Storefront API's customerCreate mutation.
 * Note: The mutation requires both an email and a password.
 */
async function createSubscriber({ email }: { email: string }): Promise<CustomerMutation> {
   const query = `#graphql
mutation CustomerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}
`;
   // Generate a pseudo-random password for newsletter signup.
   const password = 'newsletter-' + Date.now().toString();
   const input = {
      email,
      password
   };
   const variables = { input };
   const result = await shopifyStorefrontFetch(query, variables);
   console.log('Customer Create Result:', result);
   if (!result.data || !result.data.customerCreate) {
      return {
         error: { field: null, message: 'Customer creation failed: No data returned.' },
         customer: null
      };
   }
   if (
      result.data.customerCreate.customerUserErrors &&
      result.data.customerCreate.customerUserErrors.length > 0
   ) {
      const [{ field, message }] = result.data.customerCreate.customerUserErrors;
      return { error: { field, message }, customer: null };
   }
   if (result.data.customerCreate.customer) {
      // Construct a Subscriber object.
      const customer = result.data.customerCreate.customer;
      const subscriber: Subscriber = {
         id: customer.id,
         email: customer.email,
         emailMarketingConsent: {
            consentUpdatedAt: new Date().toISOString(),
            marketingOptInLevel: 'SINGLE_OPT_IN',
            marketingState: 'SUBSCRIBED'
         }
      };
      return { customer: subscriber, error: null };
   }
   return { error: { field: null, message: 'Customer creation failed.' }, customer: null };
}

/**
 * Returns a success response.
 */
function returnSuccess({ subscriber }: { subscriber: Subscriber | null }) {
   return NextResponse.json({ subscriber: subscriber!, error: null });
}

/**
 * Returns an error response.
 */
function returnError({ error }: { error: { message: string } }) {
   console.error(error.message);
   return NextResponse.json({ subscriber: null, error });
}

/**
 * Main POST handler: Processes newsletter sign-up.
 */
export async function POST(request: Request) {
   try {
      // Parse the JSON body (assuming the newsletter form sends JSON).
      const { email } = await request.json();
      invariant(email, 'Email is required');

      // Step 1: Check if customer already exists (Storefront API does not support this, so we assume null).
      const existing = await getCustomerConsent({ email });
      const alreadySubscribed = !!existing.customer;

      if (alreadySubscribed) {
         return returnSuccess({ subscriber: existing.customer });
      }

      // Step 2: Since we can't update marketing consent via the Storefront API, always create a new customer.
      const customerMutation = await createSubscriber({ email });
      if (customerMutation.error) {
         return returnError({ error: customerMutation.error });
      }
      return returnSuccess({ subscriber: customerMutation.customer! });
   } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      return NextResponse.json(
         { subscriber: null, error: { message: error.message } },
         { status: 500 }
      );
   }
}

/**
 * Redirect GET requests to the homepage.
 */
export function GET(request: Request) {
   return NextResponse.redirect(new URL('/', request.url));
}
