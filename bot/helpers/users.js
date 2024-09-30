const { bot } = require("../bot");
const User = require("../../model/user");
const { adminKeyboard, userKeyboard } = require("../menu/keyboard");

const getAllUsers = async (msg) => {
  const chatId = msg.from.id;

  let user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    let users = await User.find().lean();
    console.log("🚀 ~ getAllUsers ~ users:", users);
    let list = "";

    users.forEach((user) => {
      list += `${user.name}: ${user.chatId}\n`;
    });

    bot.sendMessage(
      chatId,
      `Users List:
${list}`
    );
  } else {
    bot.sendMessage(chatId, "You are not authorized!", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
  }
};

module.exports = {
  getAllUsers,
};
