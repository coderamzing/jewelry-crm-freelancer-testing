-- CHALLENGE 1: Test cases for the update_customer_company function
-- This file should contain your test cases

-- TODO: Create test cases here
-- You should test:
-- 1. Valid update scenario
-- 2. Invalid customer ID
-- 3. Empty company name
-- 4. NULL company name
-- 5. Edge cases

-- Example test cases (you need to complete these):
/*
-- Test 1: Valid update
SELECT update_customer_company('New Company Name', 'valid-customer-id');

-- Test 2: Invalid customer ID
SELECT update_customer_company('Company Name', 'invalid-id');

-- Test 3: Empty company name
SELECT update_customer_company('', 'valid-customer-id');

-- Test 4: NULL company name
SELECT update_customer_company(NULL, 'valid-customer-id');
*/


/*
-- Test 1: Valid update
SELECT update_customer_company('Acme Industries', '550e8400-e29b-41d4-a716-446655440001');

-- Test 2: Invalid customer ID
SELECT update_customer_company('Beta Corp', '123e4567-e89b-12d3-a456-426614174000');

-- Test 3: Empty company name
SELECT update_customer_company('', '550e8400-e29b-41d4-a716-446655440001');

-- Test 4: NULL company name
SELECT update_customer_company(NULL, '550e8400-e29b-41d4-a716-446655440001');

-- Test 5: Too long company name (>255 chars)
SELECT update_customer_company(
    repeat('A', 256),
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Test 6: Company name with special characters (not allowed)
SELECT update_customer_company('Acme@123', '550e8400-e29b-41d4-a716-446655440001');

-- Test 7: Company name with single quote (allowed)
SELECT update_customer_company('O''Reilly Media', '550e8400-e29b-41d4-a716-446655440001');

-- Test 8: Company name with spaces and numbers (allowed)
SELECT update_customer_company('Data Solutions 2025', '550e8400-e29b-41d4-a716-446655440001');
*/

