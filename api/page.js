

const express=require('express');
const {ChatGoogleGenerativeAI}=require('@langchain/google-genai');
const {HumanMessage}=require('@langchain/core/messages')
const router=express.Router();
router.get("/", async (req, res) => {
  // const message = req.query.message;
  const message="when did steph break ray allens record?"
  if (typeof message === "string" && message) {
    const chat = new ChatGoogleGenerativeAI({
      apiKey:`process.env.GOOGLE_API_KEY`,
      model: 'gemini-pro',
      maxOutputTokens: 2048,
      openAIApiKey: process.env.GOOGLE_API_KEY,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            console.log("New token:", token);
            res.write(token);
          },
        },
      ],
    });
    // We need to await the call to ensure that the
    // connection is closed after the whole response
    // is sent.
    const chat1=await chat.call([new HumanMessage(message)]);
    res.send(chat1);
    res.end();
  } else {
    res.json({ error: "No message provided" });
  }
});
module.exports=router;
