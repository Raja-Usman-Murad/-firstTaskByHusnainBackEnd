const express = require("express");
const app = express();
const cookieParser = require("cookie-parser"); // token parser
require("./db/conn"); //DATABASE
app.use(express.json()); //its for only postman
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(require("./router/auth"));

app.listen(5000, () => {
    console.log(`server is running at port 5000`);
  });

