const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    if (students.length <= 0) {
        throw new ApiError(404, "Students not found");
    }

    return students;
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";

    try {
        console.log('📍 Student payload received:', JSON.stringify(payload, null, 2));

        const result = await addOrUpdateStudent(payload);
        console.log('📍 Database result:', result);

        if (!result.status) {
            console.error('❌ Database operation failed:', result.message);
            throw new ApiError(500, result.message);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (emailError) {
            console.error('📧 Email sending failed:', emailError);
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        console.error('🔥 Add student error:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to add student: " + error.message);
    }
}

const updateStudent = async (payload) => {
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(500, result.message);
        }

        return { message: result.message };
    } catch (error) {
        console.error('🔥 Update student error:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to update student: " + error.message);
    }
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to disable student");
    }

    return { message: "Student status changed successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
};