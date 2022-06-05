const express = require("express");
const cookieParser = require("cookie-parser"); // cookies parser eg: (token)
const cors = require("cors"); //connect frontend to backend

const app = express();

app.use(express.json()); //its for only postman (parsing the req.body)
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(require("./routes/auth")); //registration and login route
app.use(require("./routes/list")); // add,edit,fetch,delete route

module.exports = app;
