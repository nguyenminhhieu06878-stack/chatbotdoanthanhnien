import connectDB from '../lib/mongodb.js';
import Document from '../models/Document.js';

const sampleDocuments = [
  {
    title: "Hướng dẫn tổ chức sự kiện",
    filename: "sample-huong-dan-to-chuc-su-kien.txt",
    filepath: "/uploads/sample-huong-dan-to-chuc-su-kien.txt",
    fileType: ".txt",
    category: "Hướng dẫn",
    description: "Hướng dẫn chi tiết về cách tổ chức các sự kiện của Đoàn",
    content: `HƯỚNG DẪN TỔ CHỨC SỰ KIỆN ĐOÀN THANH NIÊN

1. CHUẨN BỊ SỰ KIỆN
- Xác định mục tiêu và đối tượng tham gia
- Lập kế hoạch chi tiết về thời gian, địa điểm
- Chuẩn bị ngân sách và nguồn lực cần thiết
- Phân công nhiệm vụ cụ thể cho từng thành viên

2. TRIỂN KHAI SỰ KIỆN
- Tuyên truyền và vận động đoàn viên tham gia
- Chuẩn bị cơ sở vật chất, trang thiết bị
- Tổ chức sự kiện theo đúng kế hoạch
- Đảm bảo an toàn và trật tự trong suốt quá trình

3. ĐÁNH GIÁ VÀ TỔNG KẾT
- Thu thập ý kiến phản hồi từ người tham gia
- Đánh giá hiệu quả và rút kinh nghiệm
- Lập báo cáo tổng kết gửi cấp trên
- Lưu trữ tài liệu và hình ảnh sự kiện`
  },
  {
    title: "Nhiệm vụ Ban Chấp hành",
    filename: "sample-nhiem-vu-ban-chap-hanh.txt",
    filepath: "/uploads/sample-nhiem-vu-ban-chap-hanh.txt",
    fileType: ".txt",
    category: "Văn bản",
    description: "Quy định về nhiệm vụ và trách nhiệm của Ban Chấp hành",
    content: `NHIỆM VỤ VÀ TRÁCH NHIỆM CỦA BAN CHẤP HÀNH ĐOÀN

1. NHIỆM VỤ CHÍNH
- Lãnh đạo và chỉ đạo hoạt động của tổ chức Đoàn
- Triển khai thực hiện các nghị quyết của Đại hội Đoàn
- Xây dựng kế hoạch hoạt động hàng năm
- Quản lý và phát triển đội ngũ đoàn viên

2. TRÁCH NHIỆM CỤ THỂ
- Tổ chức sinh hoạt định kỳ cho đoàn viên
- Giáo dục lý tưởng cách mạng cho thanh niên
- Phối hợp với các tổ chức khác trong hoạt động
- Báo cáo định kỳ với cấp ủy Đoàn cấp trên

3. QUYỀN HẠN
- Quyết định các vấn đề trong phạm vi thẩm quyền
- Khen thưởng và kỷ luật đoàn viên
- Đề xuất với cấp trên về nhân sự và tổ chức
- Quản lý tài chính và tài sản của tổ chức`
  },
  {
    title: "Nhiệm vụ Chi đoàn cơ sở",
    filename: "sample-nhiem-vu-chi-doan.txt",
    filepath: "/uploads/sample-nhiem-vu-chi-doan.txt",
    fileType: ".txt",
    category: "Văn bản",
    description: "Hướng dẫn về nhiệm vụ của Chi đoàn cơ sở",
    content: `NHIỆM VỤ CHI ĐOÀN CƠ SỞ

1. VỀ CÔNG TÁC TỔ CHỨC
- Phát triển đoàn viên mới đạt chất lượng
- Quản lý sổ sách, hồ sơ đoàn viên
- Tổ chức sinh hoạt chi đoàn định kỳ
- Đánh giá, xếp loại đoàn viên hàng năm

2. VỀ CÔNG TÁC GIÁO DỤC
- Giáo dục chính trị, tư tưởng cho đoàn viên
- Tuyên truyền chủ trương, chính sách của Đảng
- Giáo dục truyền thống cách mạng
- Nâng cao ý thức tổ chức kỷ luật

3. VỀ HOẠT ĐỘNG THỰC TIỄN
- Tổ chức các hoạt động văn hóa, thể thao
- Tham gia công tác xã hội, tình nguyện
- Hỗ trợ đoàn viên trong học tập, công việc
- Phối hợp với các tổ chức khác tại cơ sở`
  },
  {
    title: "Ý tưởng hoạt động Đoàn",
    filename: "sample-y-tuong-hoat-dong.txt",
    filepath: "/uploads/sample-y-tuong-hoat-dong.txt",
    fileType: ".txt",
    category: "Hướng dẫn",
    description: "Tổng hợp các ý tưởng hoạt động cho tổ chức Đoàn",
    content: `Ý TƯỞNG HOẠT ĐỘNG ĐOÀN THANH NIÊN

1. HOẠT ĐỘNG GIÁO DỤC CHÍNH TRỊ
- Tọa đàm về lịch sử Đảng, lịch sử Đoàn
- Hội thi tìm hiểu về Bác Hồ
- Sinh hoạt chuyên đề về thời sự
- Học tập và làm theo tư tưởng Hồ Chí Minh

2. HOẠT ĐỘNG VĂN HÓA - XÃ HỘI
- Tổ chức các buổi văn nghệ, ca nhạc
- Hội thi tài năng trẻ
- Giao lưu văn hóa giữa các chi đoàn
- Tham quan học tập tại các di tích lịch sử

3. HOẠT ĐỘNG TÌNH NGUYỆN
- Chiến dịch Mùa hè xanh
- Hoạt động Chủ nhật xanh
- Hỗ trợ người nghèo, người già neo đơn
- Bảo vệ môi trường, trồng cây xanh

4. HOẠT ĐỘNG THỂ THAO
- Giải bóng đá, bóng chuyền
- Hội thao truyền thống
- Chạy bộ vì sức khỏe cộng đồng
- Các môn thể thao dân tộc`
  }
];

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
    await connectDB();

    // Check if sample documents already exist
    const existingCount = await Document.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({ 
        message: 'Sample documents already exist',
        count: existingCount 
      });
    }

    // Create sample documents
    const createdDocs = await Document.insertMany(sampleDocuments);

    res.status(200).json({
      success: true,
      message: `Created ${createdDocs.length} sample documents`,
      documents: createdDocs.map(doc => ({
        id: doc._id,
        title: doc.title,
        category: doc.category
      }))
    });

  } catch (error) {
    console.error('Create samples error:', error);
    res.status(500).json({ 
      error: 'Failed to create sample documents: ' + error.message
    });
  }
}