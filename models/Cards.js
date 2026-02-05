const { required } = require("joi");
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  web: { type: String },
  description: { type: String, required: true },
  email: { type: String, required: true, unique: true, minLength: 6 },
  phone: { type: String, required: true, minLength: 9, maxLength: 11 },
  address: {
    state: { type: String },
    country: { type: String, required: true },
    city: { type: String },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    zip: { type: Number, required: true },
  },
  bizNumber: { type: Number, required: true },
  userId: { type: String, required: true },
  likes: { type: Array, default: [] },
  isLiked: { type: Boolean, default: false },
  _id: { type: String },
  image: {
    url: { type: String, required: true , default: "https://agrimart.in/uploads/vendor_banner_image/default.jpg"},
    alt: { type: String, required: true },
    _id: { type: String, required: true },
  },
});

const Card = mongoose.model("cards", cardSchema);

module.exports = Card