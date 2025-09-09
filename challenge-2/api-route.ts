// CHALLENGE 2: Fixed API route for communications
// This file should contain your fixed API route code

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import {CommunicationListAPIResponse } from '@/challenge-2/types'

// TODO: Fix the API route here
// You need to:
// 1. Fix the query to work with the new relationships
// 2. Add proper error handling
// 3. Add proper TypeScript types
// 4. Add data validation

export async function GET(request: NextRequest): Promise<NextResponse<CommunicationListAPIResponse>> {
  try {
    // TODO: Fix this query
    const { data, error } = await supabase
      .from('communications')
      .select('*, recipient:users!fk_communications_recipient(*), sender:users!fk_communications_sender(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    let status = 500
    return NextResponse.json(
			{ error: error.message, code: error.code, success: false },
			{ status }
		)
  }
}