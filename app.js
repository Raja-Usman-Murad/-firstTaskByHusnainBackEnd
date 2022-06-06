const express = require("express"); //require express
const cors = require("cors"); //using this connect frontend to backend

const app = express();

app.use(express.json()); //Middleware for only postman (parsing the req.body)
app.use(cors()); //Middleware for cors

app.use(require("./routes/auth")); //register, signin, getuser, getAllUser, deleteUser, forgotPassword, resetPassword  route
app.use(require("./routes/list")); // fetch, add, edit, delete route

module.exports = app;
