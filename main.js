const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const User = require("./models/user");
const { KGUSTA_START, KGUSTA_FINISH } = require("./models/kgusta");
const {
  shareLocationKeyboard,
  registerAndMarkKeyboard,
} = require("./models/keyboard");
require("dotenv").config();
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome! Please register your name",
    registerAndMarkKeyboard
  );
});

bot.onText(/Register/, (msg) => {
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  User.findOne({ telegramId: msg.from.id }, (err, user) => {
    if (err) {
      console.log(err);
      return;
    }
    if (user) {
      bot.sendMessage(opts.chat_id, "You are already registered!");
    } else {
      bot.sendMessage(opts.chat_id, "Please enter your first name:");
      bot.once("message", (msg) => {
        const firstName = msg.text;
        bot.sendMessage(opts.chat_id, "Please enter your last name:");
        bot.once("message", (msg) => {
          const lastName = msg.text;
          const newUser = new User({
            telegramId: msg.from.id,
            firstName: firstName,
            lastName: lastName,
          });
          newUser
            .save()
            .then(() => {
              bot.sendMessage(opts.chat_id, "Registration successful!");
            })
            .catch((error) => {
              console.log(error);
              bot.sendMessage(opts.chat_id, "You are already registered!");
            });
        });
      });
    }
  });
});

bot.onText(/Mark Attendance/, (msg) => {
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  bot.sendMessage(
    opts.chat_id,
    "Please share your location:",
    shareLocationKeyboard
  );

  bot.on("location", (msg) => {
    User.findOne({ telegramId: msg.from.id }, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      if (user) {
        let longitude = msg.location.longitude;
        let latitude = msg.location.latitude;
        if (
          KGUSTA_START.longitude <= longitude &&
          longitude <= KGUSTA_FINISH.longitude &&
          KGUSTA_START.latitude <= latitude &&
          latitude <= KGUSTA_FINISH.latitude
        ) {
          const currentDate = new Date().toLocaleDateString();

          User.findOneAndUpdate(
            { telegramId: msg.from.id },
            { $push: { attendance: currentDate } },
            (err) => {
              if (err) {
                console.log(err);
                return;
              }
              bot.sendMessage(
                opts.chat_id,
                "Attendance marked!",
                registerAndMarkKeyboard
              );
            }
          );
        } else
          bot.sendMessage(
            opts.chat_id,
            "You are not in KGUSTA!",
            registerAndMarkKeyboard
          );
      } else {
        bot.sendMessage(
          opts.chat_id,
          "You need to register first!",
          registerAndMarkKeyboard
        );
      }
    });
  });
});

bot.on("callback_query", async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };

  if (action === "register") {
    User.findOne({ telegramId: msg.from.id }, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      if (user) {
        bot.sendMessage(opts.chat_id, "You are already registered!");
      } else {
        bot.sendMessage(opts.chat_id, "Please enter your first name:");
        bot.once("message", (msg) => {
          const firstName = msg.text;
          bot.sendMessage(opts.chat_id, "Please enter your last name:");
          bot.once("message", (msg) => {
            const lastName = msg.text;
            const newUser = new User({
              telegramId: msg.from.id,
              firstName: firstName,
              lastName: lastName,
            });
            newUser
              .save()
              .then(() => {
                bot.sendMessage(opts.chat_id, "Registration successful!");
              })
              .catch((error) => {
                console.log(error);
                bot.sendMessage(opts.chat_id, "You are already registered!");
              });
          });
        });
      }
    });
  } else if (action === "attendance") {
    bot.sendMessage(opts.chat_id, "Please share your location:", {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Share Location",
              request_location: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    bot.on("location", (msg) => {
      User.findOne({ telegramId: msg.from.id }, (err, user) => {
        if (err) {
          console.log(err);
          return;
        }
        if (user) {
          let longitude = msg.location.longitude;
          let latitude = msg.location.latitude;
          if (
            KGUSTA_START.longitude <= longitude &&
            longitude <= KGUSTA_FINISH.longitude &&
            KGUSTA_START.latitude <= latitude &&
            latitude <= KGUSTA_FINISH.latitude
          ) {
            const currentDate = new Date().toLocaleDateString();

            User.findOneAndUpdate(
              { telegramId: msg.from.id },
              { $push: { attendance: currentDate } },
              (err) => {
                if (err) {
                  console.log(err);
                  return;
                }
                bot.sendMessage(opts.chat_id, "Attendance marked!");
              }
            );
          } else bot.sendMessage(opts.chat_id, "You are not in KGUSTA!");
        } else {
          bot.sendMessage(opts.chat_id, "You need to register first!");
        }
      });
    });
  }
});