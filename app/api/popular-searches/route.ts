// app/api/popular-searches/route.ts
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis from environment variables.
const redis = Redis.fromEnv();

/**
 * POST: Record a search query by incrementing its score in a sorted set.
 */
export async function POST(request: Request) {
   try {
      const { query } = await request.json();
      if (!query || typeof query !== 'string' || query.trim() === '') {
         return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
      }
      const normalized = query.trim().toLowerCase();
      // Increment the score for this search term.
      await redis.zincrby('popularSearches', 1, normalized);
      return NextResponse.json({ success: true });
   } catch (error: any) {
      console.error('Error recording search:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}

/**
 * GET: Retrieve the top 10 searches with their scores.
 */
export async function GET() {
   try {
      // Use zrange with options to get the top searches in descending order.
      // We use { rev: true, withScores: true } to reverse the order and include scores.
      const result = (await redis.zrange('popularSearches', 0, 9, {
         rev: true,
         withScores: true
      })) as string[];

      // Convert the flat array into an array of objects.
      const searches: { query: string; score: number }[] = [];
      for (let i = 0; i < result.length; i += 2) {
         searches.push({ query: result[i]!, score: Number(result[i + 1]) });
      }
      return NextResponse.json({ searches });
   } catch (error: any) {
      console.error('Error fetching popular searches:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
