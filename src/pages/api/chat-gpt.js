const { Configuration, OpenAIApi } = require("openai");


export default async function handler(req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const { message } = req.body;

  const content = "Generate cover letter using below job description and cv. \n" + message;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  res.status(200).json({
    answer: response.data.choices[0].message.content
  })
}

