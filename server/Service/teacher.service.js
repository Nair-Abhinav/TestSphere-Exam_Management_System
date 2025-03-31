const Teacher = require('../Models/teacher.model');

module.exports.createTeacher = async ({
   name, email, password
}) => {
    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }
    console.log("Creating user with:", {name ,email,password});
    const teacher = new Teacher({
        name,
        email,
        password
    });
    const savedTeacher = await teacher.save();
    console.log("Teacher created:", savedTeacher);
    return savedTeacher;
};
