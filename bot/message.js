const { bot } = require("./bot");
const { start, requestContact } = require("./helpers/start");
const User = require("../model/user");
const { getAllUsers } = require("./helpers/users");
const {
  getAllCategories,
  newCategory,
  saveCategory,
} = require("./helpers/category");
const { addProductNext } = require("./helpers/product");
const { end_order } = require("./helpers/order");

bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;

  const user = await User.findOne({ chatId }).lean();

  if (text === "/start") {
    start(msg);
  }

  if (msg.location && user.action == "order") {
    end_order(chatId, msg.location);
  }

  if (user) {
    if (user.action === "request_contact" && !user.phone) {
      requestContact(msg);
    }

    if (text === "Users") {
      getAllUsers(msg);
      return;
    }

    if (text === "Catalog") {
      getAllCategories(chatId);
      return;
    }

    if (user.action === "add_category") {
      newCategory(msg);
    }

    if (user.action.includes("edit_category-")) {
      saveCategory(chatId, text);
    }

    // if (user.action == "new_product_title") {
    //   addProductNext(chatId, text, "title");
    // }

    // if (user.action == "new_product_price") {
    //   addProductNext(chatId, text, "price");
    // }

    // if (user.action === "new_product_text") {
    //     addProductNext(chatId, text, "text");
    //   }
    if (
      user.action.includes("new_product_") &&
      user.action !== "new_product_img"
    ) {
      addProductNext(chatId, text, user.action.split("_")[2]);
    }

    if (user.action == "new_product_img") {
      if (msg.photo) {
        addProductNext(chatId, msg.photo.at(-1).file_id, "img");
      } else {
        bot.sendMessage(
          chatId,
          "Please add a simple imagge not in a file format!"
        );
      }
    }
  }

  //if ()
});
