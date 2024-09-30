const { bot } = require("./bot");
const User = require("../model/user");
const { addCategory } = require("./helpers/category");

bot.on("callback_query", async (query) => {
  const { data } = query;
  console.log("🚀 ~ bot.on ~ data:", data);
  const chatId = query.from.id;

  if (data === "add_category") {
    addCategory(chatId);
  }
});
