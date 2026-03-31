const mongoose = require('mongoose');

const connect = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected");
        return mongoose.connection;
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1); // optional: exit app
    }
};

module.exports = connect;