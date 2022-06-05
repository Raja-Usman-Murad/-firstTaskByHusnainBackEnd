const express = require("express"); //for routing its require
const router = express.Router(); //routing
const authenticate = require("../middleware/authenticate"); //for  middleware authentication
const listController = require("../controllers/listController");

// 1) fetch all liste in db route localhost:5000/fetchalllists
router.get("/fetchalllists", authenticate, listController.fetchAllLists);

// 2) add list to db route localhost:5000/addlist
router.post("/addlist", authenticate, listController.addList);

// 3) update an existing list  to db route localhost:5000/updatelist
router.put("/updatelist/:id", authenticate, listController.updateList);

// 4) delete an existing list  to db route localhost:5000/deletelist
router.delete("/deletelist/:id", authenticate, listController.deleteList);

module.exports = router;
