const { text } = require("express");
const Product = require("../../model/product");
const User = require("../../model/user");

const { bot } = require("../bot");

const addProduct = async (chatId, category) => {
  const newProduct = new Product({
    category,
    status: 0,
  });

  await newProduct.save();
  const user = await User.findOne({ chatId }).lean();
  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: "new_product_title" },
    { new: true }
  );

  bot.sendMessage(chatId, "Insert the name for the new product");
};

const steps = {
  title: {
    action: "new_product_price",
    text: "Insert the product price",
  },
  price: {
    action: "new_product_img",
    text: "Insert product image",
  },
  img: {
    action: "new_product_text",
    text: "Insert product description",
  },
};

const addProductNext = async (chatId, value, slug) => {
  console.log("🚀 ~ addProductNext ~ slug:", slug);
  const user = await User.findOne({ chatId }).lean();
  const product = await Product.findOne({ status: 0 }).lean();

  if (["title", "text", "price", "img"].includes(slug)) {
    product[slug] = value;
    if (slug === "text") {
      product.status = 1;
      bot.sendMessage(chatId, "New product added!");
    } else {
      await User.findByIdAndUpdate(user._id, {
        ...user,
        action: steps[slug].action,
      });
      bot.sendMessage(chatId, steps[slug].text);
    }

    await Product.findByIdAndUpdate(product._id, product, { new: true });
  }
};

const clearDraftProduct = async () => {
  const products = await Product.find({ status: 0 }).lean();

  if (products) {
    await Promise.all(
      products.map(async (product) => {
        await Product.findByIdAndDelete(product._id);
      })
    );
  }
};

const showProductDetails = async (chatId, id, count = 1, message_id = null) => {
  const product = await Product.findById(id).populate(["category"]).lean();
  const user = await User.findOne({ chatId }).lean();

  const inline_keyboard = [
    [
      {
        text: "➖",
        callback_data: `less_count-${product._id}-${count}`,
      },
      {
        text: count,
        callback_data: count,
      },
      {
        text: "➕",
        callback_data: `more_count-${product._id}-${count}`,
      },
    ],
    !user.admin
      ? [
          {
            text: "✏️ Edit Product",
            callback_data: `edit_product-${product._id}`,
          },
          {
            text: "🗑 Delete Product",
            callback_data: `del_product-${product._id}`,
          },
        ]
      : [
          {
            text: "🛒 Order",
            callback_data: `order-${product._id}-${count}`,
          },
        ],
  ];

  if (message_id) {
    bot.editMessageReplyMarkup(
      { inline_keyboard },
      { chat_id: chatId, message_id }
    );
  } else {
    bot.sendPhoto(chatId, product.img, {
      caption: `<b>${product.title}</b>\n📦 Category: ${product.category.title}\n💲 Price: ${product.price} won\n🔥 Description:\n${product.text}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard,
      },
    });
  }
};

const deleteProduct = async (chatId, id, sure) => {
  const user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    if (sure) {
      await Product.findByIdAndDelete(id);
      bot.sendMessage(chatId, "Product deleted!");
    } else {
      bot.sendMessage(chatId, `Are you sure to delete thir item?`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✖️ No",
                callback_data: "catalog",
              },
              {
                text: "✅ Yes",
                callback_data: `rem_product-${id}`,
              },
            ],
          ],
        },
      });
    }
  } else {
    bot.sendMessage(chatId, "You are not authorized!");
  }
};

module.exports = {
  addProduct,
  addProductNext,
  clearDraftProduct,
  showProductDetails,
  deleteProduct,
};
