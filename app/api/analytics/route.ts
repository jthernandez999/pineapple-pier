// app/api/analytics/route.ts
'use strict';
import {
   AnalyticsEventName,
   sendShopifyAnalytics,
   ShopifyPageViewPayload
} from '@shopify/hydrogen';
import { NextResponse } from 'next/server';

interface AnalyticsPayload {
   eventName: AnalyticsEventName;
   data: Record<string, any>;
}

export async function POST(request: Request) {
   try {
      const body: AnalyticsPayload = await request.json();
      const { eventName, data } = body;

      // Merge client parameters with your data and assert it as a ShopifyPageViewPayload.
      const payload = {
         // ...getClientBrowserParameters(),
         ...data
      } as ShopifyPageViewPayload;

      // Cast eventName to string if needed.
      await sendShopifyAnalytics({
         eventName: eventName as unknown as string,
         payload
      });

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error('Analytics error:', error);
      return NextResponse.json(
         { error: 'Failed to send analytics event', details: error },
         { status: 500 }
      );
   }
}
