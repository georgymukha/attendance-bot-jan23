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

module.exports = {
  registerAndMarkKeyboard,
  shareLocationKeyboard,
  markKeyboard,
};
