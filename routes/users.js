const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const registerBodyValidation = joi.object({
  name: joi.object({
    first: joi.string().min(2).max(255).required(),
    middle: joi.string().min(2).max(255).optional().allow(""),
    last: joi.string().min(2).max(255).required(),
  }),
  phone: joi
    .string()
    .pattern(/^(?:\+972|0)5\d{8}$/)
    .required(),
  image: joi.string().min(6).max(1024).optional().allow(""),
  address: joi.object({
    state: joi.string().min(2).max(255).optional().allow(""),
    country: joi.string().min(2).max(255).required(),
    city: joi.string().min(2).max(255).optional().allow(""),
    street: joi.string().min(2).max(255),
    houseNumber: joi.number().required().positive(),
    zip: joi.number().required().positive(),
  }),
  email: joi.string().min(6).max(255).required().email(),
  password: joi.string().min(6).max(1024).required(),
  isBusiness: joi.boolean().required(),
});

const loginBodyValidation = joi.object({
  email: joi.string().min(6).max(255).required().email(),
  password: joi.string().min(6).max(1024).required(),
});
const userBodyValidation = joi.object({
  name: joi.object({
    first: joi.string().min(2).max(255).required(),
    middle: joi.string().min(2).max(255).optional().allow(""),
    last: joi.string().min(2).max(255).required(),
  }),
  phone: joi
    .string()
    .pattern(/^(?:\+972|0)5\d{8}$/)
    .required(),
  image: joi.string().min(6).max(1024).optional().allow(""),
  address: joi.object({
    state: joi.string().min(2).max(255).optional().allow(""),
    country: joi.string().min(2).max(255).required(),
    city: joi.string().min(2).max(255).optional().allow(""),
    street: joi.string().min(2).max(255),
    houseNumber: joi.number().required().positive(),
    zip: joi.number().required().positive(),
  }),
  isBusiness: joi.boolean().required(),
});
router.post("/", async (req, res) => {
  try {
    const { error } = registerBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User is already exist");
    user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = jwt.sign(
      { isAdmin: user.isAdmin, _id: user._id, isBusiness: user.isBusiness },
      process.env.JWTKEY
    );
    res.status(201).send(token);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = loginBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Wrong email or password");
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) return res.status(400).send("Wrong email or password");
    const token = jwt.sign(
      { isAdmin: user.isAdmin, _id: user._id, isBusiness: user.isBusiness },
      process.env.JWTKEY
    );
    res.status(200).send(token);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin) return res.status(403).send("Acess denied");
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(_.omit(user.toObject(), ["password", "__v"]));
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin) return res.status(403).send("Acess denied");
    const users = await User.find();
    if (!users) return res.status(404).send("No users found");
    res.status(200).send(_.omit(user.toObject(), ["password", "__v"]));
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin && req.payload.id !== req.params.id) return res.status(403).send("Acess denied");
    const { error } = userBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin) return res.status(403).send("Acess denied");
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    if (!req.payload.isAdmin && req.payload.id !== req.params.id) return res.status(403).send("Acess denied");
    let user = await User.findByIdAndUpdate(
      req.params.id,
      { isBusiness: req.body.isBusiness },
      { new: true }
    );
    if (!user) return res.status(404).send("User not found");
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
