// CHALLENGE 4: Fixed protected API route
// This file should contain your fixed API route code

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { User, AuthAPIResponse } from '@/challenge-4/types'

// TODO: Fix the protected route here
// You need to:
// 1. Handle undefined user properly
// 2. Add proper error handling
// 3. Return appropriate HTTP status codes
// 4. Add TypeScript types
// 5. Add logging for debugging

export async function GET(request: NextRequest) : Promise<NextResponse<AuthAPIResponse>>  {
    try {

        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session){
            console.error('Error in protected route: User session is undefined');
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED', success: false },
                { status: 401 }
            );
        }
        
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if(authError)
            throw authError

        const user = authData.user

        const userId = user.id

        // Rest of the protected logic
        const { data, error: dbError } = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', userId)

        if (dbError) throw dbError

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('Error in protected route:', error)
        return NextResponse.json(
            { error: error.message, code: error.code, success: false },
            { status: 500 }
        )
    }
}
