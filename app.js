const express = require("express");
const app = express();
require("./db/conn"); //DATABASE

app.use(express.urlencoded({ extended: false }));
app.use(require("./router/auth"));

app.listen(5000, () => {
    console.log(`server is running at port 5000`);
  });

