const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  attendance: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
