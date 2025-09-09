-- CHALLENGE 1: Create the missing update_customer_company function
-- This file should contain your SQL function definition

-- TODO: Create the update_customer_company function here
-- The function should:
-- 1. Accept company_name (VARCHAR) and customer_id (UUID) parameters
-- 2. Validate that the customer exists
-- 3. Validate that company_name is not empty or NULL
-- 4. Update the company field in the customers table
-- 5. Create an audit log entry
-- 6. Return success/error status

-- Example structure (you need to complete this):



-- Log Table Structure
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(10) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'FETCH')),
    comment VARCHAR(255),
    by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- function update_customer_company
DROP FUNCTION IF EXISTS update_customer_company(text,uuid);
CREATE OR REPLACE FUNCTION update_customer_company(
    company_name TEXT,
    customer_id UUID
)
RETURNS JSON AS $$
DECLARE
    customer_exists BOOLEAN;
    customer_json json;
BEGIN
    IF company_name IS NULL THEN
        RAISE EXCEPTION 'Company name cannot be null'
            USING ERRCODE = '22004';
    END IF;

    IF trim(company_name) = '' THEN
        RAISE EXCEPTION 'Company name cannot be empty'
            USING ERRCODE = '22023';
    END IF;

    IF length(company_name) > 255 THEN
        RAISE EXCEPTION 'Company name must be less than 255 characters'
            USING ERRCODE = '22001';
    END IF;

    IF company_name !~ '^[A-Za-z0-9 '' ]+$' THEN
        RAISE EXCEPTION 'Company name must only contain alphanumeric characters, spaces, and single quotes'
            USING ERRCODE = '22027';
    END IF;

    SELECT EXISTS(SELECT 1 FROM customers WHERE id = customer_id) INTO customer_exists;
    IF NOT customer_exists THEN
        RAISE EXCEPTION 'Customer not found'
            USING ERRCODE = 'P0002';
    END IF;

    -- Update company
    UPDATE customers SET company = company_name WHERE id = customer_id;

    -- Audit log
    INSERT INTO logs(action, comment, by) VALUES ('UPDATE', CONCAT('company name to ', company_name), customer_id);

    -- Fetch the updated customer row as JSON
    SELECT row_to_json(c) INTO customer_json
    FROM customers c
    WHERE id = customer_id;

    RETURN customer_json;
END;
$$ LANGUAGE plpgsql;



