const mongooose = require('mongoose');

function connectDb(){
    mongooose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('DB connected successfully');
    })
    .catch((err)=>{
        console.log('DB connection failed');
    })
}

module.exports = connectDb;