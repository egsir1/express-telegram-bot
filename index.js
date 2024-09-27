const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const mongoose = require("mongoose");
//const TELEGRAM_BOT = require("node-telegram-bot-api");

app.use(express.json());

require("./bot/bot");

// model
const User = require("./model/user");

// const bot = new TELEGRAM_BOT(process.env.TOKEN_API, {
//   polling: true,
// });

// bot.on("message", async (msg) => {
//   console.log(msg);
//   const chatId = msg.from.id;
//   const text = msg.text;

//   if (text === "/start") {
//     let checkUser = await User.findOne({ chatId }).lean();

//     if (!checkUser) {
//       const newUser = new User({
//         name: msg.from.first_name,
//         chatId,
//         createdAt: new Date(),
//         action: "start",
//       });

//       const user = await newUser.save();
//       console.log("🚀 ~ bot.on ~ user:", user);
//     }
//   } else {
//     bot.sendMessage(
//       chatId,
//       `Salom ${msg.from.first_name}, ${text.toUpperCase()}`
//     );
//   }
// });

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
