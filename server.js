const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" }); //({path:""})
require("./db/conn"); //DATABASE
const app = require("./app");

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running at port 5000`);
});
