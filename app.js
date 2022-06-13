const path = require("path");
const express = require("express"); //require express
const cors = require("cors"); //using this connect frontend to backend
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
app.use(
  morgan(
    ":date[iso] - :req[X-Real-IP] - :method - :url - :status - :response-time ms"
  )
);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "50mb" })); //Middleware for only postman (parsing the req.body)
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);
app.use(cors()); //Middleware for cors
app.options("*", cors());

// app.use(express.urlencoded({ extended: true, limit: "10kb" })); //its when we send data from direct form not with api request

app.use(require("./routes/auth")); //register*, signin*, updatePassword*, updateUser*, getuser*, getAllUser, deleteUser, forgotPassword, resetPassword  route
app.use(require("./routes/list")); // fetch*, add*, edit*, delete* route

module.exports = app;
