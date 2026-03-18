const mongoose = require('mongoose');

const connect = async () => {
    console.log("Mongo URL", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI).then(a => console.log("Mongodb is connected"))
        .catch((err) => {
            console.log("Mongodb is Not Connected")
            console.log(err);

        })
}

module.exports = connect;