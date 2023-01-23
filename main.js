const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const User = require("./models/user");
const { KGUSTA_START, KGUSTA_FINISH } = require("./models/kgusta");
const {
  shareLocationKeyboard,
  registerAndMarkKeyboard,
  markKeyboard,
  selectCourseInlineKeyboard,
  emptyKeyboard,
} = require("./models/keyboard");
const { welcomeMessage, helpMessage } = require("./models/messages");
require("dotenv").config();
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, welcomeMessage, registerAndMarkKeyboard);
});
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, helpMessage);
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
      bot.sendMessage(
        opts.chat_id,
        "You are already registered!",
        markKeyboard
      );
    } else {
      bot.sendMessage(
        opts.chat_id,
        "Please enter your first name:",
        emptyKeyboard
      );
      bot.once("message", (msg) => {
        const firstName = msg.text;
        bot.sendMessage(opts.chat_id, "Please enter your last name:");
        bot.once("message", (msg) => {
          const lastName = msg.text;
          bot.sendMessage(
            opts.chat_id,
            "Please select your course:",
            selectCourseInlineKeyboard
          );
          bot.once("callback_query", (callbackQuery) => {
            const newUser = new User({
              telegramId: msg.from.id,
              firstName: firstName,
              course: callbackQuery.data,
              lastName: lastName,
            });
            newUser
              .save()
              .then(() => {
                bot.sendMessage(
                  opts.chat_id,
                  "Registration successful!",
                  markKeyboard
                );
                bot.editMessageReplyMarkup(
                  {},
                  {
                    chat_id: callbackQuery.message.chat.id,
                    message_id: callbackQuery.message.message_id,
                  }
                );
                console.log(callbackQuery);
                bot.editMessageText(`Your course is: ${callbackQuery.data}`, {
                  chat_id: callbackQuery.message.chat.id,
                  message_id: callbackQuery.message.message_id,
                });
              })
              .catch((error) => {
                console.log(error);
                bot.sendMessage(
                  opts.chat_id,
                  "You are already registered!",
                  markKeyboard
                );
              });
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
});

bot.onText(/Who am I/, (msg) => {
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
      let { firstName, lastName, attendance, course } = user;
      attendance = attendance.slice(-1)[0];
      if (attendance) {
        attendance = `Last attendance on ${attendance}`;
      } else {
        attendance = `You wasn't attended yet.`;
      }
      bot.sendMessage(
        opts.chat_id,
        `Your name is: ${firstName} ${lastName}.\nYour course is ${course}.\n${attendance}`,
        markKeyboard
      );
    }
  });
});

bot.on("location", (msg) => {
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  if (!msg.reply_to_message) {
    bot.sendMessage(
      opts.chat_id,
      "You should press on the button!",
      shareLocationKeyboard
    );
  } else {
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
          const currentDate = new Date().toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });
          if (user.attendance.includes(currentDate)) {
            bot.sendMessage(
              opts.chat_id,
              "You was marked today already!",
              markKeyboard
            );
          } else {
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
                  markKeyboard
                );
              }
            );
          }
        } else {
          bot.sendMessage(opts.chat_id, "You are not in KGUSTA!", markKeyboard);
        }
      } else {
        bot.sendMessage(
          opts.chat_id,
          "You need to register first!",
          registerAndMarkKeyboard
        );
      }
    });
  }
});

// Web Interface

// // Create a Mongoose model from the schema
// const app = express();
// app.use(cors({ origin: "http://127.0.0.1:5500" }));

// // Serve data through an API endpoint
// app.get("/api/users", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.send(users);
//   } catch (error) {
//     res.send(error);
//   }
// });

// Start the server
// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
