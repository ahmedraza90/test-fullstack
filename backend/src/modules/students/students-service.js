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
    console.log('🔵 Backend Service: Raw payload received:', JSON.stringify(payload, null, 2));
    console.log('🔵 Backend Service: Payload field types:', {
        name: typeof payload.name,
        email: typeof payload.email,
        phone: typeof payload.phone,
        gender: typeof payload.gender,
        dob: typeof payload.dob,
        class: typeof payload.class,
        section: typeof payload.section,
        roll: typeof payload.roll,
        admissionDate: typeof payload.admissionDate,
        currentAddress: typeof payload.currentAddress,
        permanentAddress: typeof payload.permanentAddress,
        fatherName: typeof payload.fatherName,
        guardianName: typeof payload.guardianName,
        guardianPhone: typeof payload.guardianPhone,
        relationOfGuardian: typeof payload.relationOfGuardian,
        systemAccess: typeof payload.systemAccess
    });

    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        console.log('🔵 Backend Service: Calling addOrUpdateStudent...');
        const result = await addOrUpdateStudent(payload);
        console.log('🔵 Backend Service: Database result:', result);

        if (!result.status) {
            console.log('🔴 Backend Service: Database operation failed:', result.message);
            throw new ApiError(500, result.message);
        }

        console.log('🔵 Backend Service: Student added successfully, attempting to send email...');
        try {
            await sendAccountVerificationEmail({ userId: result.userid || result.userId, userEmail: payload.email });
            console.log('🔵 Backend Service: Email sent successfully');
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (emailError) {
            console.log('🟡 Backend Service: Email send failed:', emailError.message);
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL };
        }
    } catch (error) {
        console.error('🔴 Backend Service: Error in addNewStudent:', error);
        console.error('🔴 Backend Service: Error stack:', error.stack);
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: result.message };
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
