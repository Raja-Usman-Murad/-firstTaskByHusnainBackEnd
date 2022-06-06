const express = require("express"); //require express
const cookieParser = require("cookie-parser"); // cookies parser eg: (token)
const cors = require("cors"); //using this connect frontend to backend

const app = express();

app.use(express.json()); //Middleware for only postman (parsing the req.body)
app.use(cookieParser()); //Middleware for parsing cookie
app.use(cors()); //Middleware for cors
app.use(express.urlencoded({ extended: false })); //body-parser is deprecated so i think we use this

app.use(require("./routes/auth")); //register, signin, getuser, getAllUser, deleteUser, forgotPassword, resetPassword  route
app.use(require("./routes/list")); // fetch, add, edit, delete route

module.exports = app;
