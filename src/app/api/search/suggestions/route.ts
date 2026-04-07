import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getSearchSuggestions } from '@/lib/supabase/queries/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''

  const suggestions = await getSearchSuggestions(query)

  return NextResponse.json(suggestions)
}
