import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
  try {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    console.log("request message is", req.body.msg)
    const answer = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: req.body.msg }],
        stream: false,
    });
    const response = answer.choices[0].message.content
    res.status(200).send({ response })
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}
}