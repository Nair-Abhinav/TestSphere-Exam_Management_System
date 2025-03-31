const Admin = require('../Models/admin.model');
module.exports.createAdmin = async ({
    name ,email, password
}) => {
    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }
    console.log("Creating user with:", { name,email,password});
    const admin = new Admin({
        name,
        email,
        password
    });
    const savedAdmin = await admin.save();
    console.log("Admin created:", savedAdmin);
    return savedAdmin;
};
