import { searchSimilarDocuments } from './vectorService.js';
import { generateResponse, generateAnalysisResponse } from './aiService.js';
import Document from '../models/Document.js';

// Function tìm kiếm web (giả lập - trong thực tế cần API key)
async function searchWeb(query) {
  // Trong production, bạn có thể dùng Google Custom Search API hoặc SerpAPI
  // Hiện tại return empty để fallback sang kiến thức chung
  return [];
}

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
  
  // Tạm biệt
  const goodbyes = ['tạm biệt', 'bye', 'goodbye', 'hẹn gặp lại', 'chào tạm biệt'];
  if (goodbyes.some(g => lowerMessage.includes(g))) {
    return `Tạm biệt! Chúc bạn một ngày tốt lành! 👋

Hẹn gặp lại bạn khi cần hỗ trợ về Đoàn thanh niên nhé!`;
  }
  
  // Câu hỏi không liên quan đến Đoàn
  const irrelevantTopics = [
    'thời tiết', 'bóng đá', 'game', 'phim', 'ăn uống', 
    'du lịch', 'mua sắm', 'thể thao', 'giải trí', 'nấu ăn',
    'thời trang', 'làm đẹp', 'sức khỏe', 'y tế', 'bệnh viện'
  ];
  if (irrelevantTopics.some(topic => lowerMessage.includes(topic))) {
    return `Xin lỗi, tôi là trợ lý AI chuyên về **Đoàn thanh niên** nên không thể trả lời câu hỏi này. 😅

**Tôi chỉ có thể giúp bạn về:**
- Văn bản, điều lệ, quy định của Đoàn
- Nhiệm vụ, trách nhiệm của các đơn vị
- Hướng dẫn tổ chức hoạt động Đoàn
- Tư vấn về công tác thanh niên

Bạn có câu hỏi nào về Đoàn thanh niên không?`;
  }
  
  // Hỏi về AI
  const aboutAI = ['bạn là ai', 'bạn là gì', 'ai là bạn', 'giới thiệu', 'bạn có thể làm gì', 'bạn giúp được gì'];
  if (aboutAI.some(q => lowerMessage.includes(q))) {
    return `Tôi là **Trợ lý AI Đoàn thanh niên** 🤖

**Tôi có thể giúp bạn:**
1. 📖 **Tra cứu điều khoản** - "Điều 5 là gì?"
2. 📋 **Nhiệm vụ đơn vị** - "Nhiệm vụ của Ban Chấp hành?"
3. 💡 **Tư vấn lộ trình** - "Đề xuất cách tổ chức sự kiện"
4. 📊 **Thống kê dữ liệu** - "Có bao nhiêu văn bản về quy định?"
5. 🔍 **Tra cứu chung** - "5 điểm nghẽn là gì?"

Tôi được huấn luyện trên các văn bản, tài liệu chính thức của Đoàn thanh niên. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!`;
  }
  
  // Hỏi về Đoàn thanh niên chung chung
  const aboutDoan = ['đoàn thanh niên là gì', 'đoàn tncs hcm', 'đoàn là gì'];
  if (aboutDoan.some(q => lowerMessage.includes(q))) {
    return `**Đoàn Thanh niên Cộng sản Hồ Chí Minh** là tổ chức chính trị - xã hội của thanh niên Việt Nam, do Đảng Cộng sản Việt Nam lãnh đạo.

**Đặc điểm:**
- 🎯 Tổ chức thanh niên tiên tiến
- 🏛️ Trường học chính trị của thanh niên
- 🤝 Lực lượng xung kích của Đảng

**Nhiệm vụ chính:**
- Giáo dục thanh niên về lý tưởng cách mạng
- Tập hợp, đoàn kết thanh niên
- Xây dựng thế hệ kế cận cho Đảng

Bạn muốn tìm hiểu cụ thể về điều gì? Tôi có thể tra cứu trong các văn bản, điều lệ để trả lời chi tiết hơn!`;
  }
  
  // Hỏi cách sử dụng
  const howToUse = ['hướng dẫn', 'cách dùng', 'cách sử dụng', 'làm sao để', 'tôi nên hỏi gì'];
  if (howToUse.some(q => lowerMessage.includes(q))) {
    return `**Hướng dẫn sử dụng Trợ lý AI** 📚

**1. Tra cứu điều khoản:**
- "Điều 5 là gì?"
- "Điều 10 quy định gì?"

**2. Hỏi về nhiệm vụ:**
- "Nhiệm vụ của Ban Chấp hành?"
- "Trách nhiệm của Chi đoàn cơ sở?"

**3. Xin tư vấn:**
- "Đề xuất lộ trình tổ chức sự kiện"
- "Gợi ý cách thực hiện nhiệm vụ"

**4. Thống kê:**
- "Có bao nhiêu văn bản về quy định?"
- "Liệt kê các hướng dẫn"

**5. Tra cứu chung:**
- "5 điểm nghẽn là gì?"
- "Hướng dẫn kết nạp đoàn viên"

Hãy thử hỏi một câu để bắt đầu nhé! 😊`;
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
  const responsibilityKeywords = ['nhiệm vụ', 'trách nhiệm', 'vai trò', 'chức năng', 'quyền hạn', 'đơn vị', 'phòng ban', 'bộ phận', 'cơ quan'];
  const isResponsibility = responsibilityKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Kiểm tra xem có yêu cầu thống kê/phân tích không (chỉ khi KHÔNG phải câu hỏi về nhiệm vụ)
  const analysisKeywords = ['thống kê', 'có bao nhiêu', 'tổng số', 'phân loại', 'các loại'];
  const isAnalysis = !isResponsibility && analysisKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Kiểm tra yêu cầu tư vấn/đề xuất
  const advisoryKeywords = ['lộ trình', 'ý tưởng', 'đề xuất', 'gợi ý', 'cách thực hiện', 'làm thế nào', 'kế hoạch', 'phương án', 'giải pháp', 'tư vấn'];
  const isAdvisory = advisoryKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Kiểm tra loại văn bản được đề cập
  const categories = {
    'văn bản': 'Văn bản',
    'hướng dẫn': 'Hướng dẫn',
    'quy định': 'Quy định',
    'thông báo': 'Thông báo',
    'nghị quyết': 'Nghị quyết',
    'chung': 'Chung'
  };
  
  let requestedCategory = null;
  for (const [keyword, category] of Object.entries(categories)) {
    if (lowerMessage.includes(keyword)) {
      requestedCategory = category;
      break;
    }
  }
  
  return { isAnalysis, isAdvisory, isResponsibility, isArticleQuery, articleNumber, requestedCategory };
}

// Xử lý câu hỏi về điều khoản cụ thể
async function handleArticleQuery(articleNumber, message, requestedCategory) {
  try {
    // Tìm tài liệu có chứa điều khoản
    const query = requestedCategory ? { category: requestedCategory, status: 'ready' } : { status: 'ready' };
    const documents = await Document.find(query).select('title category content');
    
    let foundArticles = [];
    
    // Tìm kiếm điều khoản trong từng tài liệu
    for (const doc of documents) {
      let content = doc.content;
      
      // Normalize: loại bỏ các ký tự đặc biệt, giữ lại chữ, số, khoảng trắng và dấu câu cơ bản
      content = content.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Loại bỏ zero-width characters
      content = content.replace(/\s+/g, ' '); // Normalize spaces
      
      const lowerContent = content.toLowerCase();
      
      // Tìm "điều" + số (có thể có khoảng trắng hoặc ký tự đặc biệt giữa chữ và số)
      // Thêm negative lookahead để tránh match "Điều 2" khi tìm "Điều 20"
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
            documentId: doc._id
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
    const response = await generateResponse(message, context, requestedCategory, 'general');
    
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

// Lấy thống kê từ database
async function getDocumentStats(category = null) {
  try {
    const query = category ? { category, status: 'ready' } : { status: 'ready' };
    const documents = await Document.find(query).select('title category uploadedAt');
    
    const stats = {
      total: documents.length,
      byCategory: {},
      recentDocuments: documents.slice(-5).reverse()
    };
    
    documents.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    return null;
  }
}

export async function processChat(message, conversationHistory) {
  try {
    console.log('🔄 Starting processChat...');
    
    // Kiểm tra câu hỏi chào hỏi hoặc chung chung
    const greetingResponse = handleGreetingOrGeneral(message);
    if (greetingResponse) {
      console.log('✅ Greeting response returned');
      return {
        message: greetingResponse,
        sources: []
      };
    }
    
    console.log('🔍 Analyzing intent...');
    // Phân tích intent
    const { isAnalysis, isAdvisory, isResponsibility, isArticleQuery, articleNumber, requestedCategory } = analyzeIntent(message);
    
    // Xác định mode dựa trên intent (khai báo sớm để dùng trong toàn bộ function)
    const mode = isAdvisory ? 'advisory' : isResponsibility ? 'responsibility' : 'general';
    console.log(`📋 Mode: ${mode}, Analysis: ${isAnalysis}, Article: ${isArticleQuery}`);
    
    // Nếu là câu hỏi về điều khoản cụ thể
    if (isArticleQuery && articleNumber) {
      console.log(`📖 Handling article query: ${articleNumber}`);
      return await handleArticleQuery(articleNumber, message, requestedCategory);
    }
    
    // Nếu là câu hỏi thống kê/phân tích
    if (isAnalysis) {
      console.log('📊 Handling analysis query...');
      try {
        const stats = await getDocumentStats(requestedCategory);
        
        if (!stats) {
          throw new Error('Không thể lấy thống kê');
        }
        
        // Tạo context từ thống kê
        const statsContext = `
Thống kê tài liệu${requestedCategory ? ` loại "${requestedCategory}"` : ''}:
- Tổng số: ${stats.total} tài liệu
- Phân loại:
${Object.entries(stats.byCategory).map(([cat, count]) => `  + ${cat}: ${count} tài liệu`).join('\n')}

Tài liệu gần đây:
${stats.recentDocuments.map((doc, idx) => `${idx + 1}. ${doc.title} (${doc.category})`).join('\n')}
`;
        
        const response = await generateAnalysisResponse(message, statsContext);
        
        return {
          message: response,
          sources: stats.recentDocuments.map(doc => ({
            title: doc.title,
            category: doc.category,
            documentId: doc._id
          }))
        };
      } catch (analysisError) {
        console.error('❌ Analysis failed:', analysisError);
        // Fallback to simple response
        return {
          message: 'Xin lỗi, hiện tại không thể thực hiện phân tích thống kê. Vui lòng thử lại sau.',
          sources: []
        };
      }
    }

    console.log('🔍 Searching documents...');
    // Tìm kiếm tài liệu liên quan (tăng số lượng nếu là câu hỏi tư vấn hoặc nhiệm vụ)
    const topK = isResponsibility ? 15 : isAdvisory ? 10 : 5;
    let searchResults;
    
    try {
      searchResults = await searchSimilarDocuments(message, topK, requestedCategory);
      console.log(`🔍 Tìm thấy ${searchResults.documents[0].length} chunks liên quan (mode: ${mode})`);
    } catch (vectorError) {
      console.warn('⚠️ Vector search failed, using fallback:', vectorError.message);
      
      // Fallback: Dùng kiến thức chung của AI
      console.log('🤖 Using AI general knowledge...');
      try {
        const fallbackMode = isAdvisory ? 'advisory' : isResponsibility ? 'responsibility' : 'general';
        const response = await generateResponse(
          message, 
          'Không tìm thấy thông tin trong tài liệu nội bộ. Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh.',
          requestedCategory,
          fallbackMode
        );
        
        return {
          message: response + '\n\n💡 *Lưu ý: Thông tin này dựa trên kiến thức chung, không có trong tài liệu nội bộ.*',
          sources: []
        };
      } catch (aiError) {
        console.error('❌ AI fallback failed:', aiError);
        return {
          message: 'Xin lỗi, hiện tại hệ thống gặp sự cố. Vui lòng thử lại sau.',
          sources: []
        };
      }
    }
    
    // Nếu không tìm thấy tài liệu liên quan, trả lời thân thiện
    if (!searchResults.documents[0] || searchResults.documents[0].length === 0) {
      console.log('📝 No documents found, using AI general knowledge...');
      
      try {
        // Tạo response từ kiến thức chung của AI
        const fallbackMode = isAdvisory ? 'advisory' : isResponsibility ? 'responsibility' : 'general';
        const response = await generateResponse(
          message, 
          'Không tìm thấy thông tin trong tài liệu nội bộ. Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh.',
          requestedCategory,
          fallbackMode
        );
        
        return {
          message: response + '\n\n💡 *Lưu ý: Thông tin này dựa trên kiến thức chung, không có trong tài liệu nội bộ. Để có thông tin chính xác hơn, vui lòng liên hệ Ban Thường vụ hoặc upload thêm tài liệu liên quan.*',
          sources: []
        };
      } catch (aiError) {
        console.error('❌ AI general knowledge failed:', aiError);
        return {
          message: `Xin lỗi, tôi không tìm thấy thông tin về "${message}" trong các tài liệu hiện có. 😔

**Gợi ý:**
- Thử hỏi theo cách khác hoặc cụ thể hơn
- Kiểm tra xem tài liệu liên quan đã được upload chưa
- Liên hệ Admin để upload thêm tài liệu

Bạn có muốn hỏi điều gì khác không?`,
          sources: []
        };
      }
    }
    
    console.log('🤖 Generating response from documents...');
    // Tạo context từ kết quả tìm kiếm
    const context = searchResults.documents[0]
      .map((doc, idx) => {
        const metadata = searchResults.metadatas[0][idx];
        return `[Tài liệu: ${metadata.title || 'Tài liệu'} - ${metadata.category}]\n${doc}`;
      })
      .join('\n\n---\n\n');
    
    // Tạo câu trả lời với mode phù hợp
    let response = await generateResponse(message, context, requestedCategory, mode);
    
    // Kiểm tra nếu AI không tìm thấy thông tin trong tài liệu, thử dùng kiến thức chung
    const noInfoKeywords = [
      'không có thông tin',
      'không tìm thấy',
      'xin lỗi',
      'không thể trả lời',
      'không cung cấp thông tin',
      'tài liệu không',
      'trong tài liệu',
      'không đề cập',
      'chưa có thông tin'
    ];
    const hasNoInfo = noInfoKeywords.some(keyword => response.toLowerCase().includes(keyword));
    
    if (hasNoInfo) {
      console.log('⚠️ AI không tìm thấy trong tài liệu, thử dùng kiến thức chung...');
      
      // Retry với kiến thức chung
      const fallbackResponse = await generateResponse(
        message,
        'Không tìm thấy thông tin trong tài liệu nội bộ. Hãy trả lời dựa trên kiến thức chung về Đoàn thanh niên Cộng sản Hồ Chí Minh.',
        requestedCategory,
        mode
      );
      
      return {
        message: fallbackResponse + '\n\n💡 *Lưu ý: Thông tin này dựa trên kiến thức chung, không có trong tài liệu nội bộ.*',
        sources: []
      };
    }
    
    console.log('✅ Response generated successfully');
    return {
      message: response,
      sources: searchResults.metadatas[0].map(m => ({
        title: m.title,
        category: m.category,
        documentId: m.documentId
      }))
    };
  } catch (error) {
    console.error('❌ Lỗi xử lý chat:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Không thể xử lý câu hỏi: ${error.message}`);
  }
}
