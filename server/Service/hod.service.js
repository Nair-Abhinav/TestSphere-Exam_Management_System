const Hod = require('../Models/HOD.model');
module.exports.createHod = async ({
   name , email, password
}) => {
    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }
    console.log("Creating user with:", {name , email,password});
    const hod = new Hod({
        name,
        email,
        password
    });
    const savedHod = await hod.save();
    console.log("Hod created:", savedHod);
    return savedHod;
};
