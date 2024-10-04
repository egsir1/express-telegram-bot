const Product = require("../../model/product");
const User = require("../../model/user");
const Order = require("../../model/order");
const { bot } = require("../bot");

const ready_order = async (chatId, product, count) => {
  const user = await User.findOne({ chatId }).lean();

  const orders = await Order.find({ user, status: 0 }).lean();

  await Promise.all(
    orders.map(async (order) => {
      await Order.findByIdAndDelete(order._id);
    })
  );

  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "order",
    },
    { new: true }
  );

  const newOrder = new Order({
    user: user._id,
    product,
    count,
    status: 0,
  });

  await newOrder.save();
  bot.sendMessage(chatId, `Send the location to deliver your order`, {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Send location",
            request_location: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const end_order = async (chatId, location) => {
  const user = await User.findOne({ chatId }).lean();
  const admin = await User.findOne({ admin: true }).lean();

  const order = await Order.findOne({ user: user._id, status: 0 })
    .populate(["product"])
    .lean();

  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: "end_order" },
    { new: true }
  );

  if (order) {
    await Order.findByIdAndUpdate(
      order._id,
      { ...order, location, status: 1 },
      { new: true }
    );

    await bot.sendMessage(
      chatId,
      "Your order accepted. You will be reached out soon! Please stay tuned",
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );

    await bot.sendMessage(
      admin.chatId,
      `New Order.\nOrdered by: ${user.name}\nItem: ${
        order.product.title
      }\nAmount: ${order.count}\nTotat Price: ${
        order.count * order.product.price
      } won`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Cancel",
                callback_data: `cancel_order-${order._id}`,
              },
              {
                text: "Accept",
                callback_data: `success_order-${order._id}`,
              },
            ],
            [
              {
                text: "Get Location",
                callback_data: `map_order-${order._id}`,
              },
            ],
          ],
        },
      }
    );
  }
};

const show_location = async (chatId, id) => {
  const user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    const order = await Order.findById(id).lean();
    bot.sendLocation(chatId, order.location.latitude, order.location.longitude);
  } else {
    bot.sendMessage("You are not authorized!");
  }
};

const change_order = async (chatId, id, status) => {
  const user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    const order = await Order.findById(id).populate(["user", "product"]).lean();
    await Order.findByIdAndUpdate(
      order._id,
      { ...order, status, createdAt: new Date() },
      { new: true }
    );
    const msg =
      status == 2
        ? "Your order has been accepted"
        : "Your order has been cancelled";
    await bot.sendMessage(order.user.chatId, msg);
    await bot.sendMessage(chatId, "Order status changed");
  } else {
    bot.sendMessage(chatId, "You are not authorized!");
  }
};

module.exports = { ready_order, end_order, show_location, change_order };
