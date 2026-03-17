import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple AI response without database
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý AI của Đoàn Thanh Niên. Hãy trả lời một cách thân thiện và hữu ích."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    res.status(200).json({
      message: aiResponse,
      sources: []
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    });
  }
}