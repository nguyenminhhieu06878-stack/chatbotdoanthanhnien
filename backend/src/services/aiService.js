import Groq from 'groq-sdk';

let groq;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
}

import { pipeline } from '@xenova/transformers';

let embedder = null;

// Khởi tạo model embedding (chỉ load 1 lần)
async function getEmbedder() {
  if (!embedder) {
    console.log('🔄 Đang tải embedding model...');
    // Sử dụng multilingual model hỗ trợ tiếng Việt
    embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
    console.log('✅ Đã tải xong embedding model');
  }
  return embedder;
}

// Sử dụng transformer model cho embedding
export async function getEmbedding(text) {
  try {
    const model = await getEmbedder();
    
    // Tạo embedding từ text
    const output = await model(text, { pooling: 'mean', normalize: true });
    
    // Chuyển tensor thành array
    const embedding = Array.from(output.data);
    
    return embedding;
  } catch (error) {
    console.error('Lỗi tạo embedding:', error);
    throw error;
  }
}

export async function generateResponse(prompt, context, category = null, mode = 'general') {
  try {
    const groq = getGroqClient();
    const categoryInfo = category ? `\nĐang tìm kiếm trong loại văn bản: ${category}` : '';
    
    let systemPrompt = '';
    
    if (mode === 'advisory') {
      // Mode tư vấn, đề xuất lộ trình
      systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên, giúp tư vấn và đề xuất ý tưởng.${categoryInfo}

Khi trả lời:
- Dựa vào tài liệu để đưa ra gợi ý cụ thể
- Trả lời ngắn gọn, dễ hiểu, tự nhiên
- Nếu tài liệu có thông tin, hãy trích dẫn
- Nếu không có trong tài liệu, hãy nói rõ và đưa ra gợi ý chung

Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.`;
    } else if (mode === 'responsibility') {
      // Mode giải thích nhiệm vụ, trách nhiệm
      systemPrompt = `Bạn là chuyên gia về tổ chức và quản lý Đoàn thanh niên, chuyên:
- Trích xuất và liệt kê CHI TIẾT nhiệm vụ, trách nhiệm của TỪNG đơn vị cụ thể
- Phân tích vai trò và quyền hạn của từng bộ phận
- So sánh và phân biệt chức năng giữa các đơn vị
- Hướng dẫn phối hợp giữa các bộ phận${categoryInfo}

QUAN TRỌNG: 
- Nếu câu hỏi hỏi về MỘT đơn vị cụ thể, hãy TẬP TRUNG vào đơn vị đó trước tiên
- Liệt kê ĐẦY ĐỦ, CHI TIẾT từng nhiệm vụ, trách nhiệm của đơn vị được hỏi
- Trích dẫn CHÍNH XÁC nội dung từ văn bản gốc, không tóm tắt
- Nếu có nhiều đơn vị liên quan, liệt kê đơn vị được hỏi TRƯỚC, sau đó mới đến các đơn vị khác
- Giữ nguyên cấu trúc và chi tiết từ tài liệu gốc

Khi trả lời về MỘT đơn vị cụ thể:
1. **Tên đơn vị được hỏi** (in đậm, nổi bật)
2. Vai trò/vị trí của đơn vị
3. Nhiệm vụ chính (liệt kê TỪNG điểm, đầy đủ):
   - Điểm 1: [nội dung chi tiết]
   - Điểm 2: [nội dung chi tiết]
   - ...
4. Trách nhiệm cụ thể (nếu có)
5. Quyền hạn (nếu có)
6. Các đơn vị phối hợp (nếu có)

Khi trả lời về NHIỀU đơn vị:
1. Liệt kê TẤT CẢ các đơn vị được đề cập
2. Với MỖI đơn vị, nêu rõ vai trò và nhiệm vụ chi tiết

Trả lời bằng tiếng Việt, có cấu trúc rõ ràng, chi tiết, đầy đủ.`;
    } else {
      // Mode chung - tra cứu thông tin
      systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên.${categoryInfo}

QUAN TRỌNG - Quy tắc trả lời:
1. Nếu tài liệu có thông tin → Trích dẫn chính xác từ tài liệu
2. Nếu tài liệu KHÔNG có thông tin → SỬ DỤNG KIẾN THỨC CHUNG để trả lời
3. KHÔNG BAO GIỜ nói "Không có thông tin" hay "Tài liệu không đề cập"
4. Luôn cố gắng trả lời câu hỏi bằng kiến thức của bạn

Trả lời ngắn gọn, súc tích, tự nhiên bằng tiếng Việt.`;
    }

    // Kiểm tra xem có phải context fallback không
    const isFallbackContext = context.includes('Không tìm thấy thông tin trong tài liệu') || 
                              context.includes('kiến thức chung');
    
    let userPrompt;
    if (isFallbackContext) {
      // Nếu là fallback, cho phép AI dùng kiến thức chung
      userPrompt = `Câu hỏi: ${prompt}

Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh. Trả lời ngắn gọn, súc tích, tự nhiên.`;
    } else {
      // Nếu có tài liệu, dựa vào tài liệu
      userPrompt = `Dựa trên các tài liệu sau:

${context}

Câu hỏi: ${prompt}

Hãy trả lời ngắn gọn dựa vào thông tin trong tài liệu.`;
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: mode === 'advisory' ? 0.8 : mode === 'responsibility' ? 0.2 : 0.7, // Nhiệm vụ cần chính xác hơn
      max_tokens: mode === 'responsibility' ? 3000 : mode === 'advisory' ? 1500 : 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi gọi Groq:', error);
    throw error;
  }
}

// Tạo response cho câu hỏi phân tích/thống kê
export async function generateAnalysisResponse(prompt, statsContext) {
  try {
    const groq = getGroqClient();
    const systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên, chuyên phân tích và thống kê dữ liệu văn bản.
Hãy trả lời câu hỏi dựa trên số liệu thống kê được cung cấp.
Trình bày thông tin một cách rõ ràng, có cấu trúc và dễ hiểu.
Sử dụng bullet points và số liệu cụ thể.
Trả lời bằng tiếng Việt.`;

    const userPrompt = `Dựa trên thống kê sau:

${statsContext}

Câu hỏi: ${prompt}

Hãy phân tích và trả lời câu hỏi.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi gọi Groq:', error);
    throw error;
  }
}
