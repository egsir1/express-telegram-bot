const { bot } = require("../bot");
const User = require("../../model/user");
const Category = require("../../model/category");
const { adminKeyboard, userKeyboard } = require("../menu/keyboard");

const getAllCategories = async (msg) => {
  const chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();

  let categories = await Category.find().lean();

  const list = categories.map((category) => [
    {
      text: category.title,
      callback_data: `category_${category._id}`,
    },
  ]);
  console.log("🚀 ~ getAllCategories ~ list:", ...list);
  bot.sendMessage(chatId, "Kategoriyalar royhati", {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          {
            text: "Back",
            callback_data: "back_category",
          },
          {
            text: "1",
            callback_data: "0",
          },
          {
            text: "Next",
            callback_data: "next_category",
          },
        ],
        user.admin
          ? [
              {
                text: "New Category",
                callback_data: "add_category",
              },
            ]
          : [],
      ],
    },
  });
};

const addCategory = async (chatId) => {
  let user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    await User.findByIdAndUpdate(
      user._id,
      {
        ...user,
        action: "add_category",
      },
      { new: true }
    );

    bot.sendMessage(chatId, "Insert a title for new category");
  } else {
    bot.sendMessage(chatId, "You are not authorized!");
  }
};

const newCategory = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;

  let user = await User.findOne({ chatId }).lean();

  if (user.admin && user.action === "add_category") {
    let newCategory = new Category({ title: text });

    await newCategory.save();

    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "category" },
      { new: true }
    );

    getAllCategories(msg);
  } else {
    bot.sendMessage(chatId, "You are not authorized!");
  }
};

module.exports = { getAllCategories, addCategory, newCategory };
