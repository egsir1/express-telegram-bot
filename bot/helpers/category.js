const { bot } = require("../bot");
const User = require("../../model/user");
const Category = require("../../model/category");
const Product = require("../../model/product");
const { adminKeyboard, userKeyboard } = require("../menu/keyboard");

const getAllCategories = async (chatId, page = 1) => {
  let user = await User.findOne({ chatId }).lean();
  let limit = 5;
  let skip = (page - 1) * limit;
  if (page == 1) {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "category-1" },
      { new: true }
    );
  }
  let categories = await Category.find().skip(skip).limit(limit).lean().exec();

  if (categories.length == 0) {
    page--;

    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: `category-${page}` },
      { new: true }
    );
    getAllCategories(chatId, page - 1);
    return;
  }
  const list = categories.map((category) => [
    {
      text: category.title,
      callback_data: `category_${category._id}`,
    },
  ]);

  bot.sendMessage(chatId, "Kategoriyalar royhati", {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          {
            text: "Back",
            callback_data: page > 1 ? "back_category" : page,
          },
          {
            text: page,
            callback_data: "0",
          },
          {
            text: "Next",
            callback_data: limit == categories.length ? "next_category" : page,
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

    getAllCategories(chatId);
  } else {
    bot.sendMessage(chatId, "You are not authorized!");
  }
};

const paginationCategory = async (chatId, action) => {
  const user = await User.findOne({ chatId }).lean();

  let page = 1;
  if (user.action.includes("category-")) {
    page = +user.action.split("-")[1];
    if (action === "back_category" && page > 1) {
      page--;
    }
  }

  if (action === "next_category") {
    page++;
  }

  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: `category-${page}` },
    { new: true }
  );
  getAllCategories(chatId, page);
};

const showCategory = async (chatId, id, page = 1) => {
  let category = await Category.findById(id).lean();
  console.log("🚀 ~ showCategory ~ category:", category);
  const user = await User.findOne({ chatId }).lean();
  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: `category_${category._id}` },
    { new: true }
  );
  let limit = 5;
  let skip = (page - 1) * limit;
  let products = await Product.find({ category: category._id })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  const list = products.map((product) => [
    {
      text: product.title,
      callback_data: `product_${product._id}`,
    },
  ]);
  const userKeyboards = [];
  const adminKeyboards = [
    [
      {
        text: "New Product",
        callback_data: `add_product_${category._id}`,
      },
    ],
    [
      {
        text: "Edit Category",
        callback_data: `edit_category-${category._id}`,
      },
      {
        text: "Delete Category",
        callback_data: `del_category-${category._id}`,
      },
    ],
  ];
  const keyboards = user.admin ? adminKeyboards : userKeyboards;

  bot.sendMessage(chatId, `${category.title} Category related products list`, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...list,
        [
          {
            text: "Back",
            callback_data: page > 1 ? "back_product" : page,
          },
          {
            text: page,
            callback_data: "0",
          },
          {
            text: "Next",
            callback_data: limit == products.length ? "next_product" : page,
          },
        ],
        ...keyboards,
      ],
    },
  });
};

const removeCategory = async (chatId, id) => {
  const user = await User.findOne({ chatId }).lean();
  const category = await Category.findById(id).lean();
  if (user.action !== "del_category") {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "del_category" },
      { new: true }
    );
    bot.sendMessage(
      chatId,
      `Are you sure to delete ${category.title} category?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Cancel",
                callback_data: `category_${category._id}`,
              },
              {
                text: "Delete",
                callback_data: `del_category-${category._id}`,
              },
            ],
          ],
        },
      }
    );
  } else {
    const products = await Product.find({ category: category._id })
      .select(["_id"])
      .lean();

    await Promise.all(
      products.map(async (product) => {
        await Product.findByIdAndDelete(product._id);
      })
    );

    await Category.findByIdAndDelete(id);

    bot.sendMessage(chatId, `${category.title} category deleted!`);
  }
};

const editCategory = async (chatId, id) => {
  const user = await User.findOne({ chatId }).lean();

  const category = await Category.findById(id).lean();

  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: `edit_category-${id}` },
    { new: true }
  );

  bot.sendMessage(chatId, `Give a new name to ${category.title} category`);
};

const saveCategory = async (chatId, title) => {
  console.log("🚀 ~ saveCategory ~ title:", title);
  const user = await User.findOne({ chatId }).lean();
  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: "menu" },
    { new: true }
  );
  let id = user.action.split("-")[1];
  const category = await Category.findById(id).lean();

  await Category.findByIdAndUpdate(id, { ...category, title }, { new: true });
  bot.sendMessage(chatId, `Category updated! \nChoose from the menu`);
};

module.exports = {
  getAllCategories,
  addCategory,
  newCategory,
  paginationCategory,
  showCategory,
  removeCategory,
  editCategory,
  saveCategory,
};
