const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, class: className, section, roll } = req.query;
    const payload = { name, className, section, roll };

    const students = await getAllStudents(payload);
    res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    console.log('🔵 Controller: handleAddStudent called');
    console.log('🔵 Controller: Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔵 Controller: Request headers:', req.headers);

    try {
        const payload = req.body;
        const message = await addNewStudent(payload);
        console.log('🔵 Controller: Service response:', message);
        res.json(message);
    } catch (error) {
        console.error('🔴 Controller: Error in handleAddStudent:', error);
        throw error;
    }
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payload = { ...req.body, id: parseInt(id) };

    const message = await updateStudent(payload);
    res.json(message);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(parseInt(id));
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const { id: reviewerId } = req.user;
    const { status } = req.body;

    const payload = {
        userId: parseInt(userId),
        reviewerId,
        status
    };

    const message = await setStudentStatus(payload);
    res.json(message);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
};
