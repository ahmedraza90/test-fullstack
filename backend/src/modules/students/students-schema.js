const { z } = require("zod");

const AddStudentSchema = z.object({
    body: z.object({
        // Basic Info
        name: z.string().min(1, "Name is required"),
        gender: z.string().min(1, "Gender is required"),
        dob: z.string().min(1, "Date of birth is required"),
        phone: z.string().min(1, "Phone is required"),
        email: z.string().email("Invalid email format").min(1, "Email is required"),

        // Academic Info
        class: z.string().min(1, "Class is required"),
        section: z.string().optional(),
        roll: z.number().min(1, "Roll is required"),
        admissionDate: z.string().min(1, "Admission date is required"),

        // Address Info
        currentAddress: z.string().min(1, "Current address is required"),
        permanentAddress: z.string().min(1, "Permanent address is required"),

        // Parents and Guardian Info
        fatherName: z.string().min(1, "Father name is required"),
        fatherPhone: z.string().optional(),
        motherName: z.string().optional(),
        motherPhone: z.string().optional(),
        guardianName: z.string().min(1, "Guardian name is required"),
        guardianPhone: z.string().min(1, "Guardian phone is required"),
        relationOfGuardian: z.string().min(1, "Relation of guardian is required"),

        // Other Info
        systemAccess: z.boolean().optional()
    })
});

const UpdateStudentSchema = z.object({
    body: z.object({
        // Basic Info
        name: z.string().min(1, "Name is required"),
        gender: z.string().min(1, "Gender is required"),
        dob: z.string().min(1, "Date of birth is required"),
        phone: z.string().min(1, "Phone is required"),
        email: z.string().email("Invalid email format").min(1, "Email is required"),

        // Academic Info
        class: z.string().min(1, "Class is required"),
        section: z.string().optional(),
        roll: z.number().min(1, "Roll is required"),
        admissionDate: z.string().min(1, "Admission date is required"),

        // Address Info
        currentAddress: z.string().min(1, "Current address is required"),
        permanentAddress: z.string().min(1, "Permanent address is required"),

        // Parents and Guardian Info
        fatherName: z.string().min(1, "Father name is required"),
        fatherPhone: z.string().optional(),
        motherName: z.string().optional(),
        motherPhone: z.string().optional(),
        guardianName: z.string().min(1, "Guardian name is required"),
        guardianPhone: z.string().min(1, "Guardian phone is required"),
        relationOfGuardian: z.string().min(1, "Relation of guardian is required"),

        // Other Info
        systemAccess: z.boolean().optional()
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});

const GetStudentDetailSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});

const StudentStatusSchema = z.object({
    body: z.object({
        status: z.boolean()
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});

const GetAllStudentsSchema = z.object({
    query: z.object({
        name: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        roll: z.string().optional()
    })
});

module.exports = {
    AddStudentSchema,
    UpdateStudentSchema,
    GetStudentDetailSchema,
    StudentStatusSchema,
    GetAllStudentsSchema
};
