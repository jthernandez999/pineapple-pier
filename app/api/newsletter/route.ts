// app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import invariant from 'tiny-invariant';

// Define a Subscriber type.
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

// GraphQL fragment for customer fields.
const CUSTOMER_FRAGMENT = `#graphql
  fragment CustomerFragment on Customer {
    id
    email
    emailMarketingConsent {
      consentUpdatedAt
      marketingOptInLevel
      marketingState
    }
  }
`;

/**
 * Helper: Performs a Shopify Admin GraphQL API call.
 */
async function shopifyAdminFetch(query: string, variables: Record<string, any>): Promise<any> {
   const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ADMIN_API_URL;
   const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_PRIVATE_ACCESS_TOKEN;
   if (!endpoint || !accessToken) {
      throw new Error('Required environment variables are not defined');
   }
   // If endpoint already starts with http, use it directly; otherwise, prepend https://
   const url = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
   console.log('Using endpoint:', url);

   const response = await fetch(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ query, variables })
   });
   return response.json();
}

/**
 * Searches for a customer by email.
 */
async function getCustomerConsent({
   email
}: {
   email: string;
}): Promise<{ customer: Subscriber | null; error: null }> {
   const query = `#graphql
    ${CUSTOMER_FRAGMENT}
    query getCustomerByEmail($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            ...CustomerFragment
          }
        }
      }
    }
  `;
   const variables = { query: `email:${email}` };
   const result = await shopifyAdminFetch(query, variables);
   const customer = result.data?.customers?.edges?.[0]?.node || null;
   return { customer, error: null };
}

/**
 * Updates a customer's email marketing consent.
 */
async function updateCustomerMarketingConsent({
   customerId
}: {
   customerId: string;
}): Promise<CustomerMutation> {
   const consentUpdatedAt = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
   ).toISOString();
   const query = `#graphql
    ${CUSTOMER_FRAGMENT}
    mutation ($input: CustomerEmailMarketingConsentUpdateInput!) {
      customerEmailMarketingConsentUpdate(input: $input) {
        customer {
          ...CustomerFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
   const input = {
      customerId,
      emailMarketingConsent: {
         consentUpdatedAt,
         marketingOptInLevel: 'SINGLE_OPT_IN',
         marketingState: 'SUBSCRIBED'
      }
   };
   const variables = { input };
   const result = await shopifyAdminFetch(query, variables);
   if (result.data?.customerEmailMarketingConsentUpdate?.userErrors?.length > 0) {
      const [{ field, message }] = result.data.customerEmailMarketingConsentUpdate.userErrors;
      return { error: { field, message }, customer: null };
   }
   return {
      customer: result.data?.customerEmailMarketingConsentUpdate?.customer,
      error: null
   };
}

/**
 * Creates a new subscriber.
 */
async function createSubscriber({ email }: { email: string }): Promise<CustomerMutation> {
   const query = `#graphql
    ${CUSTOMER_FRAGMENT}
    mutation newCustomerLead($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          ...CustomerFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
   const consentUpdatedAt = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
   ).toISOString();
   // Note: Do not include "acceptsMarketing" if it's not supported.
   const input = {
      email,
      emailMarketingConsent: {
         consentUpdatedAt,
         marketingOptInLevel: 'SINGLE_OPT_IN',
         marketingState: 'SUBSCRIBED'
      },
      tags: ['newsletter']
   };
   const variables = { input };
   const result = await shopifyAdminFetch(query, variables);
   console.log('Customer Create Result:', result);
   if (!result.data || !result.data.customerCreate) {
      return {
         error: { field: null, message: 'Customer creation failed: No data returned.' },
         customer: null
      };
   }
   if (result.data.customerCreate.userErrors && result.data.customerCreate.userErrors.length > 0) {
      const [{ field, message }] = result.data.customerCreate.userErrors;
      return { error: { field, message }, customer: null };
   }
   if (result.data.customerCreate.customer) {
      return { customer: result.data.customerCreate.customer, error: null };
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
      // Use JSON since the newsletter form sends JSON.
      const { email } = await request.json();
      invariant(email, 'Email is required');

      // Step 1: Check if customer already exists.
      const existing = await getCustomerConsent({ email });
      const alreadySubscribed =
         existing.customer?.emailMarketingConsent?.marketingState === 'SUBSCRIBED';

      if (alreadySubscribed) {
         return returnSuccess({ subscriber: existing.customer });
      }

      // Step 2: Create or update the customer.
      let customerMutation: CustomerMutation;
      if (!existing.customer) {
         customerMutation = await createSubscriber({ email });
      } else {
         customerMutation = await updateCustomerMarketingConsent({
            customerId: existing.customer.id
         });
      }

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
