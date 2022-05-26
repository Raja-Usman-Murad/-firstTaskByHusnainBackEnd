const mongoose = require("mongoose"); //for database require
mongoose
  .connect("mongodb://localhost:27017/husnainfirsttask", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  })
  .then(() => console.log("connection successfull"))
  .catch((err) => console.log(err , console.log("connection not successfull")));