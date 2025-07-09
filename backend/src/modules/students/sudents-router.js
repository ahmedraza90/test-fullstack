const express = require("express");
const router = express.Router();
const studentController = require("./students-controller");
const { validateRequest } = require("../../utils");
const { checkApiAccess } = require("../../middlewares");
const {
    AddStudentSchema,
    UpdateStudentSchema,
    GetStudentDetailSchema,
    StudentStatusSchema,
    GetAllStudentsSchema
} = require("./students-schema");

router.get("", validateRequest(GetAllStudentsSchema), checkApiAccess, studentController.handleGetAllStudents);
router.post("", validateRequest(AddStudentSchema), checkApiAccess, studentController.handleAddStudent);
router.get("/:id", validateRequest(GetStudentDetailSchema), checkApiAccess, studentController.handleGetStudentDetail);
router.post("/:id/status", validateRequest(StudentStatusSchema), checkApiAccess, studentController.handleStudentStatus);
router.put("/:id", validateRequest(UpdateStudentSchema), checkApiAccess, studentController.handleUpdateStudent);

module.exports = { studentsRoutes: router };