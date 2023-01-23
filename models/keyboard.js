let registerAndMarkKeyboard = {
  reply_markup: {
    keyboard: [
      [
        {
          text: "🤓Register",
          callback_data: "register",
        },
        {
          text: "📍Mark Attendance",
          callback_data: "attendance",
        },
      ],
    ],
    resize_keyboard: true,
  },
};

let markKeyboard = {
  reply_markup: {
    keyboard: [
      [
        {
          text: "📍Mark Attendance",
          callback_data: "attendance",
        },
        {
          text: "❓Who am I",
          callback_data: "attendance",
        },
      ],
    ],
    resize_keyboard: true,
  },
};

let shareLocationKeyboard = {
  reply_markup: {
    keyboard: [
      [
        {
          text: "🛰️Share Location",
          request_location: true,
        },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

let emptyKeyboard = {
  reply_markup: { hide_keyboard: true },
};

let selectCourseInlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "SDET", callback_data: "SDET" },
        { text: "Full Stack", callback_data: "Full Stack" },
      ],
      [
        { text: "UX/UI", callback_data: "UX/UI" },
        { text: "DSML", callback_data: "DSML" },
      ],
      [
        { text: "DevOps", callback_data: "DevOps" },
        { text: "PM", callback_data: "PM" },
      ],
    ],
  },
};

module.exports = {
  registerAndMarkKeyboard,
  shareLocationKeyboard,
  markKeyboard,
  selectCourseInlineKeyboard,
  emptyKeyboard,
};
