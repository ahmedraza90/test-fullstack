#!/usr/bin/env node

const { db } = require('./src/config/db');
const { generateHashedPassword } = require('./src/utils/handle-password');

async function addAdminUser() {
    console.log('Starting admin user creation...');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log('Usage: node add-admin-user.js <name> <email> <password>');
        console.log('Example: node add-admin-user.js "Jane Smith" "jane@school.com" "securePassword123"');
        process.exit(1);
    }
    
    const [name, email, password] = args;
    
    console.log(`Creating admin user: ${name} (${email})`);
    
    try {
        // Use the existing database pool
        const pool = db;
        
        // Check if email already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
            console.log(`❌ Error: User with email ${email} already exists`);
            process.exit(1);
        }
        
        // Hash the password
        console.log('Hashing password...');
        const hashedPassword = await generateHashedPassword(password);
        
        // Get Admin role ID (should be 1, but let's verify)
        const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['Admin']);
        
        if (roleResult.rows.length === 0) {
            console.log('❌ Error: Admin role not found in database');
            process.exit(1);
        }
        
        const adminRoleId = roleResult.rows[0].id;
        console.log(`Found Admin role with ID: ${adminRoleId}`);
        
        // Start transaction
        await pool.query('BEGIN');
        
        try {
            // Insert user
            const userResult = await pool.query(`
                INSERT INTO users (name, email, role_id, created_dt, password, is_active, is_email_verified)
                VALUES ($1, $2, $3, NOW(), $4, true, true)
                RETURNING id
            `, [name, email, adminRoleId, hashedPassword]);
            
            const userId = userResult.rows[0].id;
            console.log(`Created user with ID: ${userId}`);
            
            // Insert basic user profile (required for the system)
            await pool.query(`
                INSERT INTO user_profiles 
                (user_id, gender, marital_status, phone, dob, join_dt, qualification, experience, 
                 current_address, permanent_address, father_name, mother_name, emergency_phone)
                VALUES ($1, 'Not Specified', 'Not Specified', '', NULL, NOW(), '', '', 
                        '', '', '', '', '')
            `, [userId]);
            
            console.log('Created user profile');
            
            // Commit transaction
            await pool.query('COMMIT');
            
            console.log('✅ Admin user created successfully!');
            console.log('User details:');
            console.log(`  Name: ${name}`);
            console.log(`  Email: ${email}`);
            console.log(`  Role: Admin`);
            console.log(`  Status: Active & Email Verified`);
            console.log(`  User ID: ${userId}`);
            console.log('\nYou can now log in with these credentials.');
            
        } catch (error) {
            // Rollback on error
            await pool.query('ROLLBACK');
            throw error;
        }
        
    } catch (error) {
        console.log('❌ Error creating admin user:', error.message);
        if (error.code === '23505') {
            console.log('This is likely a duplicate email error.');
        }
        process.exit(1);
    }
}

// Run the script
addAdminUser().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
