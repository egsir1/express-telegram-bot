const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const mongoose = require("mongoose");

app.use(express.json());

require("./bot/bot");

const dev = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB Connected"))
      .catch((error) => console.log(error));

    app.listen(process.env.PORT || 4004, () => {
      console.log(`Server initialized on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

dev();
