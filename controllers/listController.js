const List = require("../model/ListSchema");

exports.fetchAllLists = async (req, res) => {
  try {
    const lists = await List.find({ user: req.user.id });

    if (!lists) {
      return res.status(404).json({
        status: "fail",
        message: "No list found in DataBase",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        lists,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "fail",
      message: `No list found in DataBase : ${error}`,
    });
  }
};

exports.addList = async (req, res) => {
  try {
    const { date, title, description } = req.body;
    const list = new List({ date, title, description, user: req.user.id });
    const saveList = await list.save();
    console.log(saveList);
    return res.status(201).json({
      status: "success",
      message: "list add successfully",
      data: { saveList },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "fail",
      message: `did not add list : ${error}`,
    });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { date, title, description } = req.body;
    // create a newlist object
    const newlist = {};
    if (title && date && description) {
      newlist.title = title;
      newlist.date = date;
      newlist.description = description;
    }

    let list = await List.findById({ _id: req.params.id, user: req.user.id });
    if (!list) {
      return res.status(404).json({ status: "fail", message: "Not found" });
    }

    list = await List.findByIdAndUpdate(
      req.params.id,
      { $set: newlist },
      { new: true, runValidators: true }
    );
    return res.status(201).json({
      status: "success",
      message: "list update successfully",
      data: { list },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "fail",
      message: `did not update list : ${error}`,
    });
  }
};

exports.deleteList = async (req, res) => {
  try {
    let list = await List.findById({ _id: req.params.id, user: req.user.id });
    if (!list) {
      return res.status(404).json({ status: "fail", message: "Not found" });
    }
    list = await List.findByIdAndDelete(req.params.id);

    return res.status(204).send({
      status: "success",
      message: "list delete successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "fail",
      message: `did not delete list : ${error}`,
    });
  }
};
