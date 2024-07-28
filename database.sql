-- -- Add reset_token and reset_token_expires columns to the users table
-- ALTER TABLE users1 ADD COLUMN reset_token VARCHAR(255);
-- ALTER TABLE users1 ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Create users table
CREATE TABLE USERS_TABLE (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    otp VARCHAR(6)
);


-- -- Drop the users1 table
-- DROP TABLE IF EXISTS users;