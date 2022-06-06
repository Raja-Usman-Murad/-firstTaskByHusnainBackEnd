const mongoose = require("mongoose"); //for creating mschema and model

const listSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: String,
    required: [true, "must have date"],
  },
  title: {
    type: String,
    required: [true, "must have title"],
  },
  description: {
    type: String,
    required: [true, "must have description"],
  },
});

const List = mongoose.model("List", listSchema);

module.exports = List;
