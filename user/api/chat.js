import { supabase } from '../lib/supabase.js';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Xử lý câu hỏi chào hỏi và chung chung
function handleGreetingOrGeneral(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Chào hỏi
  const greetings = ['xin chào', 'chào', 'hello', 'hi', 'hey', 'chào bạn', 'chào ai'];
  if (greetings.some(g => lowerMessage === g || lowerMessage.startsWith(g + ' ') || lowerMessage.endsWith(' ' + g))) {
    return `Xin chào! 👋 Tôi là trợ lý AI của Đoàn thanh niên.

Tôi có thể giúp bạn:
- 📖 Tra cứu điều khoản trong văn bản (VD: "Điều 5 là gì?")
- 📋 Tìm hiểu nhiệm vụ, trách nhiệm của các đơn vị
- 💡 Tư vấn lộ trình, đề xuất ý tưởng
- 📊 Thống kê và phân tích dữ liệu

Bạn muốn hỏi gì về Đoàn thanh niên?`;
  }
  
  // Cảm ơn
  const thanks = ['cảm ơn', 'cám ơn', 'thank', 'thanks', 'cảm ơn bạn', 'cảm ơn nhiều'];
  if (thanks.some(t => lowerMessage.includes(t))) {
    return `Rất vui được giúp đỡ bạn! 😊

Nếu bạn còn câu hỏi gì khác về Đoàn thanh niên, cứ hỏi tôi nhé!`;
  }
  
  return null; // Không phải câu chào hỏi/chung chung
}

// Phân tích intent của câu hỏi
function analyzeIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Kiểm tra câu hỏi về điều khoản cụ thể (ưu tiên cao nhất)
  const articleMatch = message.match(/điều\s+(\d+)/i);
  const isArticleQuery = articleMatch !== null;
  const articleNumber = articleMatch ? articleMatch[1] : null;
  
  // Kiểm tra câu hỏi về nhiệm vụ/trách nhiệm
  const responsibilityKeywords = ['nhiệm vụ', 'trách nhiệm', 'vai trò', 'chức năng'];
  const isResponsibility = responsibilityKeywords.some(keyword => lowerMessage.includes(keyword));
  
  return { isResponsibility, isArticleQuery, articleNumber };
}

// Xử lý câu hỏi về điều khoản cụ thể
async function handleArticleQuery(articleNumber, message) {
  try {
    // Tìm tài liệu có chứa điều khoản
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, category, content')
      .eq('status', 'ready');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    let foundArticles = [];
    
    // Tìm kiếm điều khoản trong từng tài liệu
    for (const doc of documents) {
      let content = doc.content;
      
      // Normalize: loại bỏ các ký tự đặc biệt, giữ lại chữ, số, khoảng trắng và dấu câu cơ bản
      content = content.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Loại bỏ zero-width characters
      content = content.replace(/\s+/g, ' '); // Normalize spaces
      
      const lowerContent = content.toLowerCase();
      
      // Tìm "điều" + số (có thể có khoảng trắng hoặc ký tự đặc biệt giữa chữ và số)
      const articleRegex = new RegExp(`điều[\\s\\*]*${articleNumber}(?!\\d)[\\s\\*]*[:\\s]?`, 'gi');
      const match = lowerContent.match(articleRegex);
      
      if (match) {
        // Tìm vị trí bắt đầu
        const matchIndex = lowerContent.search(articleRegex);
        
        if (matchIndex !== -1) {
          // Tìm điều tiếp theo
          const nextArticleRegex = new RegExp(`điều[\\s\\*]*${parseInt(articleNumber) + 1}(?!\\d)[\\s\\*]*[:\\s]?`, 'gi');
          const nextMatch = lowerContent.substring(matchIndex + 10).search(nextArticleRegex);
          
          let articleContent;
          if (nextMatch !== -1) {
            articleContent = content.substring(matchIndex, matchIndex + 10 + nextMatch).trim();
          } else {
            // Lấy 2500 ký tự
            articleContent = content.substring(matchIndex, matchIndex + 2500).trim();
          }
          
          foundArticles.push({
            title: doc.title,
            category: doc.category,
            content: articleContent,
            documentId: doc.id
          });
        }
      }
    }
    
    if (foundArticles.length === 0) {
      return {
        message: `Xin lỗi, tôi không tìm thấy Điều ${articleNumber} trong các tài liệu hiện có. Vui lòng kiểm tra lại hoặc upload thêm tài liệu liên quan.`,
        sources: []
      };
    }
    
    // Tạo context từ các điều khoản tìm được
    const context = foundArticles.map(article => 
      `[Tài liệu: ${article.title} - ${article.category}]\n${article.content}`
    ).join('\n\n---\n\n');
    
    // Tạo câu trả lời
    const response = await generateResponse(message, context, null, 'general');
    
    return {
      message: response,
      sources: foundArticles.map(a => ({
        title: a.title,
        category: a.category,
        documentId: a.documentId
      }))
    };
  } catch (error) {
    console.error('Lỗi xử lý câu hỏi về điều khoản:', error);
    throw error;
  }
}
// Tìm kiếm tài liệu đơn giản với Supabase
async function searchDocuments(query, limit = 5) {
  try {
    // Tìm kiếm đơn giản bằng text search
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, category, content')
      .eq('status', 'ready')
      .or(searchTerms.map(term => 
        `title.ilike.%${term}%,content.ilike.%${term}%,category.ilike.%${term}%`
      ).join(','))
      .limit(limit);
    
    if (error) {
      console.error('Supabase search error:', error);
      return [];
    }
    
    return documents.map(doc => ({
      title: doc.title,
      category: doc.category,
      content: doc.content.substring(0, 2000), // Giới hạn content
      documentId: doc.id
    }));
  } catch (error) {
    console.error('Lỗi tìm kiếm tài liệu:', error);
    return [];
  }
}

async function generateResponse(prompt, context, category = null, mode = 'general') {
  try {
    console.log('🤖 Generating response with Groq...');
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found');
    }
    
    const categoryInfo = category ? `\nĐang tìm kiếm trong loại văn bản: ${category}` : '';
    
    let systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên.${categoryInfo}

QUAN TRỌNG - Quy tắc trả lời:
1. Nếu tài liệu có thông tin → Trích dẫn chính xác từ tài liệu
2. Nếu tài liệu KHÔNG có thông tin → SỬ DỤNG KIẾN THỨC CHUNG để trả lời
3. KHÔNG BAO GIỜ nói "Không có thông tin" hay "Tài liệu không đề cập"
4. Luôn cố gắng trả lời câu hỏi bằng kiến thức của bạn

Trả lời ngắn gọn, súc tích, tự nhiên bằng tiếng Việt.`;

    // Kiểm tra xem có phải context fallback không
    const isFallbackContext = context.includes('Không tìm thấy thông tin trong tài liệu') || 
                              context.includes('kiến thức chung');
    
    let userPrompt;
    if (isFallbackContext) {
      // Nếu là fallback, cho phép AI dùng kiến thức chung
      userPrompt = `Câu hỏi: ${prompt}

Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh. Trả lời ngắn gọn, súc tích, tự nhiên.`;
    } else {
      // Nếu có tài liệu, dùng tài liệu làm tham khảo nhưng vẫn được dùng kiến thức chung
      userPrompt = `Tài liệu tham khảo:

${context}

Câu hỏi: ${prompt}

Hãy trả lời câu hỏi. Nếu tài liệu có thông tin, hãy trích dẫn. Nếu tài liệu không có, hãy dùng kiến thức chung của bạn để trả lời. Trả lời ngắn gọn, chính xác.`;
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi gọi Groq:', error);
    throw error;
  }
}

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

    console.log('🔄 Starting processChat...');
    
    // Kiểm tra câu hỏi chào hỏi hoặc chung chung
    const greetingResponse = handleGreetingOrGeneral(message);
    if (greetingResponse) {
      console.log('✅ Greeting response returned');
      return res.status(200).json({
        message: greetingResponse,
        sources: []
      });
    }
    
    console.log('🔍 Analyzing intent...');
    // Phân tích intent
    const { isResponsibility, isArticleQuery, articleNumber } = analyzeIntent(message);
    
    // Nếu là câu hỏi về điều khoản cụ thể
    if (isArticleQuery && articleNumber) {
      console.log(`📖 Handling article query: ${articleNumber}`);
      const result = await handleArticleQuery(articleNumber, message);
      return res.status(200).json(result);
    }

    console.log('🔍 Searching documents...');
    // Tìm kiếm tài liệu liên quan
    const searchResults = await searchDocuments(message, 5);
    
    // Nếu không tìm thấy tài liệu liên quan, trả lời thân thiện
    if (!searchResults || searchResults.length === 0) {
      console.log('📝 No documents found, using AI general knowledge...');
      
      try {
        // Tạo response từ kiến thức chung của AI
        const response = await generateResponse(
          message, 
          'Không tìm thấy thông tin trong tài liệu nội bộ. Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh.',
          null,
          'general'
        );
        
        return res.status(200).json({
          message: response + '\n\n💡 *Lưu ý: Thông tin này dựa trên kiến thức chung, không có trong tài liệu nội bộ.*',
          sources: []
        });
      } catch (aiError) {
        console.error('❌ AI general knowledge failed:', aiError);
        return res.status(200).json({
          message: `Xin lỗi, tôi không tìm thấy thông tin về "${message}" trong các tài liệu hiện có. 😔

**Gợi ý:**
- Thử hỏi theo cách khác hoặc cụ thể hơn
- Kiểm tra xem tài liệu liên quan đã được upload chưa
- Liên hệ Admin để upload thêm tài liệu

Bạn có muốn hỏi điều gì khác không?`,
          sources: []
        });
      }
    }
    
    console.log('🤖 Generating response from documents...');
    // Tạo context từ kết quả tìm kiếm
    const context = searchResults
      .map((doc) => {
        return `[Tài liệu: ${doc.title} - ${doc.category}]\n${doc.content}`;
      })
      .join('\n\n---\n\n');
    
    // Tạo câu trả lời
    const response = await generateResponse(message, context, null, 'general');
    
    console.log('✅ Response generated successfully');
    return res.status(200).json({
      message: response,
      sources: searchResults.map(doc => ({
        title: doc.title,
        category: doc.category,
        documentId: doc.documentId
      }))
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    });
  }
}