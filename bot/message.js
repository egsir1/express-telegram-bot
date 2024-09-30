const { bot } = require("./bot");
const { start, requestContact } = require("./helpers/start");
const User = require("../model/user");
const { getAllUsers } = require("./helpers/users");
const { getAllCategories, newCategory } = require("./helpers/category");

bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;

  const user = await User.findOne({ chatId }).lean();

  if (text === "/start") {
    start(msg);
  }

  if (user) {
    if (user.action === "request_contact" && !user.phone) {
      requestContact(msg);
    }

    if (text === "Users") {
      getAllUsers(msg);
    }

    if (text === "Catalog") {
      getAllCategories(msg);
    }

    if (user.action === "add_category") {
      newCategory(msg);
    }
  }

  //if ()
});
