const { bot } = require("./bot");
const User = require("../model/user");
const {
  addCategory,
  paginationCategory,
  showCategory,
  removeCategory,
  editCategory,
  saveCategory,
  getAllCategories,
} = require("./helpers/category");

const {
  addProduct,
  showProductDetails,
  deleteProduct,
  removeProductNext,
} = require("./helpers/product");

const { ready_order, show_location, change_order } = require("./helpers/order");

bot.on("callback_query", async (query) => {
  const { data, message } = query;
  console.log("🚀 ~ bot.on ~ data:", data);
  const chatId = query.from.id;
  const messageId = message.message_id;

  //  await bot.answerCallbackQuery(query.id);

  if (data === "add_category") {
    addCategory(chatId);
    return;
  }

  if (data.includes("map_order-")) {
    const id = data.split("-")[1];
    show_location(chatId, id);
    return;
  }

  if (data.includes("success_order-")) {
    const id = data.split("-");
    change_order(chatId, id[1], 2);
    return;
  }

  if (data.includes("cancel_order-")) {
    const id = data.split("-");
    change_order(chatId, id[1], 3);
    return;
  }

  if (data.includes("order-")) {
    const id = data.split("-");
    ready_order(chatId, id[1], id[2]);
  }

  if (data.includes("more_count-")) {
    const id = data.split("-");
    showProductDetails(chatId, id[1], +id[2] + 1, messageId);
  }

  if (data.includes("less_count-")) {
    const id = data.split("-");
    if (id[2] > 1) {
      showProductDetails(chatId, id[1], +id[2] - 1, messageId);
    }
  }

  if (["next_category", "back_category"].includes(data)) {
    console.log("🚀 ~ bot.on ~ data:", data);
    paginationCategory(chatId, data, messageId);
    console.log("🚀 ~ bot.on ~ messageId:", messageId);
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

  if (data.includes("add_product-")) {
    let id = data.split("-")[1];

    addProduct(chatId, id);
  }

  if (data.includes("product_")) {
    let id = data.split("_")[1];
    showProductDetails(chatId, id);
  }

  if (data.includes("del_product-")) {
    let id = data.split("-")[1];
    deleteProduct(chatId, id);
  }

  if (data.includes("rem_product-")) {
    let id = data.split("-")[1];
    deleteProduct(chatId, id, true);
  }

  if (data === "catalog") {
    getAllCategories(chatId);
  }
});
