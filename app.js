const express = require("express");
const cookieParser = require("cookie-parser");// token parser
const cors = require('cors')
const app = express();

require("./db/conn"); //DATABASE
app.use(express.json()); //its for only postman
app.use(cookieParser());
app.use(cors())

app.use(express.urlencoded({ extended: false }));
app.use(require("./router/auth")); //registration and login route
app.use(require("./router/list")); // add,edit,fetch,delete route

app.listen(5000, () => {
    console.log(`server is running at port 5000`);
  });

