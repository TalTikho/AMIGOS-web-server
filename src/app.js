const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const mongoose = require("mongoose");

const {env} = require("custom-env");
env(process.env.NODE_ENV, "./config");

const appRouter = require('./routes/appRouter');

// check app variables
if (process.env.MONGODB_URI === undefined) {
    console.error("MongoDB URI is missing");
    process.exit(1);
}
if (process.env.PORT === undefined) {
    console.error("App port is missing");
    process.exit(1);
}

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI);

// setup app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

// set app endpoints
// app.use('/api', appRouter);

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

console.log(`Running on http://localhost:${process.env.PORT}`);
app.listen(process.env.PORT);
