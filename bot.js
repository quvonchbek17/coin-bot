const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const Users = require("./models/users"); // Yuqoridagi model
const dotenv = require("dotenv")
dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN);
const webAppUrl = process.env.WEB_APP_URL;
const mongoUrl = process.env.MONGO_URL;

// MongoDB'ga ulanish
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const startWelcomeMessage = `
🌟 Welcome to the Ultimate Tap-to-Earn Adventure! 🌟

Get ready to dive into the thrilling world of coin collecting! 🚀 Level up your skills, and become a legend in our community. 💰 Every tap brings you closer to epic rewards and exclusive bonuses!

Join the fun now and start building your empire! 👇
`;

const backWelcomeMessage = (user) => `
Welcome back, ${user.username || user.first_name}! 🎉
Tap to boost your ${user.coins} coins (Level ${user.level})! 🚀
`;

// /start
bot.start(async (ctx) => {
  const payload = ctx.startPayload;
  const from = ctx.from;

  try {
    const existingUser = await Users.findOne({ id: String(from.id) });

    if (!existingUser) {
      // Unikal referal kod yaratish
      let code = generateCode();
      let existingCode = await Users.findOne({ refCode: code });
      while (existingCode) {
        code = generateCode();
        existingCode = await Users.findOne({ refCode: code });
      }

      // Yangi user yaratish
      const newUser = new Users({
        id: String(from.id),
        username: from.username,
        first_name: from.first_name,
        last_name: from.last_name,
        refCode: code,
      });
      await newUser.save();

      // Agar referal kod bo'lsa
      if (payload) {
        const referUser = await Users.findOne({
          refCode: payload,
          id: { $ne: String(from.id) },
        });
        if (referUser) {
          referUser.referredUsers.push(newUser._id);
          referUser.coins += 10000;
          await referUser.save();
        }
      }

      // Yangi foydalanuvchi uchun xabar
      ctx.reply(startWelcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💥 Start Tapping Now!",
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      });
    } else {
      // Mavjud foydalanuvchi uchun xabar
      ctx.reply(backWelcomeMessage(existingUser), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💥 Keep Tapping!",
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      });
    }
  } catch (err) {
    console.error("Xatolik:", err);
    ctx.reply("Serverda xatolik yuz berdi.");
  }
});

function generateCode(length = 15) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

bot.launch();