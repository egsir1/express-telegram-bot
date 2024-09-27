const TELEGRAM_BOT = require("node-telegram-bot-api");

const bot = new TELEGRAM_BOT(process.env.TOKEN_API, {
  polling: true,
});

module.exports = {
  bot,
};

require("./message");
