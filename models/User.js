const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true },
    middle: { type: String },
    last: { type: String, required: true },
  },
  phone: { type: String, required: true },
  email: { type: String, required: true, minLingth: 6, unique: true },
  password: { type: String, required: true, minLength: 7 },
  image: { type: string },
  address: {
    street: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    houseNumber: { type: String },
    zip: { type: String, required: true },
  },
  isBusiness: { type: Boolean, default: false, required: true },
});
const User = mongoose.model("users", userSchema);
module.exports = User;
