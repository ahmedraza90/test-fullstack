const { Pool } = require("pg");
const argon2 = require("argon2");

// Database connection
const db = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/school_mgmt",
});

async function checkAndFixAdminUser() {
    try {
        console.log("🔍 Checking admin user in database...");

        // Check current admin user
        const result = await db.query(
            "SELECT id, email, password, \"is_active\", \"is_email_verified\" FROM users WHERE email = $1",
            ["admin@school-admin.com"]
        );

        if (result.rows.length === 0) {
            console.log("❌ Admin user not found!");
            return;
        }

        const user = result.rows[0];
        console.log("📋 Current admin user:");
        console.log("ID:", user.id);
        console.log("Email:", user.email);
        console.log("Password hash:", user.password);
        console.log("Is Active:", user.is_active);
        console.log("Email Verified:", user.is_email_verified);

        // Test the current password
        const testPassword = "3OU4zn3q6Zh9";
        const isValidPassword = await argon2.verify(user.password, testPassword);
        console.log(`\n🔐 Password "${testPassword}" is valid:`, isValidPassword);

        if (!isValidPassword) {
            console.log("\n🔧 Resetting admin password...");
            const hashedPassword = await argon2.hash(testPassword);

            await db.query(
                "UPDATE users SET password = $1, \"is_email_verified\" = true, \"is_active\" = true WHERE email = $2",
                [hashedPassword, "admin@school-admin.com"]
            );

            console.log("✅ Admin password reset successfully!");
            console.log("New password:", testPassword);
        }

        // Verify the fix
        const updatedResult = await db.query(
            "SELECT id, email, password, \"is_active\", \"is_email_verified\" FROM users WHERE email = $1",
            ["admin@school-admin.com"]
        );

        const updatedUser = updatedResult.rows[0];
        const finalCheck = await argon2.verify(updatedUser.password, testPassword);

        console.log("\n✅ Final verification:");
        console.log("Password is valid:", finalCheck);
        console.log("Is Active:", updatedUser.is_active);
        console.log("Email Verified:", updatedUser.is_email_verified);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await db.end();
    }
}

checkAndFixAdminUser();
