const express = require("express"); //for routing its require
const router = express.Router(); //routing
const authenticate = require("../middleware/authenticate"); //for contact middleware authentication
const List = require("../model/ListSchema");

// 1) fetch all liste in db route localhost:5000/fetchalllists
router.get("/fetchalllists", authenticate, async (req, res) => {
  try {
    const lists = await List.find({ user: req.user.id});
    console.log(lists);
    res.json(lists);
  } catch (error) {
    console.log(error);
  }
});

// 2) add list to db route localhost:5000/addlist
router.post("/addlist", authenticate, async (req, res) => {
  try {
    const { date, title, description } = req.body;
    const list = new List({ date, title, description, user: req.user.id });
    const saveList = await list.save();
    console.log(saveList);
    res.status(201).json({ message: "list add successfully", data: saveList });
  } catch (error) {
    console.log(error);
  }
});

// 3) update an existing list  to db route localhost:5000/updatelist
router.put("/updatelist/:id", authenticate, async (req, res) => {
  try {
    const { date, title, description } = req.body;
    // create a newlist object 
    const newlist = {}
    if(title){newlist.title = title}
    if(date){newlist.date = date}
    if(description){newlist.description = description}

    let list = await List.findById(req.params.id)
    if(!list){return res.status(404).send('Not found')}

    if(list.user.toString() !== req.user.id.toString()){return res.status(401).send('Not Allowed')}

    list = await List.findByIdAndUpdate(req.params.id , {$set: newlist} ,{new:true})
    res.json({list})
  } catch (error) {
    console.log(error);
  }
});

// 4) delete an existing list  to db route localhost:5000/deletelist
router.delete("/deletelist/:id", authenticate, async (req, res) => {
    try {
      let list = await List.findById(req.params.id)
      if(!list){return res.status(404).send('Not found')}
  
      if(list.user.toString() !== req.user.id.toString()){return res.status(401).send('Not Allowed')}
  
      list = await List.findByIdAndDelete(req.params.id)
      
      res.json({msg:'Successfuly list deleted',list})
    } catch (error) {
      console.log(error);
    }
  });
module.exports = router;