var mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryDescription: {
    type: String,
    required: true,
  },
  is_listed: {
    type: Boolean,
    default: true,
  },
});

const categoryCollection = mongoose.model("categories", categorySchema);

module.exports = categoryCollection;
