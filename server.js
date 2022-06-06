const dotenv = require("dotenv"); //dependency for saving important things to .encfile
dotenv.config({ path: "./config.env" }); //({path:""})

require("./db/conn"); //REQUIRE DATABASE
const app = require("./app"); //REQUIRE Express App

const port = process.env.PORT || 5000; //SET PORT
app.listen(port, () => {
  console.log(`server is running at port 5000`);
});
