import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { UpdateCustomerCompanyParams, UpdateCustomerCompanyRequestBody, UpdateCustomerCompanyAPIResponse } from "@/challenge-1/types"



export async function PUT(
	request: NextRequest,
	{ params }: UpdateCustomerCompanyParams
): Promise<NextResponse<UpdateCustomerCompanyAPIResponse>> {
	try {
		const { company }: UpdateCustomerCompanyRequestBody = await request.json()
		const { id } = params
		const { data, error } = await supabase.rpc('update_customer_company', {
			company_name: company,
			customer_id: id
		})
		
		if (error) throw error

		return NextResponse.json({ success: true, data })
	} catch (error: any) {
		let status = 400
		if (["P0001", "22004", "22001", "22023", "22027"].includes(error.code)) {
			status = 400; // Bad Request
		} else if (error.code == "P0002") {
			status = 404 // Not Found
		} else {
			status = 500 // Internal Server Error
		}
		return NextResponse.json(
			{ error: error.message, code: error.code, success: false },
			{ status }
		)
	}
}