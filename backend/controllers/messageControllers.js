const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const allMessages = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching messages for chatId:", req.params.chatId);
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    console.log("Messages fetched:", messages);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(400).json({ message: error.message });
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.error("Invalid data passed into request:", { content, chatId });
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    console.log("Creating new message:", newMessage);
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    console.log("Message sent successfully:", message);
    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = { allMessages, sendMessage };
