const { z } = require("zod");

const LoginSchema = z.object({
    body: z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(6, "Password must be at least 6 characters long")
    })
});

const AdminRegisterSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long")
    })
}).refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Passwords do not match",
    path: ["body", "confirmPassword"]
});

module.exports = {
    LoginSchema,
    AdminRegisterSchema
};
