const express = require("exress");
const Card = require("../models/Cards");
const router = express.Router();
const auth = require("../middleware/auth");
const joi = require("joi");
const cardBodyValidation = joi.object({
  title: joi.string().min(2).max(255).required(),
  subtitle: joi.string().min(2).max(255).optional().allow(""),
  description: joi.string().min(2).max(1024).required(),
  phone: joi
    .string()
    .pattern(/^(?:\+972|0)5\d{8}$/)
    .required(),
  email: joi.string().min(6).max(255).required().email(),
  web: joi.string().min(2).max(255).optional().allow(""),
  address: joi.object({
    state: joi.string().min(2).max(255).optional().allow(""),
    country: joi.string().min(2).max(255).required(),
    city: joi.string().min(2).max(255).optional().allow(""),
    street: joi.string().min(2).max(255).required(),
    houseNumber: joi.number().required().positive(),
    zip: joi.number().required().positive(),
  }),
});

const bizBodyValidation = joi.object({
  bizNumber: joi.number().required().positive().min(7).max(7),
});
router.get("/", async (req, res) => {
  try {
    const cards = await Card.find();
    if (!cards) return res.status(404).send("no cards found");
    res.status(200).send(cards);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { error } = cardBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("card not found");
    res.status(200).send(card);
  } catch (error) {
    console.log(error);
  }
});

router.get("/my-cards", auth, async (req, res) => {
  try {
    const myCards = await Card.find({ userId: req.payload._id });
    if (!myCards) return res.status(404).send("no cards found for this user");
    res.status(200).send(myCards);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = cardBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let card = new Card({ ...req.body, userId: req.payload._id });
    await card.save();
    res.status(201).send(card);
  } catch (error) {
    console.log();
    res.status(500).send("internal server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { error } = cardBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.payload._id },
      req.body,
      { new: true }
    );
    await card.save()
    res.status(200).send(card)
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin) return res.status(403).send("access denied");
    const { error } = bizBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let card = await Card.findByIdAndUpdate(
      req.params.id,
      { bizNumber: req.body.bizNumber },
      { new: true }
    );
    if (!card) return res.status(404).send("card not found");

    await card.save();
    res.status(200).send(card);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});
router.patch(":/id", auth, async (req, res) => {
  try {
    let card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("card not found");
    const userId = req.payload._id;
    card.likes.includes(userId)
      ? (card.likes = card.likes.filter((id) => id !== userId))
      : card.likes.push(userId);
    await card.save();
    res.status(200).send(card);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOneAndDelete({
      _id: req.params.id,
      userId: req.payload._id,
    });
    if (!card) return res.status(404).send("card not found");
    res.status(200).send("card deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});
module.exports = router;
