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
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  isLiked: { type: Boolean, default: false },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
