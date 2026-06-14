const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
const cardsRouter = require("./routes/cards");
const usersRouter = require("./routes/users");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/api/cards", cardsRouter);
app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
