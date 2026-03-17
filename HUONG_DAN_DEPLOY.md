# Hướng Dẫn Deploy Lên Railway và Vercel

## 🚂 PHẦN 1: Deploy Backend lên Railway

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [railway.app](https://railway.app)
2. Cài đặt Railway CLI (tùy chọn):
```bash
npm i -g @railway/cli
```

### Bước 2: Tạo Project trên Railway
1. Đăng nhập Railway: https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway sẽ tự động detect và deploy

### Bước 3: Cấu hình Environment Variables
Vào tab "Variables" và thêm các biến sau:

```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CHROMA_HOST=http://localhost:8000
```

**Lưu ý:** Thay thế các giá trị placeholder bằng thông tin thực tế của bạn.

### Bước 4: Cấu hình Root Directory
1. Vào "Settings" → "Service Settings"
2. Set "Root Directory" = `backend`
3. Set "Start Command" = `npm start`

### Bước 5: Deploy
1. Railway sẽ tự động deploy khi có thay đổi
2. Lấy URL backend từ "Settings" → "Domains"
3. URL sẽ có dạng: `https://your-app.railway.app`

### Lệnh CLI (Tùy chọn)
```bash
# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# Xem logs
railway logs
```

---

## ☁️ PHẦN 2: Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Cài đặt Vercel CLI:
```bash
npm i -g vercel
```

### Bước 2: Cấu hình Environment Variables
Cập nhật file `user/.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

**Thay `your-backend-url.railway.app` bằng URL backend từ Railway!**

### Bước 3: Deploy qua Vercel Dashboard
1. Đăng nhập: https://vercel.com
2. Click "Add New" → "Project"
3. Import repository của bạn
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `user`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Thêm Environment Variables:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app`

6. Click "Deploy"

### Bước 4: Deploy qua CLI
```bash
cd user

# Login
vercel login

# Deploy (production)
vercel --prod

# Hoặc deploy preview
vercel
```

---

## 🔧 Kiểm Tra Sau Deploy

### 1. Test Backend
```bash
curl https://your-backend-url.railway.app/api/health
```

### 2. Test Frontend
Mở trình duyệt: `https://your-app.vercel.app`

### 3. Kiểm tra kết nối
- Vào trang chat
- Thử upload tài liệu
- Thử chat với AI

---

## 🐛 Troubleshooting

### Backend không chạy trên Railway
1. Kiểm tra logs: `railway logs` hoặc xem trên Dashboard
2. Đảm bảo `Root Directory` = `backend`
3. Kiểm tra environment variables
4. Đảm bảo MongoDB URI đúng

### Frontend không kết nối được Backend
1. Kiểm tra `VITE_API_URL` trong Vercel
2. Đảm bảo backend đã enable CORS
3. Kiểm tra Network tab trong DevTools

### CORS Error
Backend đã cấu hình CORS, nhưng nếu vẫn lỗi:
- Kiểm tra file `backend/src/server.js`
- Đảm bảo frontend URL được allow

---

## 📝 Checklist Deploy

### Backend (Railway)
- [ ] Repository đã push lên GitHub
- [ ] Tạo project trên Railway
- [ ] Set Root Directory = `backend`
- [ ] Thêm environment variables
- [ ] Deploy thành công
- [ ] Lấy URL backend

### Frontend (Vercel)
- [ ] Cập nhật `user/.env.production` với backend URL
- [ ] Tạo project trên Vercel
- [ ] Set Root Directory = `user`
- [ ] Thêm `VITE_API_URL` environment variable
- [ ] Deploy thành công
- [ ] Test kết nối với backend

---

## 🚀 Auto Deploy

Cả Railway và Vercel đều hỗ trợ auto deploy:
- Mỗi khi push code lên GitHub
- Railway sẽ tự động deploy backend
- Vercel sẽ tự động deploy frontend

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Railway/Vercel Dashboard
2. Xem file `TONG_KET_CUOI_CUNG.md` để biết thêm chi tiết
3. Kiểm tra Network tab trong browser DevTools

---

## 🔐 Bảo Mật

**Quan trọng:** Không bao giờ commit API keys hoặc thông tin nhạy cảm vào Git!
- Sử dụng environment variables
- Thêm `.env` vào `.gitignore`
- Sử dụng placeholder trong documentation