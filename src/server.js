require("dotenv").config();
const app = require("./app");
const connect = require('./config/db')

const Port = process.env.PORT || 3000
connect()


const expireCompanyPlan = require("./cron/expireCompanyPlan");

expireCompanyPlan();

app.listen(Port, () => console.log(`Server is running on port ${Port}`))