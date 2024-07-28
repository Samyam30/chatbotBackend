const express = require('express');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { MessagesPlaceholder } = require('@langchain/core/prompts');
const { BufferMemory } = require('langchain/memory');
const { LLMChain } = require('langchain/chains');
const cors = require('cors');
const app = express();
const PORT = 5000;
require('dotenv').config();

// Enable CORS for requests from http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json()); // Parse JSON request bodies

let finalanswer = []; // Initialize empty array for responses

app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      console.log("Prompt is missing in the request body");
      return res.status(400).json({ message: 'Chat input is required' });
    }

    console.log("Received prompt:", prompt);

    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-pro',
      maxOutputTokens: 100,
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a basketball player.'],
      ['user', 'I am a basketball player, answer questions only related to basketball. For other questions, generate a text saying "enter a valid prompt".'],
      new MessagesPlaceholder("chat_history"),
      ['user', '{input}'],
    ]);

    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });

    const chain = new LLMChain({
      llm: llm,
      prompt: chatPrompt,
      verbose: true,
      memory: memory,
    });

    const response = await chain.invoke({ input: prompt });
    console.log("AI response:", response);

    finalanswer.push({ id: finalanswer.length + 1, response }); // Push response to finalanswer array

    // Clear finalanswer if it reaches a certain length (optional)
    if (finalanswer.length === 11) {
      finalanswer = [];
    }

    return res.status(200).json({ id: finalanswer.length, response }); // Return response to client

  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.get("/", async (req, res) => {
  try {
    res.json(finalanswer); // Send the entire finalanswer array
  } catch (err) {
    res.status(500).send('Error has occurred: ' + err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
