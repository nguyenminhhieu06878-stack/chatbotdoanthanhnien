import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  MessageCircle, Loader2, Plus
} from 'lucide-react';
import api from '../config/api';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const CHAT_HISTORY_KEY = 'doan_chat_history';

function ChatPage() {
  const [messages, setMessages] = useState(() => {
    // Load lịch sử chat từ localStorage khi khởi tạo
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Lưu lịch sử chat vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Hàm xóa lịch sử và bắt đầu chat mới
  const handleNewChat = () => {
    if (messages.length > 0 && !confirm('Bạn có chắc muốn bắt đầu cuộc trò chuyện mới? Lịch sử hiện tại sẽ bị xóa.')) {
      return;
    }
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) {
      alert('Trình duyệt của bạn không hỗ trợ đọc văn bản');
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/chat-supabase', {
        message: input,
        conversationHistory: messages
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.message,
        sources: Array.isArray(response.data.sources) ? response.data.sources : []
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Bỏ auto speak - chỉ đọc khi user nhấn nút
    } catch (error) {
      console.error('Lỗi:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Quy định về hoạt động Đoàn thanh niên',
    'Hướng dẫn tổ chức sự kiện',
    'Thủ tục kết nạp đoàn viên mới',
    'Văn bản về công tác thanh niên'
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/logo-doan.png" alt="Logo Đoàn" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trợ lý AI Đoàn Thanh Niên</h1>
                <p className="text-sm text-gray-500">Hỗ trợ tra cứu văn bản, tài liệu 24/7</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                onClick={handleNewChat}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Chat mới</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-20 space-y-6"
            >
              <div className="inline-block">
                <img src="/logo-doan.png" alt="Logo Đoàn" className="w-32 h-32 object-contain" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                  Xin chào! <Sparkles className="w-8 h-8 text-yellow-500" />
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Tôi có thể giúp bạn tra cứu và hướng dẫn về các văn bản, tài liệu của Đoàn thanh niên.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <p className="text-sm mb-4 font-semibold text-blue-600 flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Câu hỏi gợi ý:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((q, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setInput(q)}
                      className="p-4 bg-white rounded-xl text-left text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 border border-gray-200 hover:border-blue-300"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600 mb-2" />
                      <span className="text-gray-700 font-medium">{q}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gray-100' 
                      : ''
                  }`}>
                    {msg.role === 'user' ? (
                      <span className="text-lg">👤</span>
                    ) : (
                      <img src="/logo-doan.png" alt="AI" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <Card className={`px-4 py-3 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-white'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-gray-700" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="leading-relaxed text-gray-700" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-3 text-gray-900" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-gray-900" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 mt-2 text-gray-900" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  <img src="/logo-doan.png" alt="AI" className="w-full h-full object-contain" />
                </div>
                <Card className="px-4 py-3 shadow-md bg-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={sendMessage}>
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              {/* Voice Input Button */}
              <Button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                variant="ghost"
                size="icon"
                className={isListening ? 'text-red-600 animate-pulse' : 'text-gray-600'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base"
                disabled={loading}
              />

              {/* Speak Button */}
              {messages.length > 0 && (
                <Button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : () => {
                    const lastBotMessage = [...messages].reverse().find(m => m.role === 'assistant');
                    if (lastBotMessage) speakText(lastBotMessage.content);
                  }}
                  disabled={loading}
                  variant="ghost"
                  size="icon"
                  className={isSpeaking ? 'text-green-600 animate-pulse' : 'text-gray-600'}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
                className="rounded-xl"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
          
          {/* Voice Status */}
          {(isListening || isSpeaking) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center"
            >
              <p className="text-xs font-medium text-blue-600 flex items-center justify-center gap-2">
                {isListening && (
                  <>
                    <Mic className="w-3 h-3 animate-pulse" />
                    Đang lắng nghe...
                  </>
                )}
                {isSpeaking && (
                  <>
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Đang đọc câu trả lời...
                  </>
                )}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
