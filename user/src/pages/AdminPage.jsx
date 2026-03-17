import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, LogOut, CheckCircle, Clock, 
  Eye, Trash2, X, FileType, Calendar, Tag, AlertCircle 
} from 'lucide-react';
import api, { railwayApi } from '../config/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

function AdminPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Chung',
    description: '',
    file: null
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadDocuments();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const loadDocuments = async () => {
    try {
      const response = await api.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Lỗi tải tài liệu:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', formData.file);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);

    try {
      console.log('Uploading file:', formData.file.name);
      
      // Use the Supabase upload endpoint
      const response = await api.post('/api/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      // Check if upload was successful
      if (response.data.success) {
        alert('✅ Upload file thành công!');
        setFormData({ title: '', category: 'Chung', description: '', file: null });
        document.getElementById('fileInput').value = '';
        loadDocuments(); // Refresh the document list immediately
      } else {
        alert('⚠️ Upload có vấn đề: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorData = error.response?.data;
      
      alert('❌ Lỗi upload file: ' + (errorData?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    try {
      await api.delete(`/api/documents/${id}`);
      alert('✅ Xóa thành công!');
      loadDocuments();
    } catch (error) {
      alert('❌ Lỗi xóa tài liệu');
    }
  };

  const handleViewDetail = (doc) => {
    setSelectedDocument(doc);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDocument(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({...formData, file: e.dataTransfer.files[0]});
    }
  };

  const categories = ['Chung', 'Văn bản', 'Hướng dẫn', 'Quy định', 'Thông báo', 'Nghị quyết'];

  const getCategoryVariant = (category) => {
    const variants = {
      'Chung': 'secondary',
      'Văn bản': 'default',
      'Hướng dẫn': 'success',
      'Quy định': 'default',
      'Thông báo': 'warning',
      'Nghị quyết': 'danger'
    };
    return variants[category] || 'secondary';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 flex items-center justify-center">
                <img src="/logo-doan.png" alt="Logo Đoàn" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quản lý Tài liệu</h1>
                <p className="text-sm text-gray-500">Hệ thống quản lý văn bản Đoàn thanh niên</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tổng tài liệu</p>
                    <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Sẵn sàng</p>
                    <p className="text-3xl font-bold text-green-600">
                      {documents.filter(d => d.status === 'ready').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Đang xử lý</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {documents.filter(d => d.status === 'processing').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Upload Tài liệu mới</CardTitle>
                  <CardDescription>Thêm tài liệu vào hệ thống</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Nhập tiêu đề tài liệu..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Mô tả ngắn gọn về tài liệu..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    File tài liệu <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      required
                    />
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      {formData.file ? (
                        <p className="text-green-600 font-medium">{formData.file.name}</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium mb-1">
                            Kéo thả file vào đây hoặc click để chọn
                          </p>
                          <p className="text-sm text-gray-500">
                            Hỗ trợ: PDF, Word (.doc, .docx), Text (.txt)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload tài liệu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Danh sách Tài liệu</CardTitle>
                    <CardDescription>{documents.length} tài liệu</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={loadDocuments}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileType className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">{doc.title}</h3>
                            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
                              <Badge variant={getCategoryVariant(doc.category)}>
                                <Tag className="w-3 h-3 mr-1" />
                                {doc.category}
                              </Badge>
                              <span className="text-gray-400">•</span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="text-gray-400">•</span>
                              {doc.status === 'ready' ? (
                                <Badge variant="success">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Sẵn sàng
                                </Badge>
                              ) : (
                                <Badge variant="warning">
                                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                                  Đang xử lý
                                </Badge>
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleViewDetail(doc)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          <Button
                            onClick={() => handleDelete(doc._id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {documents.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có tài liệu nào</p>
                    <p className="text-gray-400 text-sm mt-1">Hãy upload tài liệu đầu tiên của bạn</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedDocument.title}</h2>
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <Badge variant={getCategoryVariant(selectedDocument.category)} className="bg-white/20 text-white border-0">
                        {selectedDocument.category}
                      </Badge>
                      <span className="text-blue-100">
                        {new Date(selectedDocument.uploadedAt).toLocaleDateString('vi-VN')}
                      </span>
                      <Badge variant={selectedDocument.status === 'ready' ? 'success' : 'warning'} className="bg-white/20 text-white border-0">
                        {selectedDocument.status === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={closeDetailModal}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 140px)'}}>
                {selectedDocument.description && (
                  <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                    <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                    <p className="text-gray-700">{selectedDocument.description}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Thông tin file</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tên file:</span>
                          <p className="font-medium text-gray-900">{selectedDocument.filename}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Loại file:</span>
                          <p className="font-medium text-gray-900">{selectedDocument.fileType}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Kích thước:</span>
                          <p className="font-medium text-gray-900">
                            {(selectedDocument.fileSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày upload:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedDocument.uploadedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedDocument.content && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Nội dung văn bản</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                            {selectedDocument.content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedDocument.content && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>Nội dung văn bản chưa được trích xuất</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPage;
