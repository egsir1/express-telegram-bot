const { bot } = require("./bot");
const User = require("../model/user");
const {
  addCategory,
  paginationCategory,
  showCategory,
  removeCategory,
  editCategory,
  saveCategory,
} = require("./helpers/category");

bot.on("callback_query", async (query) => {
  const { data } = query;
  console.log("🚀 ~ bot.on ~ data:", data);
  const chatId = query.from.id;

  if (data === "add_category") {
    addCategory(chatId);
  }

  if (["next_category", "back_category"].includes(data)) {
    paginationCategory(chatId, data);
  }

  if (data.includes("category_")) {
    let id = data.split("_")[1];
    console.log("🚀 ~ bot.on ~ id******** :", id);
    showCategory(chatId, id);
  }
  if (data.includes("del_category")) {
    let id = data.split("-")[1];
    removeCategory(chatId, id);
  }

  if (data.includes("edit_category-")) {
    let id = data.split("-")[1];
    editCategory(chatId, id);
  }
});
